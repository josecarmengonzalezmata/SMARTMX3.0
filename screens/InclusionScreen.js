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
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

// Importa los datos separados
import { lsmDictionary, commonPhrases, tips } from "../data/lsmData";

// Importa el servicio de IA
import EconomicService from "../services/EconomicService";

const { width } = Dimensions.get("window");
const FRONT_CAMERA_TYPE = "front";
const PHRASE_COOLDOWN_MS = 2000;
const TRANSLATE_COOLDOWN_MS = 3000;

export default function InclusionScreen() {
  const isFocused = useIsFocused();
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [phraseCooldownUntil, setPhraseCooldownUntil] = useState(0);
  const [phraseCooldownLeftMs, setPhraseCooldownLeftMs] = useState(0);
  const [translateCooldownUntil, setTranslateCooldownUntil] = useState(0);
  const [translateCooldownLeftMs, setTranslateCooldownLeftMs] = useState(0);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // Estados para cámara
  const [permission, requestPermission] = useCameraPermissions();
  const cameraPermission = permission?.granted ?? null;
  const [detectedSign, setDetectedSign] = useState(
    "Toma una foto de la mano para analizar la sena.",
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


  const handleTranslate = () => {
    const now = Date.now();
    if (now < translateCooldownUntil) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

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

    if (isFocused) {
      Speech.speak(
        "Traducción aproximada lista. Recuerda usar expresiones faciales y ser paciente.",
        {
          language: "es-MX",
        },
      );
    }

    setIsTranslating(false);
    setTranslateCooldownUntil(now + TRANSLATE_COOLDOWN_MS);
  };

  const openGlossary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("https://lsm.indiscapacidad.cdmx.gob.mx/");
  };

  const speakPhrase = (phrase) => {
    if (!isFocused) return;

    const now = Date.now();
    if (now < phraseCooldownUntil) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Speech.speak(phrase.spanish, { language: "es-MX" });
    setPhraseCooldownUntil(now + PHRASE_COOLDOWN_MS);
  };

  useEffect(() => {
    if (phraseCooldownUntil <= Date.now()) {
      setPhraseCooldownLeftMs(0);
      return;
    }

    const timer = setInterval(() => {
      const left = Math.max(0, phraseCooldownUntil - Date.now());
      setPhraseCooldownLeftMs(left);
      if (left === 0) clearInterval(timer);
    }, 100);

    return () => clearInterval(timer);
  }, [phraseCooldownUntil]);

  useEffect(() => {
    if (translateCooldownUntil <= Date.now()) {
      setTranslateCooldownLeftMs(0);
      return;
    }

    const timer = setInterval(() => {
      const left = Math.max(0, translateCooldownUntil - Date.now());
      setTranslateCooldownLeftMs(left);
      if (left === 0) clearInterval(timer);
    }, 100);

    return () => clearInterval(timer);
  }, [translateCooldownUntil]);

  useEffect(() => {
    if (!isFocused) {
      Speech.stop();
    }
  }, [isFocused]);

  const cooldownProgress =
    phraseCooldownLeftMs > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((PHRASE_COOLDOWN_MS - phraseCooldownLeftMs) / PHRASE_COOLDOWN_MS) *
              100,
          ),
        )
      : 100;

  const translateCooldownProgress =
    translateCooldownLeftMs > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((TRANSLATE_COOLDOWN_MS - translateCooldownLeftMs) /
              TRANSLATE_COOLDOWN_MS) *
              100,
          ),
        )
      : 100;

  // Define la función para limpiar el texto
  const clearText = () => {
    setText("");
    setTranslated("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Function to capture a photo and analyze it
  const capturePhoto = async () => {
    if (!cameraRef.current || isAnalyzingPhoto) return;

    try {
      setIsAnalyzingPhoto(true);
      setDetectedSign("Analizando foto con IA...");

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        setDetectedSign(
          "No se pudo leer la foto. Intenta de nuevo con mejor iluminacion.",
        );
        return;
      }

      const analysis = await EconomicService.analyzeSignFromPhoto(photo.base64);
      const confidenceText = `${analysis.confidence}%`;
      const prefix = analysis.uncertain ? "Posible seña" : "Seña detectada";

      setDetectedSign(
        `${prefix}: ${analysis.sign} (${confidenceText})\n` +
          `Significado: ${analysis.meaning}\n` +
          `Sugerencia: ${analysis.recommendation}`,
      );
    } catch (error) {
      console.log("Error analizando foto de seña:", error);
      const detail = String(error?.message || "").slice(0, 140);
      setDetectedSign(
        "No se pudo analizar la foto. " +
          (detail
            ? `Detalle: ${detail}`
            : "Revisa conexion, permisos y vuelve a intentar."),
      );
    } finally {
      setIsAnalyzingPhoto(false);
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
          <View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="hands-pray"
                size={50}
                color="#1a237e"
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>
            Comunicación Inclusiva
          </Text>
          <Text style={styles.headerSubtitle}>
            Traductor Español ↔ LSM
          </Text>
        </LinearGradient>

        {/* Traductor */}
        <View style={styles.section}>
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
                  (isTranslating || translateCooldownLeftMs > 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleTranslate}
                disabled={isTranslating || translateCooldownLeftMs > 0}
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

            {translateCooldownLeftMs > 0 && (
              <View style={styles.cooldownCard}>
                <View style={styles.cooldownHeader}>
                  <Ionicons name="hourglass-outline" size={16} color="#b45309" />
                  <Text style={styles.cooldownTitle}>Cooldown de traduccion</Text>
                  <Text style={styles.cooldownTime}>
                    {(translateCooldownLeftMs / 1000).toFixed(1)}s
                  </Text>
                </View>
                <View style={styles.cooldownTrack}>
                  <View
                    style={[
                      styles.cooldownFill,
                      { width: `${translateCooldownProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {translated ? (
              <View style={styles.resultBox}>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name="hand-peace"
                    size={20}
                    color="#1a237e"
                  />
                  <Text style={styles.resultHeaderText}>Resultado:</Text>
                </View>
                <Text style={styles.resultText}>{translated}</Text>
              </View>
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
        </View>

        {/* Frases Comunes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chat" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Frases Comunes</Text>
          </View>
          {phraseCooldownLeftMs > 0 && (
            <View style={styles.cooldownCard}>
              <View style={styles.cooldownHeader}>
                <Ionicons name="timer-outline" size={16} color="#b45309" />
                <Text style={styles.cooldownTitle}>Cooldown de reproduccion</Text>
                <Text style={styles.cooldownTime}>
                  {(phraseCooldownLeftMs / 1000).toFixed(1)}s
                </Text>
              </View>
              <View style={styles.cooldownTrack}>
                <View
                  style={[styles.cooldownFill, { width: `${cooldownProgress}%` }]}
                />
              </View>
            </View>
          )}

          <View style={styles.phrasesGrid}>
            {commonPhrases.map((phrase, index) => (
              <View key={index} style={styles.phraseCardWrapper}>
                <TouchableOpacity
                  style={[
                    styles.phraseCard,
                    phraseCooldownLeftMs > 0 && styles.phraseCardDisabled,
                  ]}
                  onPress={() => speakPhrase(phrase)}
                  disabled={phraseCooldownLeftMs > 0}
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
              </View>
            ))}
          </View>
        </View>

        {/* Consejos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color="#1a237e"
            />
            <Text style={styles.sectionTitle}>Consejos de Comunicación</Text>
          </View>

          {tips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <LinearGradient
                colors={["#f5f5f5", "#ffffff"]}
                style={styles.tipGradient}
              >
                <View style={styles.tipIconContainer}>
                  <Ionicons name={tip.icon} size={28} color="#1a237e" />
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsCard}>
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
        </View>

        {/* Reconocimiento con Cámara */}
        <View style={styles.section}>
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
                  onPress={capturePhoto}
                  style={[
                    styles.controlButton,
                    isAnalyzingPhoto && styles.controlButtonDisabled,
                  ]}
                  disabled={isAnalyzingPhoto}
                >
                  <Text style={styles.controlButtonText}>
                    {isAnalyzingPhoto ? "Analizando..." : "Tomar Foto"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

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
  cooldownCard: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  cooldownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cooldownTitle: {
    marginLeft: 6,
    fontSize: 12,
    color: "#9a3412",
    fontWeight: "700",
    flex: 1,
  },
  cooldownTime: {
    fontSize: 12,
    color: "#c2410c",
    fontWeight: "700",
  },
  cooldownTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fde68a",
  },
  cooldownFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
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
  phraseCardDisabled: {
    opacity: 0.6,
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
  controlButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  controlButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
