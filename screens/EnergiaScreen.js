// screens/EnergiaScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EnergiaScreen = () => {
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [generatedEnergy, setGeneratedEnergy] = useState(0);
  const [userHistory, setUserHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('gyms');
  const [modalVisible, setModalVisible] = useState(false);

  // Datos de gimnasios de Hermosillo
  const gyms = [
    {
      id: 1,
      name: 'Gimnasio Norte',
      address: 'Av. Universidad 123',
      machines: 12,
      todayEnergy: 78,
      monthlyEnergy: 2340,
      users: 156,
      color: '#4CAF50'
    },
    {
      id: 2,
      name: 'Gimnasio Centro',
      address: 'Av. Reforma 456',
      machines: 8,
      todayEnergy: 45,
      monthlyEnergy: 1350,
      users: 89,
      color: '#FF9800'
    },
    {
      id: 3,
      name: 'Gimnasio Sur',
      address: 'Blvd. Solidaridad 789',
      machines: 6,
      todayEnergy: 28,
      monthlyEnergy: 840,
      users: 45,
      color: '#F44336'
    }
  ];

  // Máquinas generadoras de energía para CADA gimnasio
  const machines = [
    // Gimnasio Norte (id: 1)
    {
      id: 1,
      gymId: 1,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-01'
    },
    {
      id: 2,
      gymId: 1,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-02'
    },
    {
      id: 3,
      gymId: 1,
      type: 'Eliptica',
      icon: 'fitness',
      energyPerMinute: 0.06,
      caloriesPerMinute: 7,
      available: true,
      machineNumber: 'E-01'
    },
    {
      id: 4,
      gymId: 1,
      type: 'Eliptica',
      icon: 'fitness',
      energyPerMinute: 0.06,
      caloriesPerMinute: 7,
      available: false,
      machineNumber: 'E-02'
    },
    {
      id: 5,
      gymId: 1,
      type: 'Caminadora',
      icon: 'walk',
      energyPerMinute: 0.05,
      caloriesPerMinute: 9,
      available: true,
      machineNumber: 'C-01'
    },
    {
      id: 6,
      gymId: 1,
      type: 'Caminadora',
      icon: 'walk',
      energyPerMinute: 0.05,
      caloriesPerMinute: 9,
      available: true,
      machineNumber: 'C-02'
    },
    {
      id: 7,
      gymId: 1,
      type: 'Bicicleta Reclinada',
      icon: 'bicycle',
      energyPerMinute: 0.07,
      caloriesPerMinute: 7,
      available: true,
      machineNumber: 'BR-01'
    },
    {
      id: 8,
      gymId: 1,
      type: 'Maquina de Remo',
      icon: 'boat',
      energyPerMinute: 0.08,
      caloriesPerMinute: 10,
      available: true,
      machineNumber: 'R-01'
    },
    
    // Gimnasio Centro (id: 2)
    {
      id: 9,
      gymId: 2,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-01'
    },
    {
      id: 10,
      gymId: 2,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-02'
    },
    {
      id: 11,
      gymId: 2,
      type: 'Eliptica',
      icon: 'fitness',
      energyPerMinute: 0.06,
      caloriesPerMinute: 7,
      available: true,
      machineNumber: 'E-01'
    },
    {
      id: 12,
      gymId: 2,
      type: 'Caminadora',
      icon: 'walk',
      energyPerMinute: 0.05,
      caloriesPerMinute: 9,
      available: true,
      machineNumber: 'C-01'
    },
    {
      id: 13,
      gymId: 2,
      type: 'Caminadora',
      icon: 'walk',
      energyPerMinute: 0.05,
      caloriesPerMinute: 9,
      available: false,
      machineNumber: 'C-02'
    },
    {
      id: 14,
      gymId: 2,
      type: 'Bicicleta Reclinada',
      icon: 'bicycle',
      energyPerMinute: 0.07,
      caloriesPerMinute: 7,
      available: true,
      machineNumber: 'BR-01'
    },
    
    // Gimnasio Sur (id: 3)
    {
      id: 15,
      gymId: 3,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-01'
    },
    {
      id: 16,
      gymId: 3,
      type: 'Bicicleta Estatica',
      icon: 'bicycle',
      energyPerMinute: 0.076,
      caloriesPerMinute: 8,
      available: true,
      machineNumber: 'B-02'
    },
    {
      id: 17,
      gymId: 3,
      type: 'Eliptica',
      icon: 'fitness',
      energyPerMinute: 0.06,
      caloriesPerMinute: 7,
      available: true,
      machineNumber: 'E-01'
    },
    {
      id: 18,
      gymId: 3,
      type: 'Caminadora',
      icon: 'walk',
      energyPerMinute: 0.05,
      caloriesPerMinute: 9,
      available: true,
      machineNumber: 'C-01'
    },
    {
      id: 19,
      gymId: 3,
      type: 'Bicicleta Reclinada',
      icon: 'bicycle',
      energyPerMinute: 0.07,
      caloriesPerMinute: 7,
      available: false,
      machineNumber: 'BR-01'
    }
  ];

  const lightingSystems = [
    {
      id: 1,
      area: 'Cancha Norte',
      mode: 'Sensor de presencia + luz natural',
      saving: '34%',
      status: 'Optimo'
    },
    {
      id: 2,
      area: 'Pista Central',
      mode: 'Atenuacion automatica por horario',
      saving: '27%',
      status: 'Estable'
    },
    {
      id: 3,
      area: 'Zona cardio',
      mode: 'Energia cinetica + respaldo LED',
      saving: '41%',
      status: 'Optimo'
    }
  ];

  const calculateEnergy = () => {
    if (!selectedMachine) {
      Alert.alert('Error', 'Selecciona una maquina primero');
      return;
    }
    if (!exerciseMinutes || parseInt(exerciseMinutes) <= 0) {
      Alert.alert('Error', 'Ingresa minutos validos');
      return;
    }

    const minutes = parseInt(exerciseMinutes);
    const energy = selectedMachine.energyPerMinute * minutes;
    const calories = selectedMachine.caloriesPerMinute * minutes;

    setGeneratedEnergy(energy);

    const newEntry = {
      id: Date.now(),
      machine: selectedMachine.type,
      machineNumber: selectedMachine.machineNumber,
      minutes: minutes,
      energy: energy.toFixed(2),
      calories: calories,
      date: new Date().toLocaleString(),
      gym: selectedGym.name
    };

    setUserHistory([newEntry, ...userHistory]);
    setModalVisible(false);
    setExerciseMinutes('');

    Alert.alert(
      'Energia Generada',
      `Generaste ${energy.toFixed(2)} kWh\n` +
      `Quemaste ${calories} calorias\n` +
      `Tu energia iluminara ${(energy / 0.5).toFixed(1)} horas de luz LED`
    );
  };

  const openRegisterModal = (machine) => {
    setSelectedMachine(machine);
    setGeneratedEnergy(0);
    setExerciseMinutes('');
    setModalVisible(true);
  };

  const renderGym = ({ item }) => (
    <TouchableOpacity
      style={[styles.gymCard, selectedGym?.id === item.id && styles.selectedCard]}
      onPress={() => {
        setSelectedGym(item);
        setSelectedMachine(null);
        setGeneratedEnergy(0);
        setActiveTab('machines');
      }}
    >
      <View style={styles.gymHeader}>
        <Text style={styles.gymName}>{item.name}</Text>
        <View style={[styles.energyBadge, { backgroundColor: item.color }]}>
          <Text style={styles.energyBadgeText}>{item.todayEnergy} kWh</Text>
        </View>
      </View>
      <Text style={styles.gymAddress}>{item.address}</Text>
      <View style={styles.gymStats}>
        <View style={styles.gymStat}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.gymStatText}>{item.users} usuarios</Text>
        </View>
        <View style={styles.gymStat}>
          <Ionicons name="fitness-outline" size={16} color="#666" />
          <Text style={styles.gymStatText}>{item.machines} maquinas</Text>
        </View>
        <View style={styles.gymStat}>
          <Ionicons name="flash-outline" size={16} color="#FFA000" />
          <Text style={styles.gymStatText}>{item.monthlyEnergy}/mes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMachine = ({ item }) => (
    <TouchableOpacity
      style={[styles.machineCard, selectedMachine?.id === item.id && styles.selectedCard]}
      onPress={() => openRegisterModal(item)}
      disabled={!item.available}
    >
      <View style={styles.machineHeader}>
        <View style={[styles.machineIcon, { opacity: item.available ? 1 : 0.5 }]}>
          <Ionicons name={item.icon} size={24} color="#1a237e" />
        </View>
        <View style={styles.machineInfo}>
          <Text style={styles.machineType}>{item.type}</Text>
          <Text style={styles.machineNumber}>{item.machineNumber}</Text>
          <Text style={styles.machineSpecs}>
            {item.energyPerMinute.toFixed(3)} kWh/min | {item.caloriesPerMinute} cal/min
          </Text>
        </View>
        <View style={[styles.availableDot, { backgroundColor: item.available ? '#4CAF50' : '#F44336' }]} />
      </View>
      {!item.available && (
        <Text style={styles.notAvailable}>En mantenimiento</Text>
      )}
    </TouchableOpacity>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyMachine}>{item.machine}</Text>
        <Text style={styles.historyEnergy}>{item.energy} kWh</Text>
      </View>
      <Text style={styles.historyNumber}>{item.machineNumber} | {item.gym}</Text>
      <View style={styles.historyFooter}>
        <Text style={styles.historyMinutes}>{item.minutes} min</Text>
        <Text style={styles.historyCalories}>{item.calories} cal</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
    </View>
  );

  const getGymMachines = () => {
    if (!selectedGym) return [];
    return machines.filter(m => m.gymId === selectedGym.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Energia Deportiva</Text>
        <Text style={styles.headerSubtitle}>Hermosillo, Sonora</Text>
        <View style={styles.challengeBadge}>
          <Text style={styles.challengeBadgeText}>Pregunta 2: ahorro electrico + iluminacion inteligente</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gyms' && styles.activeTab]}
          onPress={() => {
            setActiveTab('gyms');
            setSelectedMachine(null);
          }}
        >
          <Ionicons name="business-outline" size={20} color={activeTab === 'gyms' ? '#1a237e' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'gyms' && styles.activeTabText]}>
            Gimnasios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'machines' && styles.activeTab]}
          onPress={() => {
            if (selectedGym) {
              setActiveTab('machines');
            } else {
              Alert.alert('Aviso', 'Primero selecciona un gimnasio');
            }
          }}
        >
          <Ionicons name="fitness-outline" size={20} color={activeTab === 'machines' ? '#1a237e' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'machines' && styles.activeTabText]}>
            Maquinas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="time-outline" size={20} color={activeTab === 'history' ? '#1a237e' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Mi Historial
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'gyms' && (
          <View>
            <View style={styles.lightingCard}>
              <View style={styles.lightingHeader}>
                <Ionicons name="bulb" size={20} color="#1a237e" />
                <Text style={styles.lightingTitle}>Optimizacion de Iluminacion Deportiva</Text>
              </View>
              <Text style={styles.lightingSubtitle}>
                Control inteligente de luminarias + energia generada por usuarios en maquinas.
              </Text>
              {lightingSystems.map((system) => (
                <View key={system.id} style={styles.lightingRow}>
                  <View style={styles.lightingInfo}>
                    <Text style={styles.lightingArea}>{system.area}</Text>
                    <Text style={styles.lightingMode}>{system.mode}</Text>
                  </View>
                  <View style={styles.lightingRight}>
                    <Text style={styles.lightingSaving}>{system.saving}</Text>
                    <Text style={styles.lightingStatus}>{system.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Gimnasios de Hermosillo</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona un gimnasio para ver sus maquinas generadoras
            </Text>
            <FlatList
              data={gyms}
              renderItem={renderGym}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {activeTab === 'machines' && selectedGym && (
          <View>
            <View style={styles.selectedGymHeader}>
              <Text style={styles.selectedGymName}>{selectedGym.name}</Text>
              <TouchableOpacity 
                style={styles.changeGymButton}
                onPress={() => {
                  setActiveTab('gyms');
                  setSelectedMachine(null);
                }}
              >
                <Text style={styles.changeGymText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>
              Maquinas disponibles - Elige una para registrar tu tiempo
            </Text>
            
            {getGymMachines().length > 0 ? (
              <FlatList
                data={getGymMachines()}
                renderItem={renderMachine}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="fitness-outline" size={60} color="#ccc" />
                <Text style={styles.placeholderText}>
                  Este gimnasio no tiene maquinas registradas
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'machines' && !selectedGym && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="business-outline" size={60} color="#ccc" />
            <Text style={styles.placeholderText}>
              Primero selecciona un gimnasio en la pestaña Gimnasios
            </Text>
          </View>
        )}

        {activeTab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Mi Historial de Energia</Text>
            <Text style={styles.sectionSubtitle}>
              Total generado: {userHistory.reduce((sum, item) => sum + parseFloat(item.energy), 0).toFixed(2)} kWh
            </Text>
            {userHistory.length > 0 ? (
              <FlatList
                data={userHistory}
                renderItem={renderHistory}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="time-outline" size={60} color="#ccc" />
                <Text style={styles.placeholderText}>
                  Aun no has generado energia. Ve a Maquinas y registra tu primer ejercicio
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL PARA REGISTRAR MINUTOS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="flash" size={30} color="#1a237e" />
              </View>
              <Text style={styles.modalTitle}>Registrar Tiempo</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Información de la máquina */}
            {selectedMachine && (
              <View style={styles.modalMachineInfo}>
                <View style={styles.modalMachineIcon}>
                  <Ionicons name={selectedMachine.icon} size={40} color="#1a237e" />
                </View>
                <View style={styles.modalMachineDetails}>
                  <Text style={styles.modalMachineType}>{selectedMachine.type}</Text>
                  <Text style={styles.modalMachineNumber}>{selectedMachine.machineNumber}</Text>
                  <Text style={styles.modalGymName}>{selectedGym?.name}</Text>
                </View>
              </View>
            )}

            {/* Datos de generación */}
            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatLabel}>kWh por minuto</Text>
                <Text style={styles.modalStatValue}>
                  {selectedMachine?.energyPerMinute.toFixed(3)}
                </Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatLabel}>Calorías por min</Text>
                <Text style={styles.modalStatValue}>
                  {selectedMachine?.caloriesPerMinute}
                </Text>
              </View>
            </View>

            {/* Input de minutos */}
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>¿Cuántos minutos hiciste?</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  value={exerciseMinutes}
                  onChangeText={setExerciseMinutes}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#999"
                  maxLength={3}
                />
                <Text style={styles.modalInputSuffix}>min</Text>
              </View>
            </View>

            {/* Botón de calcular */}
            <TouchableOpacity
              style={styles.modalCalculateButton}
              onPress={calculateEnergy}
            >
              <Text style={styles.modalCalculateButtonText}>Calcular Energía Generada</Text>
            </TouchableOpacity>

            {/* Resultado (si ya se calculó) */}
            {generatedEnergy > 0 && (
              <View style={styles.modalResult}>
                <Text style={styles.modalResultLabel}>Generarás:</Text>
                <Text style={styles.modalResultValue}>{generatedEnergy.toFixed(2)} kWh</Text>
                <View style={styles.modalResultEquivalences}>
                  <View style={styles.modalEquivalence}>
                    <Ionicons name="bulb-outline" size={16} color="#FFA000" />
                    <Text style={styles.modalEquivalenceText}>
                      {(generatedEnergy / 0.5).toFixed(1)} hrs luz LED
                    </Text>
                  </View>
                  <View style={styles.modalEquivalence}>
                    <Ionicons name="phone-portrait-outline" size={16} color="#4CAF50" />
                    <Text style={styles.modalEquivalenceText}>
                      {(generatedEnergy / 0.15).toFixed(0)} cargas de celular
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5
  },
  challengeBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  challengeBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 5
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#e8eaf6'
  },
  tabText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666'
  },
  activeTabText: {
    color: '#1a237e',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15
  },
  lightingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8eaf6'
  },
  lightingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  lightingTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e'
  },
  lightingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10
  },
  lightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5'
  },
  lightingInfo: {
    flex: 1,
    paddingRight: 10
  },
  lightingArea: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  lightingMode: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  lightingRight: {
    alignItems: 'flex-end'
  },
  lightingSaving: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d32'
  },
  lightingStatus: {
    fontSize: 10,
    color: '#666'
  },
  gymCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1a237e'
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  energyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  energyBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600'
  },
  gymAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10
  },
  gymStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  gymStat: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  gymStatText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666'
  },
  selectedGymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  selectedGymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e'
  },
  changeGymButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8eaf6',
    borderRadius: 8
  },
  changeGymText: {
    color: '#1a237e',
    fontSize: 12,
    fontWeight: '600'
  },
  machineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  machineIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  machineInfo: {
    flex: 1,
    marginLeft: 12
  },
  machineType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  machineNumber: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  machineSpecs: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  notAvailable: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 8,
    textAlign: 'right'
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  historyMachine: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  historyEnergy: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  historyNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyMinutes: {
    fontSize: 11,
    color: '#999'
  },
  historyCalories: {
    fontSize: 11,
    color: '#FF9800'
  },
  historyDate: {
    fontSize: 9,
    color: '#ccc'
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30
  },
  // Estilos para el Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10
  },
  modalCloseButton: {
    padding: 5
  },
  modalMachineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15
  },
  modalMachineIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  modalMachineDetails: {
    flex: 1
  },
  modalMachineType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  modalMachineNumber: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  modalGymName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center'
  },
  modalStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e'
  },
  modalStatDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 10
  },
  modalInputContainer: {
    marginBottom: 20
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9'
  },
  modalInput: {
    flex: 1,
    padding: 15,
    fontSize: 18,
    textAlign: 'center'
  },
  modalInputSuffix: {
    paddingRight: 15,
    fontSize: 16,
    color: '#666'
  },
  modalCalculateButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15
  },
  modalCalculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  modalResult: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 15
  },
  modalResultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  modalResultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10
  },
  modalResultEquivalences: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  modalEquivalence: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalEquivalenceText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 5
  }
});

export default EnergiaScreen;