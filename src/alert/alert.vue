<template>
    <div class="alert" :class="'alert-' + type" :class="{ 'alert-dismissible': dismissible, fade: animation, in: animation }" role="alert">
        <button v-if="dismissible" type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            <span class="sr-only">Close</span>
        </button>
        <slot></slot>
    </div>
</template>

<script type="text/babel">
    export default {
        props: {
            type: {
                type: String,
                required: true
            },
            dismissible: {
                type: Boolean,
                default: true
            },
            animation: {
                type: Boolean,
                default: true
            },
            timeout: {
                type: Number,
                default: -1
            },
            onClosed: {
                type: Function,
                default: () => {}
            }
        },
        methods: {
            dismiss: function()
            {
                $(this.$el).alert('close');
            }
        },
        ready: function()
        {
            if(this.timeout >= 0)
            {
                setTimeout(() => { this.dismiss() }, this.timeout)
            } // end if

            $(this.$el).on('closed.bs.alert', () =>
            {
                this.onClosed();
            });
        }
    }
</script>