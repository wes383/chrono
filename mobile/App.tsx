import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { useSchedule } from './src/context/useSchedule';
import { AuthScreen } from './src/components/AuthScreen';
import { HomeScreen } from './src/components/HomeScreen';

function AppContent() {
  const { user, loading } = useSchedule();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ScheduleProvider>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <StatusBar style="dark" />
          <AppContent />
        </SafeAreaView>
      </ScheduleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
  },
});
