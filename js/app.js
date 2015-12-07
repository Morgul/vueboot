//----------------------------------------------------------------------------------------------------------------------
// Main VueBoot code
//----------------------------------------------------------------------------------------------------------------------

var app = new Vue({
    debug: true,
    el: '#example-app',
    data: {
        showTimedAlert: false
    },
    methods: {
        showModal: function(name)
        {
            this.$refs[name].showModal();
        },
        hideModal: function(name)
        {
            this.$refs[name].hideModal();
        },
        showAlert: function(){ this.showTimedAlert = true; },
        onClosed: function()
        {
            console.log('onClosed!');
            this.showTimedAlert = false;
        },
        showAlertTab: function()
        {
            alert('Got Clicked!');
        },
        createToast: function(toast)
        {
            vueboot.toastService.create(toast);
        }
    },
    components: {
        alert: vueboot.alert,
        toast: vueboot.toast,
        modal: vueboot.modal,
        tabset: vueboot.tabset,
        tab: vueboot.tab
    }
});

//----------------------------------------------------------------------------------------------------------------------
