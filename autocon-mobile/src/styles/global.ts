import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Contenedores
  container:  { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  
  // Tipografía
  titulo:     { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  subtitulo:  { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  texto:      { fontSize: 14, color: "#333" },
  textoGris:  { fontSize: 12, color: "#888" },

  // Tarjetas
  tarjeta:    { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 10,
                shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // Botones
  boton:      { backgroundColor: "#1976D2", padding: 14, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});