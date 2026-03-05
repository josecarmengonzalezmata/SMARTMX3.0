import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase"; // Necesario para refreshSession manual

export default function AuthScreen({ navigation }) {
  const { signIn, signUp, refreshSession } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    // Validaciones
    if (!normalizedEmail || !password) {
      return Alert.alert(
        "Faltan datos",
        "Correo y contraseña son obligatorios.",
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return Alert.alert("Correo inválido", "Ingresa un correo válido.");
    }

    if (password.length < 6) {
      return Alert.alert("Contraseña débil", "Mínimo 6 caracteres.");
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar sesión
        await signIn(normalizedEmail, password);

        // Forzar refresh de sesión para detectar email confirmado
        await refreshSession();

        // Verificar sesión actualizada
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.email_confirmed_at) {
          throw new Error("email not confirmed");
        }

        // Éxito → redirige al Tab Navigator principal
        navigation.replace("MainTabs");
      } else {
        // Registro - Fijamos Sonora y Hermosillo automáticamente
        await signUp(normalizedEmail, password, {
          state: "Sonora",
          city: "Hermosillo",
          bio: bio.trim() || null,
        });

        Alert.alert(
          "Cuenta creada",
          "Revisa tu correo (incluida la carpeta de spam) para el enlace de verificación.\n\nUna vez confirmado, regresa aquí e inicia sesión.",
        );

        // Limpia y vuelve a modo login
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setBio("");
      }
    } catch (error) {
      let message = error.message || "Error desconocido";

      if (
        message.includes("invalid login credentials") ||
        message.includes("Invalid login credentials")
      ) {
        message = "Correo o contraseña incorrectos.";
      } else if (
        message.includes("already registered") ||
        message.includes("duplicate key")
      ) {
        message = "Este correo ya está registrado.";
      } else if (message.includes("rate limit") || message.includes("429")) {
        message =
          "Demasiados intentos. Espera 5–15 minutos e intenta de nuevo.";
      } else if (message.includes("email not confirmed")) {
        message =
          "Aún no has confirmado tu correo. Revisa tu bandeja de entrada/spam y haz clic en el enlace.";
      } else if (message.includes("weak password")) {
        message = "La contraseña es muy débil. Usa al menos 6 caracteres.";
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={["#0c203b", "#16435a", "#2c6f7a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons name="shield-checkmark" size={36} color="#fff" />
        <Text style={styles.title}>SMART MX</Text>
        <Text style={styles.subtitle}>Acceso seguro con Supabase Auth</Text>
      </LinearGradient>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
          onPress={() => setIsLogin(false)}
        >
          <Text
            style={[styles.toggleText, !isLogin && styles.toggleTextActive]}
          >
            Crear cuenta
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Correo *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#8191a5"
        />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#8191a5"
        />

        {!isLogin && (
          <>
            <Text style={styles.label}>Bio (opcional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Cuéntanos un poco sobre ti"
              placeholderTextColor="#8191a5"
            />

            <Text style={styles.helperFixed}>
              La app es exclusiva para Hermosillo, Sonora
            </Text>
          </>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name={isLogin ? "log-in-outline" : "person-add-outline"}
                size={18}
                color="#fff"
              />
              <Text style={styles.primaryButtonText}>
                {isLogin ? "Entrar" : "Crear cuenta"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8fc" },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 64,
    paddingBottom: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  title: { marginTop: 10, color: "#fff", fontSize: 28, fontWeight: "700" },
  subtitle: { marginTop: 4, color: "rgba(255,255,255,0.9)", fontSize: 14 },
  toggleRow: {
    marginTop: 20,
    marginHorizontal: 20,
    flexDirection: "row",
    backgroundColor: "#e8eef6",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleButtonActive: { backgroundColor: "#1a237e" },
  toggleText: { color: "#55657a", fontWeight: "600", fontSize: 14 },
  toggleTextActive: { color: "#fff" },
  formCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e3edf7",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e4f2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#233448",
    backgroundColor: "#fbfdff",
    marginBottom: 12,
  },
  bioInput: { minHeight: 100, textAlignVertical: "top" },
  helperFixed: {
    color: "#6a7c92",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#1a237e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    marginLeft: 10,
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
