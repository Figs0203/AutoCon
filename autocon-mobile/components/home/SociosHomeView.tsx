import React from "react";
import { View, Text } from "react-native";
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
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SociosHomeView({ forms }: SociosHomeViewProps) {
  const router = useRouter();

  return (
    <>
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
          />
        ))
      )}
    </>
  );
}
