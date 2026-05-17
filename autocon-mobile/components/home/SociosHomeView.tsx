import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import RecentItem from "./RecentItem";
import { homeStyles as styles } from "../../src/styles/home";
import { Colors } from "../../src/styles/colors";

interface SocioFormulario {
  id: number;
  nombre_personalizado: string;
  codigo: string;
  supervisor: string;
  fecha: string;
  estado: string;
}

interface SociosHomeViewProps {
  forms: SocioFormulario[];
  archivedForms: SocioFormulario[];
  loadingArchived: boolean;
  onArchive: (id: number) => void;
  onUnarchive: (id: number) => void;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SociosHomeView({
  forms,
  archivedForms,
  loadingArchived,
  onArchive,
  onUnarchive,
}: SociosHomeViewProps) {
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);

  return (
    <>
      {/* ── Formularios activos ──────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Formularios Diligenciados</Text>
      </View>

      {forms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay formularios disponibles aún.</Text>
        </View>
      ) : (
        forms.map((form) => (
          <RecentItem
            key={form.id}
            title={form.nombre_personalizado || form.codigo}
            subtitle={`${form.codigo} • ${form.supervisor}`}
            status={form.estado}
            dateLabel={formatDate(form.fecha)}
            onPress={() => router.push(`/formats/${form.id}?type=instance`)}
            onArchive={() => onArchive(form.id)}
          />
        ))
      )}

      {/* ── Banner informativo de archivados ─────────────────── */}
      {archivedForms.length > 0 && !showArchived && (
        <TouchableOpacity
          onPress={() => setShowArchived(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#EDE9FE",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginTop: 16,
            marginHorizontal: 4,
          }}
        >
          <Ionicons name="archive-outline" size={20} color="#7C3AED" />
          <Text
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              fontWeight: "600",
              color: "#5B21B6",
            }}
          >
            {archivedForms.length} formulario{archivedForms.length !== 1 ? "s" : ""} archivado{archivedForms.length !== 1 ? "s" : ""}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
        </TouchableOpacity>
      )}

      {/* ── Sección expandible de archivados ──────────────────── */}
      <TouchableOpacity
        onPress={() => setShowArchived(!showArchived)}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 24,
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="archive-outline" size={20} color={Colors.textSecondary} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 16,
              fontWeight: "700",
              color: Colors.textPrimary,
            }}
          >
            Formularios Archivados
          </Text>
        </View>
        <Ionicons
          name={showArchived ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {showArchived && (
        <View style={{ marginTop: 8 }}>
          {loadingArchived ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={Colors.accent} />
            </View>
          ) : archivedForms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="archive-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No hay formularios archivados.</Text>
            </View>
          ) : (
            archivedForms.map((form) => (
              <RecentItem
                key={form.id}
                title={form.nombre_personalizado || form.codigo}
                subtitle={`${form.codigo} • ${form.supervisor}`}
                status={form.estado}
                dateLabel={formatDate(form.fecha)}
                onPress={() => router.push(`/formats/${form.id}?type=instance`)}
                onUnarchive={() => onUnarchive(form.id)}
              />
            ))
          )}
        </View>
      )}
    </>
  );
}
