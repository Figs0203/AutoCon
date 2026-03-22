import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../src/styles/colors";
import styles from "../src/styles/global";
import { Formato } from "../src/types";
import { getFormats, getCurrentUser } from "../src/config/ApiServices";

/**
 * Pantalla "Nuevo": Muestra la lista de plantillas disponibles
 * para crear y llenar un nuevo formato técnico.
 */
export default function FormsScreen() {
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.role === "SOCIOS") {
          setBlocked(true);
          Alert.alert("Acceso restringido", "Los socios no pueden crear formularios.");
          router.replace("/");
          return;
        }

        const data = await getFormats();
        setFormatos(data);
      } catch (_error) {
        router.replace("/login");
      }
    };

    init();
  }, []);

  if (blocked) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Ionicons name="add-circle" size={28} color={Colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.titulo, { marginBottom: 0 }]}>Nuevo Formulario</Text>
        </View>

        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
          Selecciona una plantilla para comenzar un registro nuevo.
        </Text>

        <FlatList
          data={formatos}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tarjeta, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
              onPress={() => router.push(`/formats/${item.id}?type=template` as any)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.subtitulo}>{item.codigo}</Text>
                <Text style={styles.texto}>{item.nombre}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}