import { useUser } from '@/contexts/UserContext';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

export default function Index() {
  const { current, profile, isLoaded, logout } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
          Plateforme de Commande
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 30, textAlign: 'center', color: '#666' }}>
          Achetez et vendez des produits avec retrait en magasin
        </Text>
        
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#2563eb', 
            padding: 15, 
            borderRadius: 8, 
            marginBottom: 15,
            width: '100%'
          }}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Commencer
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ 
            borderWidth: 1, 
            borderColor: '#2563eb', 
            padding: 15, 
            borderRadius: 8,
            width: '100%'
          }}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#2563eb', textAlign: 'center', fontWeight: 'bold' }}>
            Connexion
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Redirect based on user role
  if (profile?.role === 'merchant') {
    return <Redirect href="/(merchant)" />;
  } else if (profile?.role === 'client') {
    return <Redirect href="/(client)" />;
  } else {
    // Fallback - show role selection if no role
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Profil incomplet
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
          Veuillez vous déconnecter et vous reconnecter
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#2563eb', 
            padding: 15, 
            borderRadius: 8,
            width: '100%'
          }}
          onPress={logout}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Retour connexion
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
