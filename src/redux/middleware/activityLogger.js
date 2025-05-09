import { addActivityLog } from '../slices/activityLogSlice';

const activityLogger = store => next => action => {
    console.log('Action received:', action.type);

    // Actions to track (add more as needed)
    const trackableActions = {
        'INPUT_CHANGE': 'Input field changed',
        // User related
        'userSlices/updateProfile': 'Updated profile information',
        'userSlices/addContact': 'Added new contact',
        'userSlices/updateContact': 'Updated contact information',
        'userSlices/deleteContact': 'Deleted contact',
        
        // Products related
        'productSlices/addProduct': 'Added new product',
        'productSlices/updateProduct': 'Updated product information',
        'productSlices/deleteProduct': 'Deleted product',
        'productSlices/updateStock': 'Updated product stock',
        
        // Bills/Invoices related
        'billSlices/createBill': 'Created new bill',
        'billSlices/updateBill': 'Updated bill',
        'billSlices/deleteBill': 'Deleted bill',
        
        // Settings related
        'settingSlices/updateSettings': 'Updated application settings',
        'settingSlices/updateBusinessInfo': 'Updated business information',
        
        // Groups related
        'groupSlices/createGroup': 'Created new group',
        'groupSlices/updateGroup': 'Updated group',
        'groupSlices/deleteGroup': 'Deleted group'
    };

    // Check if this action should be tracked
    if (trackableActions[action.type]) {
        console.log('Tracking action:', action.type);
        const activity = {
            action: action.type,
            description: trackableActions[action.type],
            details: action.payload,
            user: store.getState().userSlices?.profileData?.name || 'Unknown User'
        };
        
        store.dispatch(addActivityLog(activity));
    }

    return next(action);
};

export default activityLogger; 