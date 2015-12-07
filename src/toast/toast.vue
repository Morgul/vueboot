<template>
    <div class="toast-container">
        <alert :type="toast.type" :dismissible="toast.dismissible" :timeout="toast.timeout" :onClose="removeToast(toast)" v-for="toast in toasts">{{{ toast.content }}}</alert>
    </div>
</template>

<script type="text/babel">
    import toastSvc from './toastSvc';
    import alert from '../alert/alert.vue';

    export default {
        components: {
            alert
        },
        data: function()
        {
            return {
                state: toastSvc.state
            };
        },
        computed: {
            toasts: function()
            {
                return this.state.toasts;
            }
        },
        methods: {
            removeToast: function(toast)
            {
                return () => { this.state.toasts.$remove(toast) };
            }
        }
    }
</script>