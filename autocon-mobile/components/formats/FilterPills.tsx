import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { formatsStyles as styles } from "../../src/styles/formats";

export type FilterStatus = "Todos" | "Pendientes" | "En Progreso" | "Completados";

interface FilterPillsProps {
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

const FILTERS: FilterStatus[] = ["Todos", "Pendientes", "En Progreso", "Completados"];

/**
 * Componente de píldoras horizontales para filtrar la lista de formatos.
 */
export default function FilterPills({ activeFilter, onSelectFilter }: FilterPillsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.pillsScroll}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
