import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { getToken, clearAuthData } from '@/src/utils/api';

const AuthDecisionScreen = ({ navigation }) => {
    const [status, setStatus] = useState('Checking authentication...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuthStatusAndNavigate = async () => {
            try {
                setStatus('Checking authentication...');

                // Add a small delay to ensure UI is visible
                await new Promise(resolve => setTimeout(resolve, 300));

                const token = await getToken();
                console.log('Auth check token:', token ? 'exists' : 'not found');

                if (token && token.token) {
                    setStatus('Authentication valid');
                    if (token?.is_mpin == 1) {
                        navigation.replace('Auth');
                    } else {
                        navigation.replace('Main');
                    }
                } else {
                    console.log('No valid token found');
                    setStatus('No authentication found');
                    // Clear any potentially corrupt token data
                    await clearAuthData();
                    await new Promise(resolve => setTimeout(resolve, 300));
                    navigation.replace('Auth');
                }
            } catch (error) {
                console.error('Auth decision error:', error);
                setError(error.message);
                setStatus('Authentication error');

                // Clear any potentially corrupt token data
                await clearAuthData();

                // Always navigate to Auth on error after a brief delay
                await new Promise(resolve => setTimeout(resolve, 500));
                navigation.replace('Auth');
            }
        };

        checkAuthStatusAndNavigate();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0056b3" />
            <Text style={styles.statusText}>{status}</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20
    },
    statusText: {
        marginTop: 20,
        fontSize: 16,
        color: '#333'
    },
    errorText: {
        marginTop: 10,
        color: 'red',
        fontSize: 14
    }
});

export default AuthDecisionScreen; 