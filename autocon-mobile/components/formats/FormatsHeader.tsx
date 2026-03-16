import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatsStyles as styles } from "../../src/styles/formats";
import { Colors } from "../../src/styles/colors";

/**
 * Header de la pantalla "Formatos" con el título y el botón "+ Nuevo"
 */
export default function FormatsHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Formatos</Text>
      
      <TouchableOpacity 
        style={styles.btnNuevo}
        onPress={() => router.push("/forms")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color={Colors.textPrimary} />
        <Text style={styles.btnNuevoText}>Nuevo</Text>
      </TouchableOpacity>
    </View>
  );
}
