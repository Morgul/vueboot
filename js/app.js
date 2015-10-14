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
        }
    },
    components: {
        alert: vueboot.alert,
        modal: vueboot.modal
    }
});

//----------------------------------------------------------------------------------------------------------------------
