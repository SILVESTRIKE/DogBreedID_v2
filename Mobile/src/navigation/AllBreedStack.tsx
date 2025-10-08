import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllBreedScreen from '../screens/AllBreedScreen';


export type AllBreedStackParamList = {
  AllBreedScreen: undefined;

};

const Stack = createNativeStackNavigator<AllBreedStackParamList>();

export default function AllBreedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AllBreedScreen" component={AllBreedScreen} />
    </Stack.Navigator>
  );
}
