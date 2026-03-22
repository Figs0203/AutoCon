import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import StatCard from "./StatCard";
import RecentItem, { formatRelativeDate } from "./RecentItem";
import { homeStyles as styles } from "../../src/styles/home";
import { Colors } from "../../src/styles/colors";

interface DashboardStats {
  completados: number;
  pendientes: number;
  este_mes: number;
}

interface RecentSubmission {
  id: number;
  titulo: string;
  codigo: string;
  estado: string;
  fecha: string;
}

interface SupervisorHomeViewProps {
  stats: DashboardStats | null;
  recent: RecentSubmission[];
}

export default function SupervisorHomeView({ stats, recent }: SupervisorHomeViewProps) {
  const router = useRouter();

  return (
    <>
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
          count={(stats?.completados ?? 0) + (stats?.pendientes ?? 0)}
          label="Total"
          cardColor={Colors.cardPurple}
          iconBgColor={Colors.cardPurpleIcon}
          iconColor={Colors.cardPurpleIconFg}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recientes</Text>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay formularios recientes</Text>
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
  );
}
