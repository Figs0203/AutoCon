import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import RecentItem from "./RecentItem";
import { homeStyles as styles } from "../../src/styles/home";
import { Colors } from "../../src/styles/colors";

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

interface SociosHomeViewProps {
  data: SociosDashboardResponse | null;
}

export default function SociosHomeView({ data }: SociosHomeViewProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Supervisores y Formatos</Text>
      </View>

      {(data?.supervisores?.length ?? 0) === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay supervisores registrados</Text>
        </View>
      ) : (
        data!.supervisores.map((supervisor) => (
          <RecentItem
            key={supervisor.id}
            title={supervisor.nombre}
            subtitle={supervisor.email}
            status={supervisor.formatos_diligenciados > 0 ? "ENVIADO" : "BORRADOR"}
            dateLabel={`${supervisor.formatos_diligenciados} formatos diligenciados`}
          />
        ))
      )}
    </>
  );
}
