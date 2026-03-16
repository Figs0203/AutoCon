import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../src/styles/colors";

/**
 * Pantalla placeholder para el perfil del usuario.
 * Se implementará completamente cuando se agregue autenticación.
 */
export default function ProfileScreen() {
  return (
    <SafeAreaView style={profileStyles.safe}>
      <View style={profileStyles.container}>
        <View style={profileStyles.iconCircle}>
          <Ionicons name="person-outline" size={48} color={Colors.textMuted} />
        </View>
        <Text style={profileStyles.title}>Perfil</Text>
        <Text style={profileStyles.subtitle}>
          Próximamente: inicio de sesión y perfil de usuario
        </Text>
      </View>
    </SafeAreaView>
  );
}

const profileStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
