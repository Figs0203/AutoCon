import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../src/styles/colors";

/**
 * Layout raíz de la app: bottom tab bar con 4 pestañas.
 * Las pantallas de detalle (formats/[id]) se ocultan del tab bar.
 */
export default function RootLayout() {
  return (
    <Tabs
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.cardBorder,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* ── Inicio ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ── Formatos ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="formats"
        options={{
          title: "Formatos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reader-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ── Nuevo ────────────────────────────────────────────── */}
      <Tabs.Screen
        name="forms"
        options={{
          title: "Nuevo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ── Perfil (Oculto porque aún no existe) ────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      {/* ── Login (pantalla de acceso inicial) ─────────────── */}
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="register"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* ── Ocultar pantalla de detalle del tab bar ───────────── */}
      <Tabs.Screen
        name="formats/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
