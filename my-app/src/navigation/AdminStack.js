import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
    </Stack.Navigator>
  );
}
