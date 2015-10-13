/* Vuestrap v0.1.0 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vueboot = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    var __vue_template__ = "<div class=\"alert alert-{{ type }}\" :class=\"{ 'alert-dismissible': dismissible, fade: animation, in: animation }\" role=\"alert\">\n        <button v-if=\"dismissible\" type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n            <span aria-hidden=\"true\">×</span>\n            <span class=\"sr-only\">Close</span>\n        </button>\n        <slot></slot>\n    </div>";
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
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
            close: function close() {
                $(this.$el).alert('close');
            }
        },
        ready: function ready() {
            var _this = this;

            if (this.timeout > -1) {
                setTimeout(function () {
                    _this.close();
                }, this.timeout);
            } // end if

            $(this.$el).on('closed.bs.alert', function () {
                _this.onClosed();
            });
        }
    };
    module.exports = exports['default'];
    ;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;

},{}],2:[function(require,module,exports){
    var __vue_template__ = "<div class=\"modal\" :class=\"{ fade: animation }\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" data-backdrop=\"{{ backdrop }}\" data-keyboard=\"{{ keyboard }}\">\n        <div class=\"modal-dialog\" role=\"document\" :style=\"{ width: width }\">\n            <div class=\"modal-content\">\n                <slot name=\"header\"></slot>\n                <slot name=\"body\"></slot>\n                <slot name=\"footer\"></slot>\n            </div>\n        </div>\n    </div>";
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
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
                var autoElem = $(_this.autoFocus);
                if (autoElem[0]) {
                    autoElem.focus();
                } else {
                    console.warn('[VueBoot] Autofocus selector \'' + _this.autoFocus + '\' did not select an element.');
                } // end if
            });

            $(this.$el).on('hidden.bs.modal', function (event) {
                _this.show = false;
                _this.onClosed();
            });
        }
    };
    module.exports = exports['default'];
    ;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;

},{}],3:[function(require,module,exports){
    var __vue_template__ = "<ul class=\"nav nav-tabs\" role=\"tablist\">\n        <li class=\"nav-item\">\n            <a class=\"nav-link active\" href=\"#home\" role=\"tab\" data-toggle=\"tab\">Home</a>\n        </li>\n        <li class=\"nav-item\">\n            <a class=\"nav-link\" href=\"#profile\" role=\"tab\" data-toggle=\"tab\">Profile</a>\n        </li>\n        <li class=\"nav-item\">\n            <a class=\"nav-link\" href=\"#messages\" role=\"tab\" data-toggle=\"tab\">Messages</a>\n        </li>\n        <li class=\"nav-item\">\n            <a class=\"nav-link\" href=\"#settings\" role=\"tab\" data-toggle=\"tab\">Settings</a>\n        </li>\n    </ul>\n\n    <!-- Tab panes -->\n    <div class=\"tab-content\">\n        <div role=\"tabpanel\" class=\"tab-pane active\" id=\"home\">...</div>\n        <div role=\"tabpanel\" class=\"tab-pane\" id=\"profile\">...</div>\n        <div role=\"tabpanel\" class=\"tab-pane\" id=\"messages\">...</div>\n        <div role=\"tabpanel\" class=\"tab-pane\" id=\"settings\">...</div>\n    </div>";
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports["default"] = {
        inherit: true,
        props: {}
    };
    module.exports = exports["default"];
    ;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;

},{}],4:[function(require,module,exports){
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

    var _alertAlertVue = require("./alert/alert.vue");

    var _alertAlertVue2 = _interopRequireDefault(_alertAlertVue);

    var _modalModalVue = require("./modal/modal.vue");

    var _modalModalVue2 = _interopRequireDefault(_modalModalVue);

    var _tabsTabsVue = require("./tabs/tabs.vue");

    var _tabsTabsVue2 = _interopRequireDefault(_tabsTabsVue);

//----------------------------------------------------------------------------------------------------------------------

    exports["default"] = {
        alert: _alertAlertVue2["default"],
        modal: _modalModalVue2["default"],
        tabs: _tabsTabsVue2["default"]
    };

//----------------------------------------------------------------------------------------------------------------------
    module.exports = exports["default"];

},{"./alert/alert.vue":1,"./modal/modal.vue":2,"./tabs/tabs.vue":3}]},{},[4])(4)
});
