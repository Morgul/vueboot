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
        }
    },
    components: {
        alert: vueboot.alert,
        modal: vueboot.modal,
        tabset: vueboot.tabs,
        tab: vueboot.tab
    }
});

//----------------------------------------------------------------------------------------------------------------------
