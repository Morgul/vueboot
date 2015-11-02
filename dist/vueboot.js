/* VueBoot v0.2.0 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vueboot = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Vue // late bind
var map = Object.create(null)
var shimmed = false
var isBrowserify = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 * @param {Boolean} browserify
 */

exports.install = function (vue, browserify) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  isBrowserify = browserify

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] Vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeView(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addView(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  var Component = typeof options === 'function'
    ? options
    : Vue.extend(options)
  options = Component.options
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    makeOptionsHot(id, options)
    map[id] = {
      Component: Component,
      views: [],
      instances: []
    }
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  options.hotID = id
  injectHook(options, 'created', function () {
    map[id].instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    map[id].instances.$remove(this)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    console.log('[HMR] Root or manually-mounted instance modified. Full reload may be required.')
    if (!isBrowserify) {
      window.location.reload()
    } else {
      // browserify-hmr somehow sends incomplete bundle if we reload here
      return
    }
  }
  if (!isBrowserify) {
    // browserify-hmr already logs this
    console.log('[HMR] Updating component: ' + format(id))
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    // in case the user exports a constructor
    Component = record.Component = typeof newOptions === 'function'
      ? newOptions
      : Vue.extend(newOptions)
    makeOptionsHot(id, Component.options)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(function (view) {
    updateView(view, Component)
  })
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 * @param {Function} Component
 */

function updateView (view, Component) {
  if (!view._bound) {
    return
  }
  view.Component = Component
  view.hotUpdating = true
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = view.childVM.$data
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  view.childVM.$data = state
  // re-eanble transitions
  view.vm._isCompiled = true
  view.hotUpdating = false
}

function format (id) {
  return id.match(/[^\/]+\.vue$/)[0]
}

},{}],2:[function(_dereq_,module,exports){
var inserted = exports.cache = {}

exports.insert = function (css) {
  if (inserted[css]) return
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return elem
}

},{}],3:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {
    props: {
        type: {
            type: String,
            required: true
        },
        dismissible: {
            type: Boolean,
            'default': true
        },
        animation: {
            type: Boolean,
            'default': true
        },
        timeout: {
            type: Number,
            'default': -1
        },
        onClosed: {
            type: Function,
            'default': function _default() {}
        }
    },
    methods: {
        dismiss: function dismiss() {
            $(this.$el).alert('close');
        }
    },
    ready: function ready() {
        var _this = this;

        if (this.timeout >= 0) {
            setTimeout(function () {
                _this.dismiss();
            }, this.timeout);
        } // end if

        $(this.$el).on('closed.bs.alert', function () {
            _this.onClosed();
        });
    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"alert alert-{{ type }}\" :class=\"{ 'alert-dismissible': dismissible, fade: animation, in: animation }\" role=\"alert\">\n        <button v-if=\"dismissible\" type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n            <span aria-hidden=\"true\">×</span>\n            <span class=\"sr-only\">Close</span>\n        </button>\n        <slot></slot>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = _dereq_("vue-hot-reload-api")
  hotAPI.install(_dereq_("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/morgul/Development/vueboot/src/alert/alert.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":"vue","vue-hot-reload-api":1}],4:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {
    inherit: true,
    props: {
        show: {
            type: Boolean,
            'default': false,
            twoWay: true
        },
        animation: {
            type: Boolean,
            'default': true
        },
        width: {
            type: String
        },
        backdrop: {
            'default': true
        },
        keyboard: {
            type: Boolean,
            'default': true
        },
        autoFocus: {
            type: String
        },
        onClosed: {
            type: Function,
            'default': function _default() {}
        }
    },
    methods: {
        showModal: function showModal() {
            this.show = true;
            $(this.$el).modal('show');
        },
        hideModal: function hideModal() {
            this.show = false;
            $(this.$el).modal('hide');
        },
        refresh: function refresh() {
            $(this.$el).data('bs.modal').handleUpdate();
        }
    },
    watch: {
        show: function show() {
            if (this.show) {
                this.showModal();
            } else {
                this.hideModal();
            } // end if
        }
    },
    ready: function ready() {
        var _this = this;

        $(this.$el).on('shown.bs.modal', function () {
            if (_this.autoFocus) {
                var autoElem = $(_this.autoFocus);
                if (autoElem[0]) {
                    autoElem.focus();
                } else {
                    console.warn('[VueBoot] Autofocus selector \'' + _this.autoFocus + '\' did not select an element.');
                } // end if
            } // end if
        });

        $(this.$el).on('hidden.bs.modal', function (event) {
            _this.show = false;
            _this.onClosed();
        });
    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"modal\" :class=\"{ fade: animation }\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" data-backdrop=\"{{ backdrop }}\" data-keyboard=\"{{ keyboard }}\">\n        <div class=\"modal-dialog\" role=\"document\" :style=\"{ width: width }\">\n            <div class=\"modal-content\">\n                <slot name=\"header\"></slot>\n                <slot name=\"body\"></slot>\n                <slot name=\"footer\"></slot>\n            </div>\n        </div>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = _dereq_("vue-hot-reload-api")
  hotAPI.install(_dereq_("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/morgul/Development/vueboot/src/modal/modal.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":"vue","vue-hot-reload-api":1}],5:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = {
    props: {
        header: {
            type: String
        },
        disabled: {
            type: Boolean,
            'default': false
        },
        onSelected: {
            type: Function,
            'default': function _default() {}
        }
    },
    data: function data() {
        return {
            id: '',
            _active: false
        };
    },
    computed: {
        active: {
            get: function get() {
                return this.$data._active;
            },
            set: function set(val) {
                this.$data._active = val;

                if (val) {
                    this.onSelected();
                } // end if
            }
        }
    },
    compiled: function compiled() {
        this.$parent.registerTab(this);
    },
    ready: function ready() {
        // Support Header element
        var headerElem = $(this.$el).children('header:first-child');
        if (headerElem.html()) {
            this.header = headerElem.html().trim();
            headerElem.remove();
        } // end if
    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div role=\"tabpanel\" class=\"tab-pane\" :class=\"{ active: active }\" :id=\"id\">\n        <slot></slot>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = _dereq_("vue-hot-reload-api")
  hotAPI.install(_dereq_("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/morgul/Development/vueboot/src/tabs/tab.vue"
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":"vue","vue-hot-reload-api":1}],6:[function(_dereq_,module,exports){
var __vueify_style__ = _dereq_("vueify-insert-css").insert("/* line 6, stdin */\n.card .tabset .nav-tabs {\n  padding-top: 1.25rem;\n  padding-left: 1.25rem; }\n\n/* line 11, stdin */\n.card .tabset .tab-content {\n  padding: .5rem 1.25rem 1.25rem; }\n\n/* line 16, stdin */\n.card .tabset.tabs-left .nav-tabs {\n  padding-bottom: 1.25rem; }\n\n/* line 19, stdin */\n.card .tabset.tabs-left .tab-content {\n  padding: 1.25rem 1.25rem 1.25rem 0; }\n\n/* line 25, stdin */\n.card .tabset.tabs-right .nav-tabs {\n  padding-top: 1.25rem;\n  padding-left: 0;\n  padding-right: 1.25rem;\n  padding-bottom: 1.25rem; }\n\n/* line 31, stdin */\n.card .tabset.tabs-right .tab-content {\n  padding: 1.25rem 0 1.25rem 1.25rem; }\n\n/* line 37, stdin */\n.card .tabset.tabs-bottom .nav-tabs {\n  padding-top: 0;\n  padding-bottom: 1.25rem;\n  padding-left: 1.25rem; }\n\n/* line 42, stdin */\n.card .tabset.tabs-bottom .tab-content {\n  padding: 1.25rem 1.25rem .5rem 1.25rem; }\n\n/* line 54, stdin */\n.tabs-bottom .nav-tabs, .tabs-right .nav-tabs, .tabs-left .nav-tabs {\n  border-bottom: 0; }\n\n/* line 59, stdin */\n.tab-content > .tab-pane,\n.pill-content > .pill-pane {\n  display: none; }\n\n/* line 64, stdin */\n.tab-content > .active,\n.pill-content > .active {\n  display: block; }\n\n/* line 70, stdin */\n.tabs-bottom > .nav-tabs {\n  border-top: 1px solid #ddd; }\n  /* line 73, stdin */\n  .tabs-bottom > .nav-tabs > li {\n    margin-top: -1px;\n    margin-bottom: 0; }\n    /* line 77, stdin */\n    .tabs-bottom > .nav-tabs > li > a {\n      -webkit-border-radius: 0 0 4px 4px;\n      -moz-border-radius: 0 0 4px 4px;\n      border-radius: 0 0 4px 4px; }\n      /* line 82, stdin */\n      .tabs-bottom > .nav-tabs > li > a:hover, .tabs-bottom > .nav-tabs > li > a:focus {\n        border-bottom-color: #ddd;\n        border-top-color: transparent; }\n      /* line 88, stdin */\n      .tabs-bottom > .nav-tabs > li > a.active, .tabs-bottom > .nav-tabs > li > a.active:hover, .tabs-bottom > .nav-tabs > li > a.active:focus {\n        border-color: transparent #ddd #ddd #ddd;\n        *border-top-color: #fff; }\n\n/* line 98, stdin */\n.tabs-left, .tabs-right {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex; }\n  /* line 101, stdin */\n  .tabs-left > .nav-tabs, .tabs-right > .nav-tabs {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1 1 auto;\n        -ms-flex: 1 1 auto;\n            flex: 1 1 auto;\n    white-space: nowrap;\n    float: none; }\n  /* line 107, stdin */\n  .tabs-left .tab-content, .tabs-right .tab-content {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1 1 100%;\n        -ms-flex: 1 1 100%;\n            flex: 1 1 100%; }\n  /* line 111, stdin */\n  .tabs-left > .nav-tabs > li, .tabs-right > .nav-tabs > li {\n    float: none; }\n    /* line 114, stdin */\n    .tabs-left > .nav-tabs > li > a, .tabs-right > .nav-tabs > li > a {\n      min-width: 74px;\n      margin-right: 0;\n      margin-bottom: 3px; }\n  /* line 121, stdin */\n  .tabs-left .nav-tabs .nav-item + .nav-item, .tabs-right .nav-tabs .nav-item + .nav-item {\n    margin-left: 0; }\n\n/* line 126, stdin */\n.tabs-left > .nav-tabs {\n  float: left;\n  margin-right: 19px;\n  border-right: 1px solid #ddd; }\n  /* line 131, stdin */\n  .tabs-left > .nav-tabs > li > a {\n    margin-right: -1px;\n    -webkit-border-radius: 4px 0 0 4px;\n    -moz-border-radius: 4px 0 0 4px;\n    border-radius: 4px 0 0 4px; }\n    /* line 137, stdin */\n    .tabs-left > .nav-tabs > li > a:hover, .tabs-left > .nav-tabs > li > a:focus {\n      border-color: #eee #ddd #eee #eee; }\n    /* line 142, stdin */\n    .tabs-left > .nav-tabs > li > a.active, .tabs-left > .nav-tabs > li > a.active:hover, .tabs-left > .nav-tabs > li > a.active:focus {\n      border-color: #ddd transparent #ddd #ddd;\n      *border-right-color: #fff; }\n\n/* line 150, stdin */\n.tabs-right > .nav-tabs {\n  float: right;\n  margin-left: 19px;\n  border-left: 1px solid #ddd; }\n  /* line 155, stdin */\n  .tabs-right > .nav-tabs > li > a {\n    margin-left: -1px;\n    -webkit-border-radius: 0 4px 4px 0;\n    -moz-border-radius: 0 4px 4px 0;\n    border-radius: 0 4px 4px 0; }\n    /* line 161, stdin */\n    .tabs-right > .nav-tabs > li > a:hover, .tabs-right > .nav-tabs > li > a:focus {\n      border-color: #eee #eee #eee #ddd; }\n    /* line 166, stdin */\n    .tabs-right > .nav-tabs > li > a.active, .tabs-right > .nav-tabs > li > a.active:hover, .tabs-right > .nav-tabs > li > a.active:focus {\n      border-color: #ddd #ddd #ddd transparent;\n      *border-left-color: #fff; }\n\n/* line 174, stdin */\n.tabs-left .tab-pane,\n.tabs-right .tab-pane {\n  overflow-y: auto; }\n")
'use strict';

exports.__esModule = true;
exports['default'] = {
    props: {
        orientation: {
            type: String,
            'default': 'top'
        }
    },
    data: function data() {
        return {
            tabs: []
        };
    },
    methods: {
        orientationClass: function orientationClass() {
            return 'tabs-' + this.orientation;
        },
        activateTab: function activateTab(index) {
            var tab = this.tabs[index];

            if (tab && !tab.disabled) {
                if (index == 'first') {
                    index = 0;
                } else if (index == 'last') {
                    index = this.tabs.length - 1;
                } // end if

                this.tabs.forEach(function (tab, idx) {
                    tab.active = idx === index;
                });
            } // end if
        },
        registerTab: function registerTab(tab) {
            tab.id = this.tabs.length;
            tab.active = this.tabs.length === 0;

            this.tabs.push(tab);
        }
    }
};
module.exports = exports['default'];
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n    <div class=\"tabset clearfix\" :class=\"orientationClass()\">\n        <!-- Nav tabs -->\n        <ul v-if=\"orientation != 'bottom' &amp;&amp; orientation != 'right'\" class=\"nav nav-tabs\" role=\"tablist\">\n            <li class=\"nav-item\" v-for=\"tab in tabs\">\n                <a class=\"nav-link\" :class=\"{ active: tab.active, disabled: tab.disabled }\" href=\"#{{ $index }}\" role=\"tab\" data-toggle=\"tab\" @click.stop.prevent=\"activateTab($index)\">{{{ tab.header }}}</a>\n            </li>\n        </ul>\n\n        <!-- Tab panes -->\n        <div class=\"tab-content\">\n            <slot></slot>\n        </div>\n\n        <!-- Nav tabs -->\n        <ul v-if=\"orientation == 'bottom' || orientation == 'right'\" class=\"nav nav-tabs\" role=\"tablist\">\n            <li class=\"nav-item\" v-for=\"tab in tabs\">\n                <a class=\"nav-link\" :class=\"{ active: tab.active, disabled: tab.disabled }\" href=\"#{{ $index }}\" role=\"tab\" data-toggle=\"tab\" @click.stop.prevent=\"activateTab($index)\">{{{ tab.header }}}</a>\n            </li>\n        </ul>\n    </div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = _dereq_("vue-hot-reload-api")
  hotAPI.install(_dereq_("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/Users/morgul/Development/vueboot/src/tabs/tabset.vue"
  module.hot.dispose(function () {
    _dereq_("vueify-insert-css").cache["/* line 6, stdin */\n.card .tabset .nav-tabs {\n  padding-top: 1.25rem;\n  padding-left: 1.25rem; }\n\n/* line 11, stdin */\n.card .tabset .tab-content {\n  padding: .5rem 1.25rem 1.25rem; }\n\n/* line 16, stdin */\n.card .tabset.tabs-left .nav-tabs {\n  padding-bottom: 1.25rem; }\n\n/* line 19, stdin */\n.card .tabset.tabs-left .tab-content {\n  padding: 1.25rem 1.25rem 1.25rem 0; }\n\n/* line 25, stdin */\n.card .tabset.tabs-right .nav-tabs {\n  padding-top: 1.25rem;\n  padding-left: 0;\n  padding-right: 1.25rem;\n  padding-bottom: 1.25rem; }\n\n/* line 31, stdin */\n.card .tabset.tabs-right .tab-content {\n  padding: 1.25rem 0 1.25rem 1.25rem; }\n\n/* line 37, stdin */\n.card .tabset.tabs-bottom .nav-tabs {\n  padding-top: 0;\n  padding-bottom: 1.25rem;\n  padding-left: 1.25rem; }\n\n/* line 42, stdin */\n.card .tabset.tabs-bottom .tab-content {\n  padding: 1.25rem 1.25rem .5rem 1.25rem; }\n\n/* line 54, stdin */\n.tabs-bottom .nav-tabs, .tabs-right .nav-tabs, .tabs-left .nav-tabs {\n  border-bottom: 0; }\n\n/* line 59, stdin */\n.tab-content > .tab-pane,\n.pill-content > .pill-pane {\n  display: none; }\n\n/* line 64, stdin */\n.tab-content > .active,\n.pill-content > .active {\n  display: block; }\n\n/* line 70, stdin */\n.tabs-bottom > .nav-tabs {\n  border-top: 1px solid #ddd; }\n  /* line 73, stdin */\n  .tabs-bottom > .nav-tabs > li {\n    margin-top: -1px;\n    margin-bottom: 0; }\n    /* line 77, stdin */\n    .tabs-bottom > .nav-tabs > li > a {\n      -webkit-border-radius: 0 0 4px 4px;\n      -moz-border-radius: 0 0 4px 4px;\n      border-radius: 0 0 4px 4px; }\n      /* line 82, stdin */\n      .tabs-bottom > .nav-tabs > li > a:hover, .tabs-bottom > .nav-tabs > li > a:focus {\n        border-bottom-color: #ddd;\n        border-top-color: transparent; }\n      /* line 88, stdin */\n      .tabs-bottom > .nav-tabs > li > a.active, .tabs-bottom > .nav-tabs > li > a.active:hover, .tabs-bottom > .nav-tabs > li > a.active:focus {\n        border-color: transparent #ddd #ddd #ddd;\n        *border-top-color: #fff; }\n\n/* line 98, stdin */\n.tabs-left, .tabs-right {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex; }\n  /* line 101, stdin */\n  .tabs-left > .nav-tabs, .tabs-right > .nav-tabs {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1 1 auto;\n        -ms-flex: 1 1 auto;\n            flex: 1 1 auto;\n    white-space: nowrap;\n    float: none; }\n  /* line 107, stdin */\n  .tabs-left .tab-content, .tabs-right .tab-content {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1 1 100%;\n        -ms-flex: 1 1 100%;\n            flex: 1 1 100%; }\n  /* line 111, stdin */\n  .tabs-left > .nav-tabs > li, .tabs-right > .nav-tabs > li {\n    float: none; }\n    /* line 114, stdin */\n    .tabs-left > .nav-tabs > li > a, .tabs-right > .nav-tabs > li > a {\n      min-width: 74px;\n      margin-right: 0;\n      margin-bottom: 3px; }\n  /* line 121, stdin */\n  .tabs-left .nav-tabs .nav-item + .nav-item, .tabs-right .nav-tabs .nav-item + .nav-item {\n    margin-left: 0; }\n\n/* line 126, stdin */\n.tabs-left > .nav-tabs {\n  float: left;\n  margin-right: 19px;\n  border-right: 1px solid #ddd; }\n  /* line 131, stdin */\n  .tabs-left > .nav-tabs > li > a {\n    margin-right: -1px;\n    -webkit-border-radius: 4px 0 0 4px;\n    -moz-border-radius: 4px 0 0 4px;\n    border-radius: 4px 0 0 4px; }\n    /* line 137, stdin */\n    .tabs-left > .nav-tabs > li > a:hover, .tabs-left > .nav-tabs > li > a:focus {\n      border-color: #eee #ddd #eee #eee; }\n    /* line 142, stdin */\n    .tabs-left > .nav-tabs > li > a.active, .tabs-left > .nav-tabs > li > a.active:hover, .tabs-left > .nav-tabs > li > a.active:focus {\n      border-color: #ddd transparent #ddd #ddd;\n      *border-right-color: #fff; }\n\n/* line 150, stdin */\n.tabs-right > .nav-tabs {\n  float: right;\n  margin-left: 19px;\n  border-left: 1px solid #ddd; }\n  /* line 155, stdin */\n  .tabs-right > .nav-tabs > li > a {\n    margin-left: -1px;\n    -webkit-border-radius: 0 4px 4px 0;\n    -moz-border-radius: 0 4px 4px 0;\n    border-radius: 0 4px 4px 0; }\n    /* line 161, stdin */\n    .tabs-right > .nav-tabs > li > a:hover, .tabs-right > .nav-tabs > li > a:focus {\n      border-color: #eee #eee #eee #ddd; }\n    /* line 166, stdin */\n    .tabs-right > .nav-tabs > li > a.active, .tabs-right > .nav-tabs > li > a.active:hover, .tabs-right > .nav-tabs > li > a.active:focus {\n      border-color: #ddd #ddd #ddd transparent;\n      *border-left-color: #fff; }\n\n/* line 174, stdin */\n.tabs-left .tab-pane,\n.tabs-right .tab-pane {\n  overflow-y: auto; }\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, module.exports.template)
  }
})()}
},{"vue":"vue","vue-hot-reload-api":1,"vueify-insert-css":2}],7:[function(_dereq_,module,exports){
//----------------------------------------------------------------------------------------------------------------------
/// Main VueBoot module
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _alertAlertVue = _dereq_("./alert/alert.vue");

var _alertAlertVue2 = _interopRequireDefault(_alertAlertVue);

var _modalModalVue = _dereq_("./modal/modal.vue");

var _modalModalVue2 = _interopRequireDefault(_modalModalVue);

var _tabsTabsetVue = _dereq_("./tabs/tabset.vue");

var _tabsTabsetVue2 = _interopRequireDefault(_tabsTabsetVue);

var _tabsTabVue = _dereq_("./tabs/tab.vue");

var _tabsTabVue2 = _interopRequireDefault(_tabsTabVue);

//----------------------------------------------------------------------------------------------------------------------

exports["default"] = {
    alert: _alertAlertVue2["default"],
    modal: _modalModalVue2["default"],
    tabset: _tabsTabsetVue2["default"],
    tab: _tabsTabVue2["default"]
};

//----------------------------------------------------------------------------------------------------------------------
module.exports = exports["default"];

},{"./alert/alert.vue":3,"./modal/modal.vue":4,"./tabs/tab.vue":5,"./tabs/tabset.vue":6}]},{},[7])(7)
});