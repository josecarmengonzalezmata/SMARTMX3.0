import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({
    correo: '',
    ciudad: 'Hermosillo',
    bio: '',
    createdAt: null,
  });
  const hasLoadedRef = useRef(false);

  const achievements = [
    { id: 1, label: 'Retos completados', value: '12', icon: 'checkmark-circle' },
    { id: 2, label: 'Reportes enviados', value: '7', icon: 'send' },
    { id: 3, label: 'Participaciones', value: '24', icon: 'people' },
  ];

  const loadProfile = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = session?.user || null;

      if (!user) {
        setProfile({ correo: '', ciudad: 'Hermosillo', bio: '', createdAt: null });
        return;
      }

      const { data, error } = await supabase
        .from('perfiles')
        .select('correo, ciudad, bio, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile({
        correo: data?.correo || user.email || '',
        ciudad: data?.ciudad || user.user_metadata?.city || 'Hermosillo',
        bio: data?.bio || user.user_metadata?.bio || '',
        createdAt: data?.created_at || user.created_at || null,
      });
    } catch (error) {
      Alert.alert('Error', error?.message || 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile(hasLoadedRef.current);
    }, [loadProfile])
  );

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', error?.message || 'No se pudo cerrar sesión.');
    }
  };

  const displayName = profile.correo ? profile.correo.split('@')[0] : 'Usuario SMART MX';
  const memberYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : '2026';

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
        {refreshing ? <Text style={styles.refreshingText}>Actualizando perfil...</Text> : null}
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={42} color="#ffffff" />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>Perfil ciudadano</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsRow}>
          {achievements.map((item) => (
            <View key={item.id} style={styles.statCard}>
              <Ionicons name={item.icon} size={20} color="#1a237e" />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#1a237e" />
            <Text style={styles.infoText}>{profile.correo || 'Sin correo'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#1a237e" />
            <Text style={styles.infoText}>{profile.ciudad}, Sonora</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color="#1a237e" />
            <Text style={styles.infoText}>{profile.bio || 'Sin bio registrada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#1a237e" />
            <Text style={styles.infoText}>Miembro desde {memberYear}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('EditarPerfil')}
        >
          <Ionicons name="create-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#1a237e" />
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
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
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  role: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontSize: 13,
  },
  refreshingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3edf7',
  },
  statValue: {
    marginTop: 6,
    fontSize: 22,
    color: '#16435a',
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#5f6f82',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3edf7',
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 10,
    color: '#233448',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 28,
  },
  primaryButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a237e',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 28,
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#1a237e',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },
});