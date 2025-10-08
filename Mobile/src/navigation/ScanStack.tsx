import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScanScreen from '../screens/ScanScreen';

export type ScanStackParamList = {
  ScanScreen: undefined;
};

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#fff', // Màu chữ tiêu đề và icon (back)
        headerStyle: { backgroundColor: '#68f1efff' }, // Màu nền header
        headerTitleStyle: { fontWeight: 'bold', fontSize: 22 }, // style riêng cho text
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="ScanScreen" component={ScanScreen} options={{ title: 'Scan' }}  />
    </Stack.Navigator>
  );
}
