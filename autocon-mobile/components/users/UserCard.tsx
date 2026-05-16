import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/styles/colors";
import styles from "../../src/styles/global";

interface UserCardProps {
  nombre: string;
  email: string;
  formularios: number;
}

export default function UserCard({ nombre, email, formularios }: UserCardProps) {
  return (
    <View style={[styles.tarjeta, { marginBottom: 12 }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: Colors.accent,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="person" size={24} color={Colors.white} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitulo, { marginBottom: 4 }]}>{nombre}</Text>
          <Text style={[styles.texto, { color: Colors.textSecondary }]}>{email}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: Colors.cardBorder,
        }}
      >
        <Ionicons name="document-text" size={16} color={Colors.accent} />
        <Text style={[styles.texto, { marginLeft: 6 }]}>
          {formularios} formulario{formularios !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}
