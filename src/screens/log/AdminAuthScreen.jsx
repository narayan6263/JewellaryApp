import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import InputBox from '../../components/common/InputBox';
import CommonButton from '../../components/common/buttons/CommonButton';
import ShowToast from '../../components/common/ShowToast';

const AdminAuthScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = () => {
    setLoading(true);
    // Replace '1234' with your actual admin PIN or authentication logic
    if (pin === '1234') {
      setLoading(false);
      navigation.replace('LogScreen');
    } else {
      setLoading(false);
      ShowToast('Invalid PIN');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Authentication</Text>
        <Text style={styles.subtitle}>Enter PIN to view system logs</Text>
        
        <InputBox
          name="pin"
          label="Admin PIN"
          value={pin}
          onChange={({ value }) => setPin(value)}
          placeholder="Enter PIN"
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
        />

        <CommonButton
          title="Submit"
          onPress={handlePinSubmit}
          isFilled={true}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center'
  }
});

export default AdminAuthScreen;
