import { StyleSheet, Platform } from "react-native";
import { Colors } from "./colors";

export const homeStyles = StyleSheet.create({
  // ── Layout principal ───────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ─────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.headerDark,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greetingSmall: {
    fontSize: 14,
    color: Colors.textWhiteMuted,
    marginBottom: 2,
  },
  greetingLarge: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textWhite,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentLight,
    borderWidth: 1.5,
    borderColor: Colors.headerDark,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.searchBar,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.searchBarPlaceholder,
  },

  // ── Cuerpo ─────────────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Grid de stats ──────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 130,
    justifyContent: "space-between",
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statCount: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  // ── Recientes ──────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
  },
  recentCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  recentCardContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  recentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  recentDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recentDateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  chevron: {
    marginLeft: 8,
  },

  // ── Estado vacío ───────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },

  // ── Cargando ───────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
