//----------------------------------------------------------------------------------------------------------------------
/// ToastService
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';

//----------------------------------------------------------------------------------------------------------------------

class ToastService {
    constructor()
    {
        this.state = {
            toasts: []
        };
    } // end constructor

    create(toast)
    {
        if(_.isString(toast))
        {
            toast = { content: toast };
        } // end if

        toast = _.defaults({}, toast, {
            type: 'info',
            dismissible: false,
            timeout: 5000
        });

        // If timeout is any falsey value (including 0!), we count it as disabling the timeout.
        if(!toast.timeout)
        {
            toast.timeout = -1;
        } // end if

        this.state.toasts.push(toast);
    } // end create
} // end ToastService

//----------------------------------------------------------------------------------------------------------------------

export default new ToastService();

//----------------------------------------------------------------------------------------------------------------------