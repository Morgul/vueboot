<template>
    <div role="tabpanel" class="tab-pane" :class="{ active: active }" :id="id">
        <slot></slot>
    </div>
</template>

<!--style lang="sass" src=""></style-->

<script type="text/babel">
    export default {
        props: {
            header: {
                type: String
            },
            disabled: {
                type: Boolean,
                default: false
            },
            onSelected: {
                type: Function,
                default: () => {}
            }
        },
        data: function()
        {
            return {
                id: '',
                _active: false
            };
        },
        computed: {
            active: {
                get: function(){ return this.$data._active; },
                set: function(val)
                {
                    this.$data._active = val;

                    if(val)
                    {
                        this.onSelected();
                    } // end if
                }
            }
        },
        compiled: function()
        {
            this.$parent.registerTab(this);
        },
        beforeDestroy: function()
        {
            this.$parent.removeTab(this);
        },
        ready: function()
        {
            // Support Header element
            var headerElem = $(this.$el).children('header:first-child');
            if(headerElem.html())
            {
                this.header = headerElem.html().trim();
                headerElem.remove();
            } // end if
        }
    }
</script>