import { StyleSheet } from "react-native";
import { Colors } from "./colors";

export const registerStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.headerDark,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  appName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSub: {
    color: Colors.textWhiteMuted,
    fontSize: 13,
    marginBottom: 14,
  },
  roleTabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    marginTop: 4,
  },
  roleTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  roleTabActive: {
    borderBottomColor: Colors.accent,
  },
  roleTabTitle: {
    color: Colors.textWhiteMuted,
    fontSize: 16,
    fontWeight: "700",
  },
  roleTabTitleActive: {
    color: Colors.accent,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "600",
  },
  errorMsg: {
    marginTop: 5,
    fontSize: 11,
    color: "#EF4444",
  },
  passwordWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    marginRight: 8,
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  loginLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  loginLink: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
});
