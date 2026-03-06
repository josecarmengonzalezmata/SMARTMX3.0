// screens/MovilidadScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MovilidadScreen() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);

  const greenZones = [
    {
      id: 'deportivo',
      zone: 'Deportivo',
      description: 'Parque Sombra',
      temp: 27,
      status: 'Disponible',
      distance: '200m',
      emergency: true,
      recycle: true,
      shade: 'Alta',
      services: 'Bebedero, bancas, wifi',
      hours: '06:00 - 22:00',
    },
    {
      id: 'parque-madero',
      zone: 'Parque Madero',
      description: 'Zona Arbolada',
      temp: 28,
      status: 'Disponible',
      distance: '850m',
      emergency: false,
      recycle: true,
      shade: 'Media',
      services: 'Juegos, bebederos',
      hours: '05:30 - 21:30',
    },
    {
      id: 'universidad',
      zone: 'Universidad',
      description: 'Corredor Verde',
      temp: 29,
      status: 'Alta demanda',
      distance: '1.3km',
      emergency: true,
      recycle: false,
      shade: 'Media',
      services: 'Ciclopuerto, bancas',
      hours: '07:00 - 20:00',
    },
    {
      id: 'centro',
      zone: 'Centro',
      description: 'Plaza Publica',
      temp: 30,
      status: 'Disponible',
      distance: '1.8km',
      emergency: false,
      recycle: true,
      shade: 'Baja',
      services: 'Bancas, sombra temporal',
      hours: '06:00 - 23:00',
    },
    {
      id: 'cerro-campana',
      zone: 'Cerro de la Campana',
      description: 'Mirador con vegetacion',
      temp: 26,
      status: 'Disponible',
      distance: '2.1km',
      emergency: true,
      recycle: false,
      shade: 'Media',
      services: 'Mirador, ruta peatonal',
      hours: '06:00 - 20:30',
    },
    {
      id: 'la-sauceda',
      zone: 'La Sauceda',
      description: 'Parque urbano fresco',
      temp: 25,
      status: 'Disponible',
      distance: '3.4km',
      emergency: true,
      recycle: true,
      shade: 'Alta',
      services: 'Bebederos, banos, arbolado',
      hours: '05:00 - 22:00',
    },
    {
      id: 'villa-seris',
      zone: 'Villa de Seris',
      description: 'Andador verde barrial',
      temp: 28,
      status: 'Disponible',
      distance: '2.8km',
      emergency: false,
      recycle: true,
      shade: 'Media',
      services: 'Bancas, alumbrado led',
      hours: '06:00 - 22:00',
    },
    {
      id: 'parque-sonora',
      zone: 'Parque Sonora',
      description: 'Corredor con sombra',
      temp: 27,
      status: 'Alta demanda',
      distance: '2.6km',
      emergency: false,
      recycle: true,
      shade: 'Alta',
      services: 'Ciclopista, bebederos',
      hours: '05:30 - 21:00',
    },
    {
      id: 'pitic-norte',
      zone: 'Pitic Norte',
      description: 'Zona de descanso arbolada',
      temp: 26,
      status: 'Disponible',
      distance: '4.0km',
      emergency: true,
      recycle: false,
      shade: 'Alta',
      services: 'Bancas, punto de auxilio',
      hours: '24 horas',
    },
    {
      id: 'staus',
      zone: 'Andador STAUS',
      description: 'Camino peatonal verde',
      temp: 29,
      status: 'Disponible',
      distance: '1.1km',
      emergency: true,
      recycle: true,
      shade: 'Media',
      services: 'Sombra, acceso universal',
      hours: '06:00 - 21:00',
    },
  ];

  const getRiskByTemp = (temp) => {
    if (temp >= 30) return 'Alto';
    if (temp >= 28) return 'Medio';
    return 'Bajo';
  };

  const openZoneModal = (zone) => {
    setSelectedZone(zone);
    setZoneModalVisible(true);
  };

  const solutions = [
    { icon: 'leaf', title: 'Corredores Verdes', desc: '15km de rutas arborizadas', status: 'Activo' },
    { icon: 'water', title: 'Nebulizadores', desc: '32 estaciones de refresco', status: 'Activo' },
    { icon: 'sunny', title: 'Techos Sombra', desc: '28 paradas protegidas', status: 'En construcción' },
    { icon: 'time', title: 'Horarios Seguros', desc: 'Rutas nocturnas escoltadas', status: 'Activo' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={40} color="white" />
        <Text style={styles.headerTitle}>Movilidad y Calor Extremo</Text>
        <Text style={styles.headerSubtitle}>Soluciones para juventudes</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa de Calor Urbano</Text>
        {greenZones.map((zone) => {
          const risk = getRiskByTemp(zone.temp);
          return (
          <TouchableOpacity key={zone.id} style={styles.zoneCard} onPress={() => openZoneModal(zone)}>
            <View style={styles.zoneRow}>
              <Text style={styles.zoneName}>{zone.zone}</Text>
              <View style={[styles.riskBadge, { backgroundColor: risk === 'Alto' ? '#dc3545' : risk === 'Medio' ? '#ffc107' : '#28a745' }]}>
                <Text style={styles.riskText}>{risk}</Text>
              </View>
            </View>
            <Text style={styles.zoneDescription}>{zone.description}</Text>
            <View style={styles.zoneStats}>
              <View style={styles.zoneStat}>
                <Ionicons name="thermometer" size={16} color="#ff4444" />
                <Text style={styles.zoneStatText}>{zone.temp}°C</Text>
              </View>
              <View style={styles.zoneStat}>
                <Ionicons name="sunny" size={16} color="#FF9800" />
                <Text style={styles.zoneStatText}>Sombra {zone.shade}</Text>
              </View>
              <View style={styles.zoneStat}>
                <Ionicons name="location" size={16} color="#2196F3" />
                <Text style={styles.zoneStatText}>{zone.distance}</Text>
              </View>
            </View>
            <Text style={styles.tapHint}>Toca para ver informacion de la zona</Text>
          </TouchableOpacity>
        )})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soluciones Implementadas</Text>
        <View style={styles.solutionsGrid}>
          {solutions.map((sol, index) => (
            <View key={index} style={styles.solutionCard}>
              <Ionicons name={sol.icon} size={30} color="#1a237e" />
              <Text style={styles.solutionTitle}>{sol.title}</Text>
              <Text style={styles.solutionDesc}>{sol.desc}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sol.status === 'Activo' ? '#28a745' : '#ffc107' }]}>
                <Text style={styles.statusText}>{sol.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rutas Frescas Recomendadas</Text>
        <TouchableOpacity style={styles.routeCard}>
          <Ionicons name="map" size={24} color="#1a237e" />
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>Ruta Parque Sombra</Text>
            <Text style={styles.routeDetails}>25 min • 100% sombra • 3 nebulizadores</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.routeCard}>
          <Ionicons name="map" size={24} color="#1a237e" />
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>Ruta Corredor Verde</Text>
            <Text style={styles.routeDetails}>30 min • 85% sombra • 5 fuentes</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={zoneModalVisible} transparent animationType="slide" onRequestClose={() => setZoneModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="leaf" size={20} color="#2e7d32" />
                <Text style={styles.modalTitle}>{selectedZone?.zone}</Text>
              </View>
              <TouchableOpacity onPress={() => setZoneModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{selectedZone?.description}</Text>

            <View style={styles.modalInfoRow}>
              <Ionicons name="thermometer" size={16} color="#ef4444" />
              <Text style={styles.modalInfoText}>Temperatura: {selectedZone?.temp}°C</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.modalInfoText}>Estado: {selectedZone?.status}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="sunny" size={16} color="#f59e0b" />
              <Text style={styles.modalInfoText}>Sombra: {selectedZone?.shade}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="construct" size={16} color="#6366f1" />
              <Text style={styles.modalInfoText}>Servicios: {selectedZone?.services}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="time" size={16} color="#0891b2" />
              <Text style={styles.modalInfoText}>Horario: {selectedZone?.hours}</Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={() => setZoneModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a237e', padding: 30, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333' },
  zoneCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10 },
  zoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  zoneName: { fontSize: 16, fontWeight: '600' },
  zoneDescription: { fontSize: 12, color: '#666', marginBottom: 10 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  riskText: { color: 'white', fontSize: 11, fontWeight: '600' },
  zoneStats: { flexDirection: 'row', justifyContent: 'space-around' },
  zoneStat: { flexDirection: 'row', alignItems: 'center' },
  zoneStatText: { marginLeft: 5, fontSize: 13, color: '#666' },
  tapHint: { marginTop: 10, fontSize: 11, color: '#1a237e', fontWeight: '600', textAlign: 'right' },
  solutionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  solutionCard: { width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center' },
  solutionTitle: { fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  solutionDesc: { fontSize: 11, color: '#666', textAlign: 'center', marginVertical: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 5 },
  statusText: { color: 'white', fontSize: 9, fontWeight: '600' },
  routeCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  routeInfo: { marginLeft: 15, flex: 1 },
  routeName: { fontSize: 15, fontWeight: '600' },
  routeDetails: { fontSize: 12, color: '#666' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    marginLeft: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalInfoText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 13,
    flex: 1,
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#1a237e',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});