import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Colors } from "../src/styles/colors";
import { registerStyles as styles } from "../src/styles/register";
import { register } from "../src/config/ApiServices";

type UserRole = "SUPERVISOR_TECNICO" | "SOCIOS";
interface FormErrors {
  email?: string;
  password?: string;
}

const ALLOWED_DOMAIN = "tipinterventoria.com";

const ROLE_OPTIONS: Array<{ id: UserRole; label: string }> = [
  {
    id: "SUPERVISOR_TECNICO",
    label: "Supervisor Tecnico",
  },
  {
    id: "SOCIOS",
    label: "Socios",
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("SUPERVISOR_TECNICO");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    const normalizedEmail = email.trim().toLowerCase();
    return normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`) && password.trim().length >= 8;
  }, [email, password]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = "Ingresa tu correo corporativo";
    } else if (!normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      nextErrors.email = `Solo se permiten correos @${ALLOWED_DOMAIN}`;
    }

    if (password.length < 8) {
      nextErrors.password = "La contrasena debe tener minimo 8 caracteres";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await register(email.trim().toLowerCase(), password, role);
      Alert.alert("Registro exitoso", "Tu cuenta fue creada correctamente.");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No fue posible crear tu cuenta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="construct" size={18} color={Colors.headerDark} />
            </View>
            <Text style={styles.appName}>AutoCon</Text>
          </View>

          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <Text style={styles.headerSub}>Ingresa como nuevo usuario</Text>

          <View style={styles.roleTabs}>
            {ROLE_OPTIONS.map((option) => {
              const active = role === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.roleTab, active && styles.roleTabActive]}
                  onPress={() => setRole(option.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roleTabTitle, active && styles.roleTabTitleActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Correo corporativo</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder={`nombre@${ALLOWED_DOMAIN}`}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
              />
              <Text style={styles.hint}>Solo correos @{ALLOWED_DOMAIN}</Text>
              {errors.email ? <Text style={styles.errorMsg}>{errors.email}</Text> : null}
            </View>

            <View>
              <Text style={styles.label}>Contrasena</Text>
              <View style={[styles.passwordWrap, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimo 8 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
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
              {errors.password ? <Text style={styles.errorMsg}>{errors.password}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (saving || !canSubmit) && styles.primaryButtonDisabled]}
            onPress={handleRegister}
            disabled={saving || !canSubmit}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Crear cuenta como {role === "SUPERVISOR_TECNICO" ? "Supervisor" : "Socio"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.loginLink}>Inicia sesion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
