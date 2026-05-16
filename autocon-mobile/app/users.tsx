import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../src/styles/colors";
import styles from "../src/styles/global";
import { getSociosDashboard, getCurrentUser } from "../src/config/ApiServices";
import UsersHeader from "../components/users/UsersHeader";
import UserCard from "../components/users/UserCard";

interface Supervisor {
  id: number;
  nombre: string;
  email: string;
  formatos_diligenciados: number;
}

/**
 * Pantalla "Usuarios": Muestra lista de supervisores técnicos registrados.
 * Solo visible para usuarios con rol SOCIOS.
 */
export default function UsersScreen() {
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const init = async () => {
        setLoading(true);
        try {
          const user = await getCurrentUser();
          if (!active) return;

          if (!user) {
            router.replace("/login");
            return;
          }

          if (user.role !== "SOCIOS") {
            router.replace("/");
            return;
          }

          const dashboardData = await getSociosDashboard();
          if (!active) return;
          setSupervisores(dashboardData.supervisores || []);
        } catch (_error) {
          console.error("Error al cargar supervisores:", _error);
        } finally {
          if (active) setLoading(false);
        }
      };

      init();
      return () => {
        active = false;
      };
    }, [router])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const init = async () => {
      try {
        const dashboardData = await getSociosDashboard();
        setSupervisores(dashboardData.supervisores || []);
      } catch (_error) {
        console.error("Error al refrescar:", _error);
      } finally {
        setRefreshing(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={{ marginTop: 16, color: Colors.textSecondary }}>
            Cargando supervisores...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.container, { flex: 1 }]}>
        <UsersHeader />

        {supervisores.length === 0 ? (
          <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <Text style={{ marginTop: 12, color: Colors.textMuted }}>
              No hay supervisores registrados aún.
            </Text>
          </View>
        ) : (
          <FlatList
            data={supervisores}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <UserCard
                nombre={item.nombre}
                email={item.email}
                formularios={item.formatos_diligenciados}
              />
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
