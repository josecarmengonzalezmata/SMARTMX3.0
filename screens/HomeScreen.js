// screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  
  // Animaciones para las tarjetas
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso denegado');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Permite que los markers se dibujen bien y luego congela su vista para evitar parpadeo.
    const markerTimer = setTimeout(() => setTracksViewChanges(false), 1200);

    return () => clearTimeout(markerTimer);
  }, []);

  const handleNavigation = (screen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  const freshZones = [
    {
      id: 'deportivo',
      coordinate: { latitude: 29.0729, longitude: -110.9559 },
      title: 'Deportivo',
      description: 'Parque Sombra',
      temperature: 27,
      status: 'Disponible',
      distance: '200m',
      emergency: true,
      recycle: true
    },
    {
      id: 'parque-madero',
      coordinate: { latitude: 29.0841, longitude: -110.9653 },
      title: 'Parque Madero',
      description: 'Zona Arbolada',
      temperature: 28,
      status: 'Disponible',
      distance: '850m',
      emergency: false,
      recycle: true
    },
    {
      id: 'universidad',
      coordinate: { latitude: 29.0811, longitude: -110.9578 },
      title: 'Universidad',
      description: 'Corredor Verde',
      temperature: 29,
      status: 'Alta demanda',
      distance: '1.3km',
      emergency: true,
      recycle: false
    },
    {
      id: 'centro',
      coordinate: { latitude: 29.0755, longitude: -110.9482 },
      title: 'Centro',
      description: 'Plaza Pública',
      temperature: 30,
      status: 'Disponible',
      distance: '1.8km',
      emergency: false,
      recycle: true
    }
  ];

  const currentZone = freshZones.find((zone) => zone.id === selectedZone) || null;

  const challengeMap = [
    { id: 1, title: 'Espacio publico seguro ante calor extremo', screen: 'Movilidad', tag: 'Pregunta 1' },
    { id: 2, title: 'Ahorro electrico en instalaciones deportivas', screen: 'Energia', tag: 'Pregunta 2' },
    { id: 3, title: 'Reducir siniestros por celular al volante', screen: 'Seguridad', tag: 'Pregunta 3' },
    { id: 4, title: 'Respeto a vehiculos de emergencia', screen: 'Seguridad', tag: 'Pregunta 4' },
    { id: 5, title: 'Comunicacion oyentes - personas sordas (LSM)', screen: 'Inclusion', tag: 'Pregunta 5' },
    { id: 6, title: 'IA para atraer inversiones y nearshoring', screen: 'Economia', tag: 'Pregunta 6' },
    { id: 7, title: 'Estrategias de economia circular urbana', screen: 'Economia', tag: 'Pregunta 7' },
    { id: 8, title: 'Pesaje y trazabilidad de residuos en tiempo real', screen: 'Economia', tag: 'Pregunta 8' },
    { id: 9, title: 'Modelo colaborativo para participacion municipal', screen: 'Participacion', tag: 'Pregunta 9' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header con gradiente */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>SMART MX</Text>
            <Text style={styles.headerSubtitle}>Ciudad Inteligente</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Perfil');
            }}
          >
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.locationText}>Hermosillo, Son.  39°C | Alerta Amarilla</Text>
      </View>

      {/* Mapa con animación */}
      <Animated.View 
        style={[
          styles.mapContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 29.0729,
            longitude: -110.9559,
            latitudeDelta: 0.015,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPress={(event) => {
            // Si el toque fue en el mapa (no en marker), cerramos la tarjeta.
            if (event?.nativeEvent?.action !== 'marker-press') {
              setSelectedZone(null);
            }
          }}
        >
          {freshZones.map((zone) => (
            <Marker
              key={zone.id}
              coordinate={zone.coordinate}
              title={zone.title}
              description={zone.description}
              tracksViewChanges={tracksViewChanges}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedZone(zone.id);
              }}
            >
              <View style={styles.marker}>
                <Ionicons name="leaf" size={20} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Tarjeta de zona */}
        {currentZone && (
          <Animated.View 
            style={[
              styles.zoneCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.zoneHeader}>
              <Ionicons name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.zoneName}>{currentZone.title}</Text>
              <View style={[styles.emergencyBadge, !currentZone.emergency && styles.normalBadge]}>
                <Text style={styles.emergencyText}>{currentZone.emergency ? 'Emergencia' : 'Normal'}</Text>
              </View>
            </View>
            <Text style={styles.zoneSubtitle}>{currentZone.description}</Text>
            <View style={styles.zoneDetails}>
              <View style={styles.zoneDetail}>
                <Ionicons name="thermometer" size={14} color="#666" />
                <Text style={styles.zoneDetailText}>{currentZone.temperature}°C</Text>
              </View>
              <Text style={styles.separator}>·</Text>
              <View style={styles.zoneDetail}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.zoneDetailText}>{currentZone.status}</Text>
              </View>
              <Text style={styles.separator}>·</Text>
              <View style={styles.zoneDetail}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.zoneDetailText}>{currentZone.distance}</Text>
              </View>
            </View>
            {currentZone.recycle && (
              <View style={styles.recycleRow}>
                <Ionicons name="refresh-circle" size={16} color="#4CAF50" />
                <Text style={styles.recycleText}>Reciclaje</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.detailsButtonText}>Ver Detalles </Text>
              <Ionicons name="arrow-forward" size={14} color="#0066CC" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {/* Accesos rápidos */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleNavigation('Seguridad')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="car" size={22} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Conducción Segura</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleNavigation('Economia')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="refresh" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Reciclaje</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleNavigation('Energia')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F1FF' }]}>
              <Ionicons name="flash" size={22} color="#1a237e" />
            </View>
            <Text style={styles.actionText}>Energia</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleNavigation('Inclusion')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="hand-left" size={22} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Traductor LSM</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleNavigation('Participacion')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="people" size={22} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Participa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.challengeSection}>
          <Text style={styles.challengeTitle}>Mapa de Retos</Text>
          <Text style={styles.challengeSubtitle}>Las 9 preguntas del reto conectadas a modulos funcionales</Text>
          {challengeMap.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={styles.challengeCard}
              onPress={() => handleNavigation(challenge.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>{challenge.tag}</Text>
              </View>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeCardTitle}>{challenge.title}</Text>
                <Text style={styles.challengeScreen}>Modulo: {challenge.screen}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <Animated.View 
            style={[
              styles.statCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.statLabel}>Energía Ahorrada</Text>
            <Text style={styles.statValue}>3,420</Text>
            <Text style={styles.statUnit}>kwh</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.statLabel}>Reciclaje Hoy</Text>
            <Text style={styles.statValue}>12.3</Text>
            <Text style={styles.statUnit}>Toneladas</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.statLabel}>Conductores Responsables</Text>
            <Text style={styles.statValue}>78%</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.statLabel}>Zonas Frescas</Text>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statUnit}>Activas</Text>
          </Animated.View>
        </View>

        {/* Espacio extra */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    backgroundColor: '#1a237e', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.8)' 
  },
  profileButton: {
    padding: 5,
  },
  locationText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  mapContainer: { 
    height: height * 0.4, 
    position: 'relative',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  marker: { 
    backgroundColor: '#4CAF50', 
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneCard: { 
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 15, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  zoneHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  zoneName: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 6, 
    flex: 1,
    color: '#333',
  },
  emergencyBadge: { 
    backgroundColor: '#dc3545', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12,
  },
  normalBadge: {
    backgroundColor: '#28a745',
  },
  emergencyText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '600' 
  },
  zoneSubtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 8, 
    marginLeft: 26 
  },
  zoneDetails: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    marginLeft: 26 
  },
  zoneDetail: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  zoneDetailText: { 
    marginLeft: 4, 
    fontSize: 13, 
    color: '#666' 
  },
  separator: { 
    marginHorizontal: 6, 
    color: '#999',
    fontSize: 14,
  },
  recycleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    marginLeft: 26 
  },
  recycleText: { 
    marginLeft: 4, 
    color: '#4CAF50', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  detailsButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end' 
  },
  detailsButtonText: { 
    color: '#1a237e', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  content: { 
    flex: 1 
  },
  quickActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 10, 
    paddingVertical: 20, 
    backgroundColor: 'white', 
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: { 
    alignItems: 'center', 
    width: '18%' 
  },
  actionIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: { 
    fontSize: 10, 
    textAlign: 'center', 
    color: '#333',
    fontWeight: '500',
  },
  challengeSection: {
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  challengeCard: {
    borderWidth: 1,
    borderColor: '#eceff1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  challengeBadge: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  challengeBadgeText: {
    fontSize: 10,
    color: '#1a237e',
    fontWeight: '700',
  },
  challengeContent: {
    flex: 1,
  },
  challengeCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  challengeScreen: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingTop: 10 
  },
  statCard: { 
    width: '48%', 
    backgroundColor: 'white', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1a237e' 
  },
  statUnit: { 
    fontSize: 12, 
    color: '#999',
    marginTop: 2,
  },
  bottomSpace: { 
    height: 80 
  },
});

export default HomeScreen;