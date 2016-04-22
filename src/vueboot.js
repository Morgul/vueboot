//----------------------------------------------------------------------------------------------------------------------
/// Main VueBoot module
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

import alert from "./alert/alert.vue";
import toast from "./toast/toast.vue";
import toastService from "./toast/toastSvc";
import modal from "./modal/modal.vue";
import tabset from "./tabs/tabset.vue";
import tab from "./tabs/tab.vue";

//----------------------------------------------------------------------------------------------------------------------

// Use node-style export to allow global vueboot object to work correctly.
module.exports = {
    alert,
    toast,
    toastService,
    modal,
    tabset,
    tab
};

//----------------------------------------------------------------------------------------------------------------------