import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';

export default function MerchantDashboard() {
  const { profile } = useUser();
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          Bienvenue, {profile?.name}!
        </Text>
        <Text style={{ fontSize: 16, color: '#666' }}>
          Gérez vos produits et commandes
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            padding: 20,
            borderRadius: 12,
            flex: 1,
            minWidth: '45%',
          }}
          onPress={() => router.push('/(merchant)/products')}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            📦 Produits
          </Text>
          <Text style={{ color: 'white', fontSize: 14 }}>
            Gérez votre catalogue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            padding: 20,
            borderRadius: 12,
            flex: 1,
            minWidth: '45%',
          }}
          onPress={() => router.push('/(merchant)/orders')}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            📋 Commandes
          </Text>
          <Text style={{ color: 'white', fontSize: 14 }}>
            Voir les commandes clients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#f59e0b',
            padding: 20,
            borderRadius: 12,
            flex: 1,
            minWidth: '45%',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            📊 Analyses
          </Text>
          <Text style={{ color: 'white', fontSize: 14 }}>
            Aperçu des ventes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#ef4444',
            padding: 20,
            borderRadius: 12,
            flex: 1,
            minWidth: '45%',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            ⚙️ Paramètres
          </Text>
          <Text style={{ color: 'white', fontSize: 14 }}>
            Paramètres du magasin
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 30, padding: 20, backgroundColor: '#f3f4f6', borderRadius: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Statistiques rapides
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb' }}>0</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Total produits</Text>
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>0</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Commandes en attente</Text>
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>0</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Ventes totales</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
