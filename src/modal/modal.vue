<template>
    <div class="modal" :class="{ fade: animation }" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="{{ backdrop }}" data-keyboard="{{ keyboard }}">
        <div class="modal-dialog" role="document" :style="{ width: width }">
            <div class="modal-content">
                <slot name="header"></slot>
                <slot name="body"></slot>
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script type="text/babel" lang="es6">
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
                default: true
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
            $(this.$el).on('hidden.bs.modal', (event) =>
            {
                this.show = false;
                this.onClosed();
            });
        }
    }
</script>