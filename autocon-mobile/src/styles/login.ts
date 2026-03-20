import { Platform, StyleSheet } from "react-native";
import { Colors } from "./colors";

const IS_WEB = Platform.OS === "web";

export const loginStyles = StyleSheet.create({
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
    width: "100%",
    minHeight: 190,
    maxHeight: 260,
    aspectRatio: 16 / 7,
    backgroundColor: Colors.headerDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  webHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 18, 42, 0.22)",
  },
  webHeaderImageContain: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bodyCard: {
    marginTop: IS_WEB ? 0 : -24,
    marginHorizontal: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 26,
    borderWidth: 0,
  },
  bodyTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bodySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    color: Colors.textPrimary,
    marginBottom: 14,
    fontSize: 16,
  },
  passwordWrap: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordWrapError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  passwordInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    marginTop: -6,
    marginBottom: 8,
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  domainHint: {
    fontSize: 13,
    color: Colors.accent,
    textAlign: "right",
    marginBottom: 14,
    fontWeight: "600",
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.headerDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 17,
  },
  secondaryButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.headerDark,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.headerDark,
    fontWeight: "600",
    fontSize: 15,
  },
});
