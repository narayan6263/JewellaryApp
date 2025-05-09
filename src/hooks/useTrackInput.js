import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addActivityLog } from '../redux/slices/activityLogSlice';

export const useTrackInput = (screenName, fieldName) => {
    const dispatch = useDispatch();

    const trackInputChange = useCallback((value, oldValue) => {
        // Don't log if it's the initial value set
        if (oldValue === undefined) return;

        console.log('Tracking Input Change:', {
            screen: screenName,
            field: fieldName,
            oldValue,
            newValue: value
        });

        dispatch(addActivityLog({
            action: 'INPUT_CHANGE',
            description: `Changed ${fieldName} in ${screenName}`,
            details: {
                screen: screenName,
                field: fieldName,
                oldValue: oldValue || '',
                newValue: value || '',
                timestamp: new Date().toISOString()
            }
        }));
    }, [dispatch, screenName, fieldName]);

    return trackInputChange;
}; 