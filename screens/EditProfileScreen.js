import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth(); // Usamos el contexto para obtener el usuario logueado

  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Hermosillo');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        Alert.alert('Error', 'No hay sesión activa');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Cargar datos de la tabla perfiles
        const { data, error } = await supabase
          .from('perfiles')
          .select('ciudad, bio')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Fallback a user_metadata o defaults
        setEmail(user.email || '');
        setCity(data?.ciudad || user.user_metadata?.city || 'Hermosillo');
        setBio(data?.bio || user.user_metadata?.bio || '');
      } catch (error) {
        console.error('Error cargando perfil:', error);
        Alert.alert('Error', 'No se pudo cargar el perfil. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      return Alert.alert('Error', 'No hay sesión activa');
    }

    setSaving(true);

    try {
      // Guardar en tabla perfiles
      const payload = {
        id: user.id,
        correo: email,
        ciudad: city,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('perfiles')
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // Opcional: actualizar metadata del usuario (para consistencia)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          city,
          bio: bio.trim() || null,
        },
      });

      if (metadataError) throw metadataError;

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0c203b', '#16435a', '#2c6f7a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <Text style={styles.headerSubtitle}>Actualiza tu información personal</Text>
      </LinearGradient>

      <View style={styles.formCard}>
        <Text style={styles.label}>Correo (no editable)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Hermosillo, Sonora"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={5}
          placeholder="Cuéntanos un poco sobre ti"
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f8fc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f8fc',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  formCard: {
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3edf7',
    padding: 14,
  },
  label: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e4f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#233448',
    fontSize: 14,
    backgroundColor: '#fbfdff',
    marginBottom: 12,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#777',
  },
  bioInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});