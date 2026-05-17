import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/styles/colors";

interface FormProgressBarProps {
  /** Número de campos completados */
  completed: number;
  /** Número total de campos */
  total: number;
}

/**
 * Calcula el color de la barra según el porcentaje de avance.
 * 0%→gris, 1-49%→ámbar, 50-99%→azul, 100%→verde
 */
function getProgressColor(pct: number): string {
  if (pct === 0) return "#D1D5DB";
  if (pct < 50) return "#F59E0B";
  if (pct < 100) return "#3B82F6";
  return "#10B981";
}

function getProgressLabel(pct: number): string {
  if (pct === 0) return "Sin iniciar";
  if (pct < 50) return "En progreso";
  if (pct < 100) return "Casi listo";
  return "Completado";
}

/**
 * Barra de progreso animada para formularios técnicos.
 * Muestra una barra fina con porcentaje y conteo de campos.
 */
export default function FormProgressBar({ completed, total }: FormProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const barColor = getProgressColor(pct);
  const label = getProgressLabel(pct);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: pct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [pct, animatedWidth]);

  const animatedStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
      extrapolate: "clamp",
    }),
    backgroundColor: barColor,
  };

  return (
    <View style={progressStyles.container}>
      {/* ── Fila superior: etiqueta + porcentaje ────────────── */}
      <View style={progressStyles.headerRow}>
        <View style={progressStyles.labelRow}>
          <Ionicons
            name={pct === 100 ? "checkmark-circle" : "pie-chart-outline"}
            size={14}
            color={barColor}
          />
          <Text style={[progressStyles.label, { color: barColor }]}>
            {label}
          </Text>
        </View>
        <Text style={progressStyles.pctText}>{pct}%</Text>
      </View>

      {/* ── Barra ──────────────────────────────────────────── */}
      <View style={progressStyles.trackOuter}>
        <Animated.View style={[progressStyles.trackFill, animatedStyle]} />
      </View>

      {/* ── Conteo ─────────────────────────────────────────── */}
      <Text style={progressStyles.countText}>
        {completed} de {total} campos completados
      </Text>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  pctText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  trackOuter: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
  },
  countText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
