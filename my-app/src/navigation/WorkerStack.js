import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignedIssuesScreen from '../screens/worker/AssignedIssuesScreen';
import WorkerIssueScreen from '../screens/worker/WorkerIssueScreen';

const Stack = createNativeStackNavigator();

export default function WorkerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AssignedIssues" component={AssignedIssuesScreen} options={{ title: 'Assigned Issues' }} />
      <Stack.Screen name="WorkerIssue" component={WorkerIssueScreen} options={{ title: 'Issue Details' }} />
    </Stack.Navigator>
  );
}
