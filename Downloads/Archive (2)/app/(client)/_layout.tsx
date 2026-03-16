import { Stack } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { Redirect } from 'expo-router';

export default function ClientLayout() {
  const { profile } = useUser();

  if (profile?.role !== 'client') {
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
        options={{ title: 'Parcourir les produits' }} 
      />
      <Stack.Screen 
        name="cart" 
        options={{ title: 'Mon panier' }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ title: 'Mes commandes' }} 
      />
      <Stack.Screen 
        name="product-detail" 
        options={{ title: 'Détails du produit' }} 
      />
    </Stack>
  );
}
