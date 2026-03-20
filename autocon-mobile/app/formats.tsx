import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { formatsStyles as styles } from "../src/styles/formats";
import { Colors } from "../src/styles/colors";
import { getSubmissions } from "../src/config/ApiServices";

import FormatsHeader from "../components/formats/FormatsHeader";
import FilterPills, { FilterStatus } from "../components/formats/FilterPills";
import RecentItem, { formatRelativeDate } from "../components/home/RecentItem";

/** Interfaz compartida de un envío de formato */
interface Submission {
  id: number;
  titulo: string;
  codigo: string;
  estado: string;
  fecha: string;
}

/**
 * Pantalla "Formatos": Lista el historial de registros del usuario 
 * con buscador y filtros por estado.
 */
export default function FormatsScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("Todos");

  const fetchData = useCallback(async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error("Error al cargar submissions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Aplicar filtros locales (Búsqueda + Estado)
  const filteredData = useMemo(() => {
    return submissions.filter((item) => {
      // 1. Filtro por texto
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch =
        item.titulo.toLowerCase().includes(lowerQuery) ||
        item.codigo.toLowerCase().includes(lowerQuery);
      if (!matchesSearch) return false;

      // 2. Filtro por pill
      if (activeFilter === "Completados") return item.estado === "ENVIADO";
      if (activeFilter === "Pendientes") return item.estado === "BORRADOR";
      if (activeFilter === "En Progreso") return item.estado === "BORRADOR"; // Se asume igual
      
      return true; // "Todos"
    });
  }, [submissions, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* ── Header ────────────────────────────────────────────── */}
      <FormatsHeader />

      {/* ── Search Bar ────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar formatos..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={20} color={Colors.textPrimary} />
        </View>
      </View>

      {/* ── Filter Pills ──────────────────────────────────────── */}
      <View>
        <FilterPills
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />
      </View>

      {/* ── Lista de Resultados ───────────────────────────────── */}
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  {submissions.length === 0
                    ? "No tienes formatos registrados aún"
                    : "No se encontraron formatos para tu búsqueda"}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <RecentItem
                title={`#${item.id} - ${item.titulo}`}
                subtitle={item.codigo}
                status={item.estado}
                dateLabel={formatRelativeDate(item.fecha)}
                onPress={() => router.push(`/formats/${item.id}?type=instance` as any)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}