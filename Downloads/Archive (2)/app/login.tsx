import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useUser } from '../contexts/UserContext';

export default function Login() {
  const user = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'merchant'>('client');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!user.isLoaded) return null;
  if (user.current) return <Redirect href="/" />;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await user.login(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Connexion échouée', error?.message || 'Une erreur est survenue');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await user.register(email.trim(), password, name.trim(), role);
    } catch (error: any) {
      Alert.alert('Inscription échouée', error?.message || 'Une erreur est survenue');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>Marketplace</Text>
          <Text style={styles.subtitle}>
            Achetez et vendez localement
          </Text>
        </View>

        <View style={styles.formSection}>
          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isRegistering && (
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Je suis un:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'client' && styles.roleButtonActive
                  ]}
                  onPress={() => setRole('client')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'client' && styles.roleButtonTextActive
                  ]}>
                    👤 Client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'merchant' && styles.roleButtonActive
                  ]}
                  onPress={() => setRole('merchant')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'merchant' && styles.roleButtonTextActive
                  ]}>
                    👨‍💼 Commerçant
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed]}
            onPress={isRegistering ? handleRegister : handleLogin}
          >
            <Text style={styles.btnPrimaryText}>
              {isRegistering ? 'Créer un compte' : 'Connexion'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnOutline, pressed && styles.btnPressed]}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.btnOutlineText}>
              {isRegistering ? 'Déjà un compte? Se connecter' : 'Pas de compte? S\'inscrire'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  formSection: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  roleSection: {
    marginBottom: 12,
  },
  roleLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#fff',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#2563eb',
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: '#fff',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnPrimaryText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  btnOutlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});