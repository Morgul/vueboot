<template>
    <div class="modal" :class="{ fade: animation }" tabindex="-1" role="dialog" aria-hidden="true" :data-backdrop="backdrop.toString()" :data-keyboard="keyboard.toString()">
        <div class="modal-dialog" :class="modalClass" role="document" :style="{ 'max-width': width, width: width }">
            <div class="modal-content">
                <slot name="header"></slot>
                <slot name="body"></slot>
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    export default {
        inherit: true,
        props: {
            show: {
                type: Boolean,
                default: false,
                twoWay: true
            },
            animation: {
                type: Boolean,
                default: true
            },
            width: {
                type: String
            },
            backdrop: {
                default: true
            },
            keyboard: {
                type: Boolean,
                default: true
            },
            autoFocus: {
                type: String
            },
            modalClass: {
                type: String
            },
            onClosed: {
                type: Function,
                default: () => {}
            }
        },
        methods: {
            showModal: function()
            {
                this.show = true;
                $(this.$el).modal('show');
            },
            hideModal: function()
            {
                this.show = false;
                $(this.$el).modal('hide');
            },
            refresh: function()
            {
                $(this.$el).data('bs.modal').handleUpdate();
            }
        },
        watch: {
            show: function()
            {
                if(this.show)
                {
                    this.showModal();
                }
                else
                {
                    this.hideModal();
                } // end if
            }
        },
        ready: function()
        {
            $(this.$el).on('shown.bs.modal', () =>
            {
                if(this.autoFocus)
                {
                    var autoElem = $(this.autoFocus);
                    if(autoElem[0])
                    {
                        autoElem.focus();
                    }
                    else
                    {
                        console.warn(`[VueBoot] Autofocus selector '${this.autoFocus}' did not select an element.`);
                    } // end if
                } // end if
            });

            $(this.$el).on('hidden.bs.modal', (event) =>
            {
                this.show = false;
                this.onClosed();
            });
        }
    }
</script>