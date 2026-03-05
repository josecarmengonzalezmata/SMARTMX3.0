// screens/InclusionScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

// Importa los datos separados
import { lsmDictionary, commonPhrases, tips } from "../data/lsmData";

// Importa el servicio de IA
import EconomicService from "../services/EconomicService";

const { width } = Dimensions.get("window");
const FRONT_CAMERA_TYPE = "front";

export default function InclusionScreen() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Estados para cámara
  const [permission, requestPermission] = useCameraPermissions();
  const cameraPermission = permission?.granted ?? null;
  const [detectedSign, setDetectedSign] = useState(
    "Presiona 'Iniciar Grabación' para detectar gestos en tiempo real",
  );
  const cameraRef = useRef(null);

  // Initialize MediaPipe Hands for gesture detection
  const hands = useRef(null);

  // Solicitar permiso de cámara al cargar
  useEffect(() => {
    (async () => {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Permiso requerido",
          "La app necesita acceso a la cámara para reconocer señas. Por favor habilita el permiso en ajustes.",
        );
      }
    })();
  }, [requestPermission]);

  // Simulate real-time gesture detection when recording
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const gestures = [
        "Puño detectado",
        "Like detectado",
        "Dislike detectado",
        "Signo de paz detectado",
        "Seña desconocida",
        "Ajusta la luz o posición",
      ];
      const randomGesture =
        gestures[Math.floor(Math.random() * gestures.length)];
      setDetectedSign(randomGesture);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleTranslate = () => {
    if (!text.trim()) {
      Alert.alert("Atención", "Escribe una frase para traducir");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTranslating(true);

    const cleanText = text
      .toLowerCase()
      .replace(/[.,!?;]/g, " ")
      .trim();
    const words = cleanText.split(/\s+/).filter((w) => w);

    const parts = words.map((word) => {
      const entry = lsmDictionary[word];
      if (entry) {
        return `${word.toUpperCase()}: ${entry.emoji} (${entry.gloss}) - ${entry.desc}`;
      }
      return `${word.toUpperCase()}: [No encontrado - deletrea o consulta glosario]`;
    });

    const glossLine = words
      .map((w) => lsmDictionary[w]?.gloss || w.toUpperCase())
      .join(" ");

    const full =
      `**Secuencia aproximada en gloss LSM:**\n${glossLine}\n\n` +
      `**Desglose por palabra:**\n${parts.join("\n")}\n\n` +
      `**Recomendación:** Para precisión, consulta videos en el Glosario Digital CDMX:\nhttps://lsm.indiscapacidad.cdmx.gob.mx/`;

    setTranslated(full);

    Speech.speak(
      "Traducción aproximada lista. Recuerda usar expresiones faciales y ser paciente.",
      {
        language: "es-MX",
      },
    );

    setIsTranslating(false);
  };

  const openGlossary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("https://lsm.indiscapacidad.cdmx.gob.mx/");
  };

  const speakPhrase = (phrase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Speech.speak(phrase.spanish, { language: "es-MX" });
  };

  // Define la función para limpiar el texto
  const clearText = () => {
    setText("");
    setTranslated("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Add state to control recording and photo capture
  const [isRecording, setIsRecording] = useState(false);

  // Function to start/stop recording
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setDetectedSign(
        "Grabación detenida. Presiona 'Iniciar Grabación' para reanudar.",
      );
    } else {
      setIsRecording(true);
      setDetectedSign("Grabando... coloca tu mano");
    }
  };

  // Function to capture a photo and analyze it
  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setDetectedSign("Analizando foto...");

      // Simulate analysis delay
      setTimeout(() => {
        const gestures = [
          "Puño detectado",
          "Like detectado",
          "Dislike detectado",
          "Signo de paz detectado",
          "Seña desconocida",
        ];
        const randomGesture =
          gestures[Math.floor(Math.random() * gestures.length)];
        setDetectedSign(`Gesto detectado: ${randomGesture}`);
      }, 2000); // Simulate 2 seconds analysis
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Mejorado */}
        <LinearGradient
          colors={["#1a237e", "#283593", "#3949ab"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Animatable.View animation="bounceIn" duration={1500}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="hands-pray"
                size={50}
                color="#1a237e"
              />
            </View>
          </Animatable.View>
          <Animatable.Text
            animation="fadeInUp"
            delay={300}
            style={styles.headerTitle}
          >
            Comunicación Inclusiva
          </Animatable.Text>
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={styles.headerSubtitle}
          >
            Traductor Español ↔ LSM
          </Animatable.Text>
        </LinearGradient>

        {/* Traductor */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="translate"
              size={24}
              color="#1a237e"
            />
            <Text style={styles.sectionTitle}>Traductor Español → LSM</Text>
          </View>

          <View style={styles.translatorCard}>
            <TextInput
              style={styles.input}
              placeholder="Escribe una frase..."
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.translateButton,
                  isTranslating && styles.disabledButton,
                ]}
                onPress={handleTranslate}
                disabled={isTranslating}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#1a237e", "#283593"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="swap-horizontal" size={20} color="white" />
                  <Text style={styles.translateButtonText}>
                    {isTranslating ? "Traduciendo..." : "Traducir"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearText}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>

            {translated ? (
              <Animatable.View
                animation="fadeIn"
                duration={500}
                style={styles.resultBox}
              >
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name="hand-peace"
                    size={20}
                    color="#1a237e"
                  />
                  <Text style={styles.resultHeaderText}>Resultado:</Text>
                </View>
                <Text style={styles.resultText}>{translated}</Text>
              </Animatable.View>
            ) : null}

            <TouchableOpacity
              onPress={openGlossary}
              style={styles.glossaryButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#4CAF50", "#45a049"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glossaryGradient}
              >
                <MaterialCommunityIcons name="video" size={20} color="white" />
                <Text style={styles.glossaryText}>
                  Glosario Oficial CDMX (719 Videos)
                </Text>
                <Ionicons name="open-outline" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Frases Comunes */}
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chat" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Frases Comunes</Text>
          </View>

          <View style={styles.phrasesGrid}>
            {commonPhrases.map((phrase, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={400 + index * 100}
                style={styles.phraseCardWrapper}
              >
                //Holaaaaa-
                <TouchableOpacity
                  style={styles.phraseCard}
                  onPress={() => speakPhrase(phrase)}
                  activeOpacity={0.7}
                >
                  <View style={styles.phraseHeader}>
                    <Text style={styles.phraseLSM}>{phrase.lsm}</Text>
                    <View style={styles.phraseIconContainer}>
                      <Ionicons
                        name="volume-high-outline"
                        size={18}
                        color="#1a237e"
                      />
                    </View>
                  </View>
                  <Text style={styles.phraseSpanish}>{phrase.spanish}</Text>
                  <Text style={styles.phraseDesc}>{phrase.desc}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        {/* Consejos */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color="#1a237e"
            />
            <Text style={styles.sectionTitle}>Consejos de Comunicación</Text>
          </View>

          {tips.map((tip, index) => (
            <Animatable.View
              key={index}
              animation="fadeInLeft"
              delay={600 + index * 150}
              style={styles.tipCard}
            >
              <LinearGradient
                colors={["#f5f5f5", "#ffffff"]}
                style={styles.tipGradient}
              >
                <View style={styles.tipIconContainer}>
                  <Ionicons name={tip.icon} size={28} color="#1a237e" />
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </LinearGradient>
            </Animatable.View>
          ))}
        </Animatable.View>

        {/* Estadísticas */}
        <Animatable.View
          animation="fadeInUp"
          delay={700}
          style={styles.statsCard}
        >
          <LinearGradient
            colors={["#ffffff", "#f8f9fa"]}
            style={styles.statsGradient}
          >
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="#1a237e"
              />
              <Text style={styles.statsTitle}>Progreso de la Comunidad</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>234</Text>
                <Text style={styles.statLabel}>Personas aprendiendo</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Talleres este mes</Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Reconocimiento con Cámara */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="hand-wave"
              size={24}
              color="#1a237e"
            />
            <Text style={styles.sectionTitle}>
              Reconocimiento de Señas (Cámara)
            </Text>
          </View>

          {cameraPermission === null ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a237e" />
              <Text style={styles.loadingText}>
                Solicitando permiso de cámara...
              </Text>
            </View>
          ) : cameraPermission === false ? (
            <View style={styles.permissionDenied}>
              <Text style={styles.permissionText}>
                Necesitamos acceso a la cámara para reconocer tus señas.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => Linking.openSettings()}
              >
                <Text style={styles.permissionButtonText}>Abrir Ajustes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                type={FRONT_CAMERA_TYPE}
              />
              <Text style={styles.detectedSign}>{detectedSign}</Text>
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  onPress={toggleRecording}
                  style={styles.controlButton}
                >
                  <Text style={styles.controlButtonText}>
                    {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={capturePhoto}
                  style={styles.controlButton}
                >
                  <Text style={styles.controlButtonText}>Tomar Foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animatable.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  translatorCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  translateButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    width: 54,
    height: 54,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  resultHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
    marginLeft: 8,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  glossaryButton: {
    marginTop: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  glossaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    gap: 8,
  },
  glossaryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 5,
  },
  phrasesGrid: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  phraseCardWrapper: {
    width: "100%",
    marginBottom: 18,
  },
  phraseCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  phraseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingRight: 5,
  },
  phraseIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  phraseLSM: {
    fontSize: 24, // Reducir el tamaño de la letra
    marginBottom: 5,
    fontWeight: "bold",
    color: "#1a237e",
  },
  phraseSpanish: {
    fontSize: 12, // Reducir el tamaño de la letra
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  phraseDesc: {
    fontSize: 10, // Reducir el tamaño de la letra
    color: "#666",
    lineHeight: 14,
  },
  tipCard: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8eaf6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGradient: {
    padding: 20,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a237e",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#1a237e",
  },
  permissionDenied: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    alignItems: "center",
    elevation: 3,
  },
  permissionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cameraContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 10,
    overflow: "hidden",
  },
  detectedSign: {
    marginTop: 10,
    fontSize: 16,
    color: "#1a237e",
    fontWeight: "600",
  },
  cameraControls: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  controlButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  controlButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
