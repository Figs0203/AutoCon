import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import HomeHeader from "../components/home/HomeHeader";
import SociosHomeView from "../components/home/SociosHomeView";
import SupervisorHomeView from "../components/home/SupervisorHomeView";
import { homeStyles as styles } from "../src/styles/home";
import { Colors } from "../src/styles/colors";
import {
  getDashboardStats,
  getRecentSubmissions,
  getCurrentUser,
  getSocioFormularios,
  getSocioFormulariosArchivados,
  archivarFormulario,
  desarchivarFormulario,
  logout,
} from "../src/config/ApiServices";
import { useFocusEffect } from "expo-router";

interface SocioFormulario {
  id: number;
  nombre_personalizado: string;
  codigo: string;
  supervisor: string;
  fecha: string;
  estado: string;
}

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

interface SociosResumen {
  total_supervisores: number;
  total_formatos_diligenciados: number;
  formatos_enviados: number;
  formatos_borrador: number;
  formatos_este_mes: number;
}

interface SociosSupervisor {
  id: number;
  nombre: string;
  email: string;
  formatos_diligenciados: number;
}

interface SociosDashboardResponse {
  resumen: SociosResumen;
  supervisores: SociosSupervisor[];
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
  const [role, setRole] = useState<string | null>(null);
  const [sociosFormularios, setSociosFormularios] = useState<SocioFormulario[]>([]);
  const [sociosArchivados, setSociosArchivados] = useState<SocioFormulario[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }, [router]);

  const ensureAuth = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setRole(user?.role ?? null);
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
      if (role === "SOCIOS") {
        setLoadingArchived(true);
        const [forms, archived] = await Promise.all([
          getSocioFormularios(),
          getSocioFormulariosArchivados(),
        ]);
        setSociosFormularios(forms || []);
        setSociosArchivados(archived || []);
        setStats(null);
        setRecent([]);
        setLoadingArchived(false);
      } else {
        const [statsData, recentData] = await Promise.all([
          getDashboardStats(),
          getRecentSubmissions(),
        ]);
        setStats(statsData);
        setRecent(recentData);
      }
    } catch (error) {
      console.error("Error al cargar el dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authorized, role]);

  useEffect(() => {
    if (authorized && role) {
      fetchData();
    }
  }, [fetchData, authorized, role]);

  const onRefresh = useCallback(() => {
    if (!authorized) return;
    setRefreshing(true);
    fetchData();
  }, [authorized, fetchData]);

  // ── Archivado ──────────────────────────────────────────────
  const handleArchive = useCallback(async (formId: number) => {
    // Actualización optimista
    const prevForms = sociosFormularios;
    const formToArchive = sociosFormularios.find((f) => f.id === formId);
    setSociosFormularios((prev) => prev.filter((f) => f.id !== formId));
    if (formToArchive) {
      setSociosArchivados((prev) => [formToArchive, ...prev]);
    }

    try {
      await archivarFormulario(formId);
      Alert.alert(
        "Formulario archivado",
        "Puedes encontrarlo en la sección de Formularios Archivados."
      );
    } catch (error: any) {
      // Revertir en caso de error
      setSociosFormularios(prevForms);
      setSociosArchivados((prev) => prev.filter((f) => f.id !== formId));
      Alert.alert("Error", error.message || "No se pudo archivar el formulario.");
    }
  }, [sociosFormularios]);

  const handleUnarchive = useCallback(async (formId: number) => {
    // Actualización optimista
    const prevArchived = sociosArchivados;
    const formToUnarchive = sociosArchivados.find((f) => f.id === formId);
    setSociosArchivados((prev) => prev.filter((f) => f.id !== formId));
    if (formToUnarchive) {
      setSociosFormularios((prev) => [formToUnarchive, ...prev]);
    }

    try {
      await desarchivarFormulario(formId);
      Alert.alert(
        "Formulario desarchivado",
        "El formulario ha sido restaurado al listado principal."
      );
    } catch (error: any) {
      // Revertir en caso de error
      setSociosArchivados(prevArchived);
      setSociosFormularios((prev) => prev.filter((f) => f.id !== formId));
      Alert.alert("Error", error.message || "No se pudo desarchivar el formulario.");
    }
  }, [sociosArchivados]);

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
        <HomeHeader onLogout={handleLogout} />

        {/* ── Cuerpo ──────────────────────────────────────────── */}
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
            </View>
          ) : role === "SOCIOS" ? (
            <SociosHomeView
              forms={sociosFormularios}
              archivedForms={sociosArchivados}
              loadingArchived={loadingArchived}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
            />
          ) : (
            <SupervisorHomeView stats={stats} recent={recent} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
