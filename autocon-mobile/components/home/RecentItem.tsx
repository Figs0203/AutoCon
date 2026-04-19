import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles as styles } from "../../src/styles/home";
import { Colors } from "../../src/styles/colors";

interface RecentItemProps {
  /** Nombre del formato (título principal) */
  title: string;
  /** Código del formato */
  subtitle: string;
  /** Estado actual de la instancia */
  status: string;
  /** Fecha formateada para mostrar */
  dateLabel: string;
  /** Callback al presionar */
  onPress?: () => void;
  /** Callback al presionar el botón de eliminar */
  onDelete?: () => void;
}

/**
 * Mapea un estado del backend a la configuración visual del badge.
 */
function getBadgeConfig(status: string) {
  switch (status) {
    case "ENVIADO":
      return {
        label: "Completado",
        bg: Colors.badgeCompletado,
        text: Colors.badgeCompletadoText,
      };
    case "BORRADOR":
      return {
        label: "Pendiente",
        bg: Colors.badgePendiente,
        text: Colors.badgePendienteText,
      };
    default:
      return {
        label: status,
        bg: Colors.badgeBorrador,
        text: Colors.badgeBorradorText,
      };
  }
}

/**
 * Formatea una fecha ISO a un texto relativo legible en español.
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Item de la lista "Recientes": muestra título, subtítulo, badge de estado y fecha.
 */
export default function RecentItem({
  title,
  subtitle,
  status,
  dateLabel,
  onPress,
  onDelete,
}: RecentItemProps) {
  const badge = getBadgeConfig(status);

  return (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.recentCardContent}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.recentSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <View style={styles.recentMeta}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
          <View style={styles.recentDate}>
            <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.recentDateText}>{dateLabel}</Text>
          </View>
        </View>
      </View>
      {onDelete ? (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#FEE2E2",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      ) : null}
      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textMuted}
          style={styles.chevron}
        />
      ) : null}
    </TouchableOpacity>
  );
}
