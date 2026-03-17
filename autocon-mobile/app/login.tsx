import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Colors } from "../src/styles/colors";
import { loginStyles as styles } from "../src/styles/login";
import { getCachedUser, getCurrentUser, login } from "../src/config/ApiServices";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        const localUser = await getCachedUser();
        if (localUser) {
          const serverUser = await getCurrentUser();
          if (serverUser) {
            router.replace("/");
            return;
          }
        }
      } catch (_error) {
        // Si no hay sesion valida, se queda en login.
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [router]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 8;
  }, [email, password]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("Datos incompletos", "Ingresa correo y una contrasena de al menos 8 caracteres.");
      return;
    }

    setLoginError("");
    setSaving(true);
    try {
      await login(email.trim().toLowerCase(), password);
      setPassword("");
      router.replace("/");
    } catch (error: any) {
      const rawMessage = String(error?.message || "").toLowerCase();
      const invalidCredentials =
        rawMessage.includes("credencial") ||
        rawMessage.includes("incorrect") ||
        rawMessage.includes("contras") ||
        rawMessage.includes("password") ||
        rawMessage.includes("invalid");

      if (invalidCredentials) {
        setLoginError("Contrasena incorrecta");
      } else {
        Alert.alert("Error", error.message || "No fue posible continuar");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/tip.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.bodyCard}>
          <Text style={styles.bodyTitle}>Iniciar Sesion</Text>
          <Text style={styles.bodySub}>Ingresa tus credenciales para continuar</Text>

          <Text style={styles.label}>Correo electronico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@tipinterventoria.com"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (loginError) {
                setLoginError("");
              }
            }}
          />

          <Text style={styles.label}>Contrasena</Text>
          <View style={[styles.passwordWrap, loginError ? styles.passwordWrapError : undefined]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (loginError) {
                  setLoginError("");
                }
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

          <Text style={styles.domainHint}>Solo se permiten correos @tipinterventoria.com</Text>

          <TouchableOpacity
            style={[styles.primaryButton, (!canSubmit || saving) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>
              No tienes cuenta? Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
