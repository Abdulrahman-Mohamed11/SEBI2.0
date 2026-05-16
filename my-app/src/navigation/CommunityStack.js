import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyIssuesScreen from '../screens/community/MyIssuesScreen';
import SubmitIssueScreen from '../screens/community/SubmitIssueScreen';
import IssueDetailScreen from '../screens/community/IssueDetailScreen';

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyIssues" component={MyIssuesScreen} options={{ title: 'My Issues' }} />
      <Stack.Screen name="SubmitIssue" component={SubmitIssueScreen} options={{ title: 'Submit Issue' }} />
      <Stack.Screen name="IssueDetail" component={IssueDetailScreen} options={{ title: 'Issue Detail' }} />
    </Stack.Navigator>
  );
}
