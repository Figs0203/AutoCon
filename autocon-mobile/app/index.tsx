import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import HomeHeader from "../components/home/HomeHeader";
import StatCard from "../components/home/StatCard";
import RecentItem, { formatRelativeDate } from "../components/home/RecentItem";
import { homeStyles as styles } from "../src/styles/home";
import { Colors } from "../src/styles/colors";
import {
  getDashboardStats,
  getRecentSubmissions,
  getCurrentUser,
} from "../src/config/ApiServices";
import { useFocusEffect } from "expo-router";

/** Interfaz de respuesta del backend /formats/dashboard/ */
interface DashboardStats {
  completados: number;
  pendientes: number;
  este_mes: number;
}

/** Interfaz de cada item de /formats/recent/ */
interface RecentSubmission {
  id: number;
  titulo: string;
  codigo: string;
  estado: string;
  fecha: string;
}

/**
 * Pantalla principal (Inicio) del dashboard.
 * Muestra estadísticas y formularios recientes.
 */
export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const ensureAuth = useCallback(async () => {
    try {
      await getCurrentUser();
      setAuthorized(true);
    } catch (_error) {
      setAuthorized(false);
      router.replace("/login");
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setAuthorized(null);
      setLoading(true);
      ensureAuth();
    }, [ensureAuth])
  );

  const fetchData = useCallback(async () => {
    if (!authorized) return;

    try {
      const [statsData, recentData] = await Promise.all([
        getDashboardStats(),
        getRecentSubmissions(),
      ]);
      setStats(statsData);
      setRecent(recentData);
    } catch (error) {
      console.error("Error al cargar el dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authorized]);

  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    if (!authorized) return;
    setRefreshing(true);
    fetchData();
  }, [authorized, fetchData]);

  if (authorized === null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <HomeHeader />

        {/* ── Cuerpo ──────────────────────────────────────────── */}
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
            </View>
          ) : (
            <>
              {/* ── Tarjetas de estadísticas ───────────────────── */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="checkmark-done-outline"
                  count={stats?.completados ?? 0}
                  label="Completados"
                  cardColor={Colors.cardGreen}
                  iconBgColor={Colors.cardGreenIcon}
                  iconColor={Colors.cardGreenIconFg}
                />
                <StatCard
                  icon="time-outline"
                  count={stats?.pendientes ?? 0}
                  label="Pendientes"
                  cardColor={Colors.cardYellow}
                  iconBgColor={Colors.cardYellowIcon}
                  iconColor={Colors.cardYellowIconFg}
                />
                <StatCard
                  icon="trending-up-outline"
                  count={stats?.este_mes ?? 0}
                  label="Este Mes"
                  cardColor={Colors.cardBlue}
                  iconBgColor={Colors.cardBlueIcon}
                  iconColor={Colors.cardBlueIconFg}
                />
                <StatCard
                  icon="documents-outline"
                  count={
                    (stats?.completados ?? 0) + (stats?.pendientes ?? 0)
                  }
                  label="Total"
                  cardColor={Colors.cardPurple}
                  iconBgColor={Colors.cardPurpleIcon}
                  iconColor={Colors.cardPurpleIconFg}
                />
              </View>

              {/* ── Recientes ─────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recientes</Text>
              </View>

              {recent.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.emptyText}>
                    No hay formularios recientes
                  </Text>
                </View>
              ) : (
                recent.map((item) => (
                  <RecentItem
                    key={item.id}
                    title={`#${item.id} - ${item.titulo}`}
                    subtitle={item.codigo}
                    status={item.estado}
                    dateLabel={formatRelativeDate(item.fecha)}
                    onPress={() => router.push(`/formats/${item.id}?type=instance` as any)}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
