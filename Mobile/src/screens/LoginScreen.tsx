import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { UserContext } from '../context/UserContext';

export default function LoginScreen() {
  const { login } = useContext(UserContext);

  const handleLogin = () => {
    // giả lập login
    login({ id: '1', name: 'NTT', token: 'abc123' });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Đăng nhập</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
