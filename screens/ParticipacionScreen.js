// screens/ParticipacionScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ParticipacionScreen() {
  const [proposal, setProposal] = useState('');

  const collaborators = [
    { entity: 'Gobierno', role: 'Regulación y financiamiento', icon: 'business', members: 12 },
    { entity: 'Academia', role: 'Investigación y datos', icon: 'school', members: 8 },
    { entity: 'Empresas', role: 'Inversión y tecnología', icon: 'cash', members: 15 },
    { entity: 'OSC', role: 'Vinculación comunitaria', icon: 'heart', members: 10 },
    { entity: 'Comunidades', role: 'Participación ciudadana', icon: 'people', members: 45 },
  ];

  const mechanisms = [
    { name: 'Consejo Ciudadano', next: '15 Nov 2024', participants: 34, status: 'Activo' },
    { name: 'Comité de Movilidad', next: '18 Nov 2024', participants: 28, status: 'Activo' },
    { name: 'Mesa de Economía Circular', next: '20 Nov 2024', participants: 22, status: 'Activo' },
    { name: 'Foro Juvenil', next: '25 Nov 2024', participants: 56, status: 'Próximo' },
  ];

  const polls = [
    { id: 1, title: 'Horario de parques', votes: 234, endDate: '30 Nov', status: 'active' },
    { id: 2, title: 'Ubicación de ciclovías', votes: 156, endDate: '28 Nov', status: 'active' },
    { id: 3, title: 'Alumbrado público', votes: 89, endDate: 'Cerrada', status: 'closed' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={40} color="white" />
        <Text style={styles.headerTitle}>Participación Ciudadana</Text>
        <Text style={styles.headerSubtitle}>Gobierno + Academia + Empresas + OSC</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>1,234</Text>
        <Text style={styles.statsLabel}>Ciudadanos participando</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabelSmall}>Propuestas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabelSmall}>Proyectos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89%</Text>
            <Text style={styles.statLabelSmall}>Aprobación</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modelo de Colaboración</Text>
        <View style={styles.collabGrid}>
          {collaborators.map((item, index) => (
            <View key={index} style={styles.collabCard}>
              <Ionicons name={item.icon} size={30} color="#1a237e" />
              <Text style={styles.collabEntity}>{item.entity}</Text>
              <Text style={styles.collabRole}>{item.role}</Text>
              <Text style={styles.collabMembers}>{item.members} representantes</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mecanismos de Participación</Text>
        {mechanisms.map((item, index) => (
          <View key={index} style={styles.mechanismCard}>
            <View style={styles.mechanismHeader}>
              <Text style={styles.mechanismName}>{item.name}</Text>
              <View style={[styles.mechanismStatus, { backgroundColor: item.status === 'Activo' ? '#28a745' : '#ffc107' }]}>
                <Text style={styles.mechanismStatusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.mechanismDate}>Próxima reunión: {item.next}</Text>
            <Text style={styles.mechanismParticipants}>{item.participants} participantes</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Encuestas Ciudadanas</Text>
        {polls.map((poll) => (
          <TouchableOpacity key={poll.id} style={styles.pollCard}>
            <View style={styles.pollHeader}>
              <Text style={styles.pollTitle}>{poll.title}</Text>
              <View style={[styles.pollStatus, { backgroundColor: poll.status === 'active' ? '#28a745' : '#999' }]}>
                <Text style={styles.pollStatusText}>{poll.status}</Text>
              </View>
            </View>
            <Text style={styles.pollVotes}>{poll.votes} votos</Text>
            <Text style={styles.pollEnd}>Cierra: {poll.endDate}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Propuesta Ciudadana</Text>
        <View style={styles.proposalCard}>
          <TextInput
            style={styles.proposalInput}
            placeholder="Escribe tu propuesta para la ciudad..."
            value={proposal}
            onChangeText={setProposal}
            multiline
          />
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Enviar propuesta</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reglas y Responsabilidades</Text>
        <View style={styles.rulesCard}>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.ruleText}>Reuniones mensuales obligatorias</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.ruleText}>Transparencia en decisiones</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.ruleText}>Representación equitativa</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.ruleText}>Presupuesto participativo</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a237e', padding: 30, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  statsCard: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 12, alignItems: 'center' },
  statsNumber: { fontSize: 40, fontWeight: 'bold', color: '#1a237e' },
  statsLabel: { fontSize: 14, color: '#666', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '600' },
  statLabelSmall: { fontSize: 11, color: '#666' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333' },
  collabGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  collabCard: { width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10, alignItems: 'center' },
  collabEntity: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  collabRole: { fontSize: 11, color: '#666', textAlign: 'center', marginVertical: 4 },
  collabMembers: { fontSize: 11, color: '#1a237e', fontWeight: '600' },
  mechanismCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10 },
  mechanismHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mechanismName: { fontSize: 15, fontWeight: '600' },
  mechanismStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  mechanismStatusText: { color: 'white', fontSize: 10, fontWeight: '600' },
  mechanismDate: { fontSize: 13, color: '#666', marginBottom: 4 },
  mechanismParticipants: { fontSize: 12, color: '#999' },
  pollCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10 },
  pollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pollTitle: { fontSize: 15, fontWeight: '600' },
  pollStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pollStatusText: { color: 'white', fontSize: 10, fontWeight: '600' },
  pollVotes: { fontSize: 13, color: '#666', marginBottom: 4 },
  pollEnd: { fontSize: 12, color: '#999' },
  proposalCard: { backgroundColor: 'white', borderRadius: 12, padding: 15 },
  proposalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', marginBottom: 10 },
  submitButton: { backgroundColor: '#1a237e', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontWeight: '600' },
  rulesCard: { backgroundColor: 'white', borderRadius: 12, padding: 15 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ruleText: { marginLeft: 10, fontSize: 14, color: '#333' },
});