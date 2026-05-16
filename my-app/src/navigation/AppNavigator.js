import { COLORS } from '../constants/theme';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import CommunityStack from './CommunityStack';
import ManagerStack from './ManagerStack';
import WorkerStack from './WorkerStack';
import AdminStack from './AdminStack';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const renderStack = () => {
    if (!user) return <AuthStack />;
    switch (user.role) {
      case 'COMMUNITY_MEMBER': return <CommunityStack />;
      case 'FACILITY_MANAGER':  return <ManagerStack />;
      case 'WORKER':            return <WorkerStack />;
      case 'ADMIN':             return <AdminStack />;
      default:                  return <AuthStack />;
    }
  };

  return (
    <NavigationContainer>
      {renderStack()}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
