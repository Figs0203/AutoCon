import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/styles/colors";
import styles from "../../src/styles/global";

export default function UsersHeader() {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="people" size={28} color={Colors.accent} style={{ marginRight: 8 }} />
        <Text style={[styles.titulo, { marginBottom: 0 }]}>Supervisores</Text>
      </View>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>
        Equipos de trabajo registrados
      </Text>
    </View>
  );
}
