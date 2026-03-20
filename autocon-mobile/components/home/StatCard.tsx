import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles as styles } from "../../src/styles/home";

interface StatCardProps {
  /** Nombre del ícono de Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Valor numérico a mostrar */
  count: number;
  /** Etiqueta bajo el número (e.g. "Completados") */
  label: string;
  /** Color de fondo de la tarjeta */
  cardColor: string;
  /** Color de fondo del círculo del ícono */
  iconBgColor: string;
  /** Color del ícono */
  iconColor: string;
}

/**
 * Tarjeta de estadísticas para el dashboard.
 * Muestra un ícono, un conteo grande y una etiqueta descriptiva.
 */
export default function StatCard({
  icon,
  count,
  label,
  cardColor,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: cardColor }]}>
      <View style={[styles.statIconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}
