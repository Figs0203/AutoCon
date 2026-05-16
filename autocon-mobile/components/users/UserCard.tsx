import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/styles/colors";
import styles from "../../src/styles/global";

interface UserCardProps {
  email: string;
  rol: string;
  fecha_registro: string;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UserCard({ email, rol, fecha_registro }: UserCardProps) {
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
          <Text style={[styles.subtitulo, { marginBottom: 4 }]}>{email}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <View
              style={{
                backgroundColor: Colors.accent,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
                marginRight: 8,
              }}
            >
              <Text style={[styles.texto, { color: Colors.white, fontSize: 11 }]}>
                {rol === "SUPERVISOR_TECNICO" ? "Supervisor" : rol}
              </Text>
            </View>
            <Text style={[styles.texto, { color: Colors.textSecondary, fontSize: 12 }]}>
              {formatDate(fecha_registro)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
