import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Contenedores
  container:  { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  detalleSeccion: { marginTop: 20 },
  bloqueCampo: { marginTop: 8 },
  filaOpciones: { flexDirection: "row", gap: 8, marginTop: 8 },
  filaInputs: { flexDirection: "row", gap: 8 },
  filaRevision: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" },
  
  // Tipografía
  titulo:     { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  subtitulo:  { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  texto:      { fontSize: 14, color: "#333" },
  textoGris:  { fontSize: 12, color: "#888" },
  textoRevision: { flex: 1, color: "#666" },

  // Tarjetas
  tarjeta:    { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 10,
                shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // Inputs
  inputBase: { borderBottomWidth: 1, borderColor: "#ccc", marginTop: 8, padding: 4 },
  inputInline: { borderBottomWidth: 1, borderColor: "#ccc", padding: 4 },
  inputFlexible: { flex: 1 },

  // Botones
  boton:      { backgroundColor: "#1976D2", padding: 14, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botonFlexible: { flex: 1 },
  botonAprobado: { backgroundColor: "#4CAF50" },
  botonNoAprobado: { backgroundColor: "#f44336" },
});