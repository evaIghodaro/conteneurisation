import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Marketplace' }} />
        <Stack.Screen
          name="login"
          options={{ title: 'Connexion', headerShown: false }}
        />
        <Stack.Screen
          name="register"
          options={{ title: 'Inscription', headerShown: false }}
        />
        <Stack.Screen
          name="(merchant)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(client)"
          options={{ headerShown: false }}
        />
      </Stack>
    </UserProvider>
  );
}
