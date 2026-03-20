import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles as styles } from "../../src/styles/home";
import { Colors } from "../../src/styles/colors";

/**
 * Devuelve un saludo según la hora del día.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * Header oscuro del home: saludo, campana de notificación y barra de búsqueda.
 */
export default function HomeHeader() {
  return (
    <View style={styles.header}>
      {/* Fila superior: saludo */}
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.greetingLarge}>AutoCon</Text>
        </View>
      </View>
    </View>
  );
}
