import { Stack } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

export default function MerchantLayout() {
  const { profile } = useUser();

  if (profile?.role !== 'merchant') {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#f8f9fa' },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Tableau de bord' }} 
      />
      <Stack.Screen 
        name="products" 
        options={{ title: 'Mes produits' }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ title: 'Commandes' }} 
      />
      <Stack.Screen 
        name="product-detail" 
        options={{ title: 'Détails du produit' }} 
      />
    </Stack>
  );
}
