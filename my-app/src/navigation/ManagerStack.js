import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllIssuesScreen from '../screens/manager/AllIssuesScreen';
import IssueManageScreen from '../screens/manager/IssueManageScreen';

const Stack = createNativeStackNavigator();

export default function ManagerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AllIssues" component={AllIssuesScreen} options={{ title: 'All Issues' }} />
      <Stack.Screen name="IssueManage" component={IssueManageScreen} options={{ title: 'Manage Issue' }} />
    </Stack.Navigator>
  );
}
