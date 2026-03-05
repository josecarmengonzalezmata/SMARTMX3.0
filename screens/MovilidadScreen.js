// screens/MovilidadScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MovilidadScreen() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const heatZones = [
    { id: 1, zone: 'Centro', temp: 38, risk: 'Alto', trees: 45, shades: 12 },
    { id: 2, zone: 'Norte', temp: 32, risk: 'Medio', trees: 78, shades: 23 },
    { id: 3, zone: 'Sur', temp: 35, risk: 'Alto', trees: 34, shades: 8 },
    { id: 4, zone: 'Parques', temp: 27, risk: 'Bajo', trees: 156, shades: 45 },
  ];

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
        {heatZones.map((zone) => (
          <TouchableOpacity key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneRow}>
              <Text style={styles.zoneName}>{zone.zone}</Text>
              <View style={[styles.riskBadge, { backgroundColor: zone.risk === 'Alto' ? '#dc3545' : zone.risk === 'Medio' ? '#ffc107' : '#28a745' }]}>
                <Text style={styles.riskText}>{zone.risk}</Text>
              </View>
            </View>
            <View style={styles.zoneStats}>
              <View style={styles.zoneStat}>
                <Ionicons name="thermometer" size={16} color="#ff4444" />
                <Text style={styles.zoneStatText}>{zone.temp}°C</Text>
              </View>
              <View style={styles.zoneStat}>
                <Ionicons name="leaf" size={16} color="#4CAF50" />
                <Text style={styles.zoneStatText}>{zone.trees} árboles</Text>
              </View>
              <View style={styles.zoneStat}>
                <Ionicons name="umbrella" size={16} color="#2196F3" />
                <Text style={styles.zoneStatText}>{zone.shades} sombras</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  riskBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  riskText: { color: 'white', fontSize: 11, fontWeight: '600' },
  zoneStats: { flexDirection: 'row', justifyContent: 'space-around' },
  zoneStat: { flexDirection: 'row', alignItems: 'center' },
  zoneStatText: { marginLeft: 5, fontSize: 13, color: '#666' },
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
});