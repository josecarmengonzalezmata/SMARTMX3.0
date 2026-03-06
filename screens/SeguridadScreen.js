import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SeguridadScreen() {
  const idCounterRef = useRef(0);

  const createUniqueId = () => {
    idCounterRef.current += 1;
    return `${Date.now()}-${idCounterRef.current}`;
  };

  // Estados para Pregunta 3 (Prevención de accidentes)
  const [modoConduccion, setModoConduccion] = useState(false);
  const [velocidad, setVelocidad] = useState(0);
  const [enMovimiento, setEnMovimiento] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [puntuacion, setPuntuacion] = useState(100);
  const [viajesHoy, setViajesHoy] = useState(0);
  
  // Estados para Pregunta 4 (Emergencias)
  const [emergenciasCercanas, setEmergenciasCercanas] = useState([]);
  const [reportesUsuario, setReportesUsuario] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // ===========================================
  // CONFIGURACIÓN INICIAL
  // ===========================================
  useEffect(() => {
    cargarDatosGuardados();
    configurarSensores();
    cargarEmergenciasSimuladas();
    
    // Actualizar cada 30 segundos (simula backend)
    const interval = setInterval(() => {
      setUltimaActualizacion(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarDatosGuardados = async () => {
    try {
      const puntuacionGuardada = await AsyncStorage.getItem('puntuacion');
      if (puntuacionGuardada) setPuntuacion(parseInt(puntuacionGuardada));

      const viajesGuardados = await AsyncStorage.getItem('viajesHoy');
      if (viajesGuardados) setViajesHoy(parseInt(viajesGuardados));

      const alertasGuardadas = await AsyncStorage.getItem('alertas');
      if (alertasGuardadas) {
        const parsedAlerts = JSON.parse(alertasGuardadas);
        const normalizedAlerts = (parsedAlerts || []).map((item, index) => ({
          ...item,
          id: `${item?.id ?? 'legacy'}-${index}`,
        }));
        setAlertas(normalizedAlerts);
      }
    } catch (error) {
      console.log('Error cargando datos:', error);
    }
  };

  const configurarSensores = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación para detectar velocidad');
        return;
      }

      // Configurar acelerómetro (detecta movimiento y choques)
      Accelerometer.setUpdateInterval(500);
      Accelerometer.addListener(data => {
        const fuerza = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setEnMovimiento(fuerza > 1.5);

        // DETECCIÓN DE CHOQUE/VOLCADURA
        if (fuerza > 3.5 && modoConduccion) {
          detectarImpacto(fuerza);
        }
      });

      // Configurar GPS para velocidad
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 10
        },
        (location) => {
          const vel = (location.coords.speed || 0) * 3.6; // Convertir a km/h
          setVelocidad(Math.round(vel));
          
          // Activar modo conducción automático si va rápido
          if (vel > 10 && !modoConduccion) {
            setModoConduccion(true);
            agregarAlerta('Modo conduccion activado automaticamente');
          }
        }
      );
    } catch (error) {
      console.log('Error configurando sensores:', error);
    }
  };

  // ===========================================
  // FUNCIONES PREGUNTA 3 - Prevención de accidentes
  // ===========================================
  const detectarImpacto = (fuerza) => {
    Vibration.vibrate(1000);
    
    Alert.alert(
      'ALERTA DE IMPACTO',
      `Se detectó un impacto de ${fuerza.toFixed(1)}G. ¿Necesitas ayuda?`,
      [
        { text: 'Estoy bien', onPress: () => agregarAlerta('Falso positivo reportado') },
        {
          text: 'LLAMAR EMERGENCIAS',
          onPress: () => {
            agregarAlerta('EMERGENCIA REPORTADA - Servicios notificados');
            Alert.alert('Emergencia reportada', 'Se ha notificado a los servicios de emergencia con tu ubicación');
          },
          style: 'destructive'
        }
      ]
    );

    agregarAlerta(`Impacto detectado: ${fuerza.toFixed(1)}G`);
    setPuntuacion(prev => Math.max(0, prev - 15));
    guardarDatos();
  };

  const agregarAlerta = (mensaje) => {
    const nuevaAlerta = {
      id: createUniqueId(),
      mensaje,
      tiempo: 'Ahora',
      timestamp: new Date().toISOString()
    };
    
    setAlertas(prev => [nuevaAlerta, ...prev].slice(0, 10));
    guardarDatos();
  };

  const toggleModoConduccion = () => {
    setModoConduccion(!modoConduccion);
    if (!modoConduccion) {
      setViajesHoy(prev => prev + 1);
      agregarAlerta('Modo conduccion activado');
    } else {
      agregarAlerta('Modo conduccion desactivado');
    }
    guardarDatos();
  };

  const guardarDatos = async () => {
    try {
      await AsyncStorage.setItem('puntuacion', puntuacion.toString());
      await AsyncStorage.setItem('viajesHoy', viajesHoy.toString());
      await AsyncStorage.setItem('alertas', JSON.stringify(alertas));
    } catch (error) {
      console.log('Error guardando datos:', error);
    }
  };

  // ===========================================
  // FUNCIONES PREGUNTA 4 - Emergencias
  // ===========================================
  const cargarEmergenciasSimuladas = () => {
    // Datos quemados que simulan backend
    setEmergenciasCercanas([
      { 
        id: 1, 
        tipo: 'ambulance', 
        nombre: 'Ambulancia',
        distancia: '500m', 
        tiempo: '2 min', 
        via: 'Av. Tecnológico',
        color: '#dc3545',
        icon: 'medical'
      },
      { 
        id: 2, 
        tipo: 'police', 
        nombre: 'Patrulla',
        distancia: '800m', 
        tiempo: '3 min', 
        via: 'Blvd. Solidaridad',
        color: '#1a237e',
        icon: 'car-sport'
      },
      { 
        id: 3, 
        tipo: 'fire', 
        nombre: 'Bomberos',
        distancia: '1.2km', 
        tiempo: '5 min', 
        via: 'Periférico Norte',
        color: '#ff6b35',
        icon: 'flame'
      },
    ]);

    setReportesUsuario([
      { id: 1, usuario: 'Ana G.', tipo: 'Ambulancia', ubicacion: 'Centro', tiempo: 'hace 2 min', confianza: 98 },
      { id: 2, usuario: 'Carlos R.', tipo: 'Patrulla', ubicacion: 'Norte', tiempo: 'hace 5 min', confianza: 95 },
      { id: 3, usuario: 'Luis M.', tipo: 'Bomberos', ubicacion: 'Sur', tiempo: 'hace 8 min', confianza: 92 },
      { id: 4, usuario: 'María F.', tipo: 'Ambulancia', ubicacion: 'Parque', tiempo: 'hace 12 min', confianza: 96 },
    ]);
  };

  const reportarEmergencia = (tipo) => {
    Alert.alert(
      'Reportar Vehículo de Emergencia',
      `¿Confirmas que hay ${tipo === 'ambulance' ? 'una ambulancia' : tipo === 'police' ? 'una patrulla' : 'un camión de bomberos'} cerca?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const nombres = {
              ambulance: 'Ambulancia',
              police: 'Patrulla',
              fire: 'Bomberos'
            };
            
            const nuevoReporte = {
              id: createUniqueId(),
              usuario: 'Tú',
              tipo: nombres[tipo],
              ubicacion: 'Ubicación actual',
              tiempo: 'Ahora',
              confianza: 100
            };
            
            setReportesUsuario(prev => [nuevoReporte, ...prev].slice(0, 10));
            Vibration.vibrate(200);
            agregarAlerta(`Reportaste ${nombres[tipo]} cerca`);
            
            Alert.alert('¡Gracias por reportar!', 'Tu reporte ayuda a otros conductores');
          }
        }
      ]
    );
  };

  // Guía de señales de emergencia
  const guiaEmergencias = [
    { 
      icon: 'medical',
      tipo: 'Ambulancia', 
      sonido: 'Sirena intermitente',
      accion: 'Despeje carril derecho INMEDIATAMENTE',
      color: '#dc3545',
      multa: '$5,000 MXN'
    },
    { 
      icon: 'car-sport',
      tipo: 'Patrulla', 
      sonido: 'Sirena continua',
      accion: 'Reduzca velocidad y oríllese a la derecha',
      color: '#1a237e',
      multa: '$3,000 MXN'
    },
    { 
      icon: 'flame',
      tipo: 'Bomberos', 
      sonido: 'Dos tonos alternados',
      accion: 'ALTO TOTAL, ceda el paso completamente',
      color: '#ff6b35',
      multa: '$4,000 MXN'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* ====================================== */}
        {/* HEADER PRINCIPAL */}
        {/* ====================================== */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="shield" size={width * 0.12} color="white" />
          </View>
          <Text style={styles.headerTitle}>Seguridad Vial</Text>
          <Text style={styles.headerSubtitle}>Prevención de accidentes • Respeto a emergencias</Text>
          
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{puntuacion}</Text>
              <Text style={styles.headerStatLabel}>Puntos</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{viajesHoy}</Text>
              <Text style={styles.headerStatLabel}>Viajes hoy</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{alertas.length}</Text>
              <Text style={styles.headerStatLabel}>Alertas</Text>
            </View>
          </View>
        </View>

        {/* ====================================== */}
        {/* PREGUNTA 3 - PREVENCIÓN DE ACCIDENTES */}
        {/* ====================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="car" size={24} color="#1a237e" />
              <Text style={styles.sectionTitle}>Prevención de Accidentes</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>3</Text>
            </View>
          </View>
          
          {/* Tarjeta de Modo Conducción */}
          <TouchableOpacity 
            style={[styles.conduccionCard, modoConduccion && styles.conduccionActiva]}
            onPress={toggleModoConduccion}
            activeOpacity={0.8}
          >
            <View style={styles.conduccionIconContainer}>
              <Ionicons 
                name={modoConduccion ? "car-sport" : "car-outline"} 
                size={width * 0.1} 
                color={modoConduccion ? "#28a745" : "#666"} 
              />
            </View>
            <View style={styles.conduccionInfo}>
              <Text style={styles.conduccionTitulo}>
                {modoConduccion ? 'MODO CONDUCCIÓN ACTIVADO' : 'ACTIVAR MODO CONDUCCIÓN'}
              </Text>
              <Text style={styles.conduccionSubtitulo}>
                {modoConduccion 
                  ? 'Monitoreando tu viaje • Alertas silenciadas' 
                  : 'Silencia notificaciones y detecta accidentes automáticamente'}
              </Text>
            </View>
            <View style={[styles.conduccionIndicator, modoConduccion && styles.conduccionIndicatorActivo]} />
          </TouchableOpacity>

          {/* Panel de Velocidad (solo visible en modo conducción) */}
          {modoConduccion && (
            <View style={styles.velocidadPanel}>
              <View style={styles.velocidadCard}>
                <Text style={styles.velocidadLabel}>Velocidad actual</Text>
                <View style={styles.velocidadValueContainer}>
                  <Text style={styles.velocidadValor}>{velocidad}</Text>
                  <Text style={styles.velocidadUnidad}>km/h</Text>
                </View>
                <View style={styles.velocidadBar}>
                  <View style={[
                    styles.velocidadProgress, 
                    { width: `${Math.min(velocidad, 120) * 0.8}%` },
                    { backgroundColor: velocidad > 80 ? '#dc3545' : velocidad > 50 ? '#ffc107' : '#28a745' }
                  ]} />
                </View>
                <View style={styles.velocidadEstado}>
                  <View style={[styles.estadoIndicador, { backgroundColor: enMovimiento ? '#28a745' : '#dc3545' }]} />
                  <Text style={styles.estadoTexto}>
                    {enMovimiento ? 'Vehículo en movimiento' : 'Vehículo detenido'}
                  </Text>
                </View>
              </View>

              {/* Alertas recientes */}
              {alertas.length > 0 && (
                <View style={styles.alertasContainer}>
                  <Text style={styles.alertasTitulo}>Alertas recientes</Text>
                  {alertas.map(alerta => (
                    <View key={alerta.id} style={styles.alertaItem}>
                      <Text style={styles.alertaTexto}>{alerta.mensaje}</Text>
                      <Text style={styles.alertaTiempo}>{alerta.tiempo}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Tips de seguridad (siempre visible) */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitulo}>Consejos de seguridad</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipTexto}>No uses el teléfono mientras conduces</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipTexto}>Mantén distancia de seguridad (3 segundos)</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipTexto}>Respeta límites de velocidad</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.tipTexto}>Usa cinturón de seguridad siempre</Text>
            </View>
          </View>
        </View>

        {/* ====================================== */}
        {/* PREGUNTA 4 - VEHÍCULOS DE EMERGENCIA */}
        {/* ====================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="alert-circle" size={24} color="#1a237e" />
              <Text style={styles.sectionTitle}>Vehículos de Emergencia</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>4</Text>
            </View>
          </View>

          {/* Botones de reporte rápido */}
          <Text style={styles.subSectionTitle}>Reportar vehículo cercano</Text>
          <View style={styles.reporteGrid}>
            <TouchableOpacity 
              style={[styles.reporteBtn, { backgroundColor: '#dc3545' }]}
              onPress={() => reportarEmergencia('ambulance')}
              activeOpacity={0.8}
            >
              <Ionicons name="medical" size={width * 0.08} color="white" />
              <Text style={styles.reporteBtnText}>Ambulancia</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reporteBtn, { backgroundColor: '#1a237e' }]}
              onPress={() => reportarEmergencia('police')}
              activeOpacity={0.8}
            >
              <Ionicons name="car-sport" size={width * 0.08} color="white" />
              <Text style={styles.reporteBtnText}>Patrulla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reporteBtn, { backgroundColor: '#ff6b35' }]}
              onPress={() => reportarEmergencia('fire')}
              activeOpacity={0.8}
            >
              <Ionicons name="flame" size={width * 0.08} color="white" />
              <Text style={styles.reporteBtnText}>Bomberos</Text>
            </TouchableOpacity>
          </View>

          {/* Emergencias cercanas en tiempo real */}
          <View style={styles.emergenciasHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="alert" size={18} color="#dc3545" />
              <Text style={styles.subSectionTitle}>Emergencias cercanas</Text>
            </View>
            <Text style={styles.actualizacionText}>
              Actualizado {ultimaActualizacion.toLocaleTimeString()}
            </Text>
          </View>
          
          {emergenciasCercanas.map(emergencia => (
            <TouchableOpacity 
              key={emergencia.id} 
              style={styles.emergenciaCard}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  emergencia.nombre,
                  `Distancia: ${emergencia.distancia}\nTiempo estimado: ${emergencia.tiempo}\nVía: ${emergencia.via}\n\nMantente alerta y cede el paso`,
                  [{ text: 'Entendido' }]
                );
              }}
            >
              <View style={[styles.emergenciaIcon, { backgroundColor: emergencia.color }]}>
                <Ionicons name={emergencia.icon} size={24} color="white" />
              </View>
              <View style={styles.emergenciaInfo}>
                <Text style={styles.emergenciaTipo}>{emergencia.nombre}</Text>
                <Text style={styles.emergenciaDistancia}>
                  {emergencia.distancia} · {emergencia.tiempo} · {emergencia.via}
                </Text>
              </View>
              <Ionicons name="alert-circle" size={24} color={emergencia.color} />
            </TouchableOpacity>
          ))}

          {/* Reportes de la comunidad */}
          <View style={[styles.titleWithIcon, { marginTop: 20 }]}>
            <Ionicons name="people" size={18} color="#1a237e" />
            <Text style={styles.subSectionTitle}>
              Reportes de la comunidad ({reportesUsuario.length})
            </Text>
          </View>
          
          {reportesUsuario.map(reporte => (
            <View key={reporte.id} style={styles.reporteCard}>
              <Ionicons name="person-circle" size={40} color="#666" />
              <View style={styles.reporteInfo}>
                <Text style={styles.reporteUsuario}>{reporte.usuario}</Text>
                <Text style={styles.reporteDetalle}>
                  {reporte.tipo} · {reporte.ubicacion} · {reporte.tiempo}
                </Text>
                <View style={styles.confianzaContainer}>
                  <Ionicons name="shield-checkmark" size={14} color="#28a745" />
                  <Text style={styles.confianzaText}>{reporte.confianza}% confiable</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Guía rápida de señales */}
          <View style={styles.guiaContainer}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="megaphone" size={18} color="#1a237e" />
              <Text style={styles.guiaTitulo}>Guia rapida de senales</Text>
            </View>
            <Text style={styles.guiaSubtitulo}>Aprende a reaccionar ante cada emergencia</Text>
            
            {guiaEmergencias.map((item, index) => (
              <View key={index} style={styles.guiaItem}>
                <View style={[styles.guiaColor, { backgroundColor: item.color }]} />
                <View style={styles.guiaInfo}>
                  <View style={styles.guiaHeader}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                    <Text style={[styles.guiaTipo, { color: item.color }]}>{item.tipo}</Text>
                  </View>
                  <Text style={styles.guiaSonido}>{item.sonido}</Text>
                  <Text style={styles.guiaAccion}>Accion: {item.accion}</Text>
                  <Text style={styles.guiaMulta}>Multa por no ceder: {item.multa}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Dato importante */}
          <View style={styles.datoContainer}>
            <Ionicons name="information-circle" size={24} color="#1a237e" />
            <Text style={styles.datoText}>
              En México, no ceder el paso a vehículos de emergencia puede resultar en multas de hasta $5,000 MXN y pérdida de puntos en la licencia.
            </Text>
          </View>
        </View>

        {/* Footer con estadísticas generales */}
        <View style={styles.footer}>
          <View style={styles.footerStat}>
            <Ionicons name="shield-checkmark" size={28} color="#28a745" />
            <Text style={styles.footerStatValue}>{Math.round((puntuacion/100)*100)}%</Text>
            <Text style={styles.footerStatLabel}>Conductores responsables</Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons name="alert-circle" size={28} color="#ffc107" />
            <Text style={styles.footerStatValue}>{emergenciasCercanas.length}</Text>
            <Text style={styles.footerStatLabel}>Emergencias activas</Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons name="people" size={28} color="#1a237e" />
            <Text style={styles.footerStatValue}>{reportesUsuario.length}</Text>
            <Text style={styles.footerStatLabel}>Reportes ciudadanos</Text>
          </View>
        </View>

        {/* Versión y última sincronización */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Smart MX v1.0 - Seguridad Vial</Text>
          <View style={styles.syncRow}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'phone-portrait' : 'logo-android'}
              size={14}
              color="#ccc"
            />
            <Text style={styles.syncText}>
              {Platform.OS === 'ios' ? 'iOS' : 'Android'} · Datos locales
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================
// ESTILOS 100% RESPONSIVOS
// ===========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  
  // Header
  header: {
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    padding: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 15,
    width: '100%',
    justifyContent: 'space-around',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStatLabel: {
    fontSize: width * 0.03,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  // Secciones
  section: {
    padding: width * 0.04,
    backgroundColor: 'white',
    marginHorizontal: width * 0.04,
    marginTop: width * 0.04,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionBadge: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: width * 0.03,
    color: '#1a237e',
    fontWeight: '600',
  },
  
  // Modo conducción
  conduccionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: width * 0.04,
    borderWidth: 2,
    borderColor: '#dee2e6',
    marginBottom: 15,
  },
  conduccionActiva: {
    backgroundColor: '#e8f5e9',
    borderColor: '#28a745',
  },
  conduccionIconContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  conduccionInfo: {
    flex: 1,
  },
  conduccionTitulo: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  conduccionSubtitulo: {
    fontSize: width * 0.03,
    color: '#666',
  },
  conduccionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
    marginLeft: 8,
  },
  conduccionIndicatorActivo: {
    backgroundColor: '#28a745',
  },
  
  // Velocidad
  velocidadPanel: {
    marginBottom: 15,
  },
  velocidadCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: width * 0.04,
  },
  velocidadLabel: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: 5,
  },
  velocidadValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  velocidadValor: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: '#333',
  },
  velocidadUnidad: {
    fontSize: width * 0.04,
    color: '#666',
    marginLeft: 5,
  },
  velocidadBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  velocidadProgress: {
    height: 8,
    borderRadius: 4,
  },
  velocidadEstado: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoIndicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: width * 0.03,
    color: '#666',
  },
  
  // Alertas
  alertasContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: width * 0.04,
    marginTop: 10,
  },
  alertasTitulo: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  alertaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeeba',
  },
  alertaTexto: {
    fontSize: width * 0.035,
    color: '#856404',
    flex: 1,
  },
  alertaTiempo: {
    fontSize: width * 0.03,
    color: '#856404',
    opacity: 0.7,
  },
  
  // Tips
  tipsContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: width * 0.04,
  },
  tipsTitulo: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#0c5460',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipTexto: {
    fontSize: width * 0.035,
    color: '#155724',
    marginLeft: 8,
    flex: 1,
  },
  
  // Subsecciones
  subSectionTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  
  // Reportes de emergencia
  reporteGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reporteBtn: {
    flex: 1,
    alignItems: 'center',
    padding: width * 0.03,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reporteBtnText: {
    color: 'white',
    fontSize: width * 0.03,
    marginTop: 5,
    fontWeight: '600',
  },
  
  // Emergencias
  emergenciasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actualizacionText: {
    fontSize: width * 0.025,
    color: '#999',
  },
  emergenciaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: width * 0.03,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emergenciaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emergenciaInfo: {
    flex: 1,
  },
  emergenciaTipo: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  emergenciaDistancia: {
    fontSize: width * 0.03,
    color: '#666',
    marginTop: 2,
  },
  
  // Reportes de usuario
  reporteCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: width * 0.03,
    marginBottom: 8,
  },
  reporteInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reporteUsuario: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  reporteDetalle: {
    fontSize: width * 0.03,
    color: '#666',
    marginTop: 2,
  },
  confianzaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  confianzaText: {
    fontSize: width * 0.025,
    color: '#28a745',
    marginLeft: 4,
  },
  
  // Guía de señales
  guiaContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: width * 0.04,
    marginTop: 20,
  },
  guiaTitulo: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  guiaSubtitulo: {
    fontSize: width * 0.03,
    color: '#666',
    marginBottom: 15,
  },
  guiaItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  guiaColor: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  guiaInfo: {
    flex: 1,
  },
  guiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guiaTipo: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginLeft: 6,
  },
  guiaSonido: {
    fontSize: width * 0.03,
    color: '#666',
    marginBottom: 4,
  },
  guiaAccion: {
    fontSize: width * 0.035,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  guiaMulta: {
    fontSize: width * 0.025,
    color: '#dc3545',
  },
  
  // Dato importante
  datoContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8eaf6',
    borderRadius: 12,
    padding: width * 0.04,
    marginTop: 15,
    alignItems: 'center',
  },
  datoText: {
    fontSize: width * 0.03,
    color: '#1a237e',
    marginLeft: 10,
    flex: 1,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: width * 0.04,
    marginTop: width * 0.04,
    padding: width * 0.05,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerStat: {
    alignItems: 'center',
  },
  footerStatValue: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  footerStatLabel: {
    fontSize: width * 0.025,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Versión
  versionContainer: {
    alignItems: 'center',
    marginTop: width * 0.04,
    marginBottom: 10,
  },
  versionText: {
    fontSize: width * 0.03,
    color: '#999',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncText: {
    fontSize: width * 0.025,
    color: '#ccc',
    marginTop: 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});