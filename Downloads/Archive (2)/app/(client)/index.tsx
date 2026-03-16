import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useUser } from '@/contexts/UserContext';

const mockProducts = [
  { id: '1', name: 'Pommes Fraîches', price: 2.99, merchant: 'Ferme Locale' },
  { id: '2', name: 'Pain Biologique', price: 4.50, merchant: 'Boulangerie' },
];

export default function ClientBrowse() {
  const { profile } = useUser();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, backgroundColor: '#2563eb' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
          Bienvenue, {profile?.name}!
        </Text>
        <Text style={{ fontSize: 14, color: 'white', opacity: 0.9 }}>
          Parcourez les produits locaux
        </Text>
      </View>

      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
          Produits disponibles
        </Text>
        
        {mockProducts.map((item) => (
          <View key={item.id} style={{
            backgroundColor: 'white',
            padding: 15,
            marginBottom: 15,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              par {item.merchant}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
              {item.price}€
            </Text>
            
            <TouchableOpacity style={{
              backgroundColor: '#2563eb',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10,
            }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Ajouter au panier
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
