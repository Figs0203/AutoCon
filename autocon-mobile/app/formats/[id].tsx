import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../src/styles/global";
import { Formato } from "../../src/types";
import { API_URL } from "../../src/config/ApiServices";

export default function DetalleFormato() {
  const { id } = useLocalSearchParams();
  const [formato, setFormato] = useState<Formato | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/formats/${id}/`)
      .then(res => {
        console.log("schema:", JSON.stringify(res.data.schema));
        setFormato(res.data);
      })
      .catch(err => {
        console.log("Error API:", err.message);
      });
  }, [id]);

  if (!formato) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{formato.nombre}</Text>
      <Text style={styles.textoGris}>{formato.codigo}</Text>

      {formato.schema.secciones.map((seccion: any) => (
        <View key={seccion.id} style={{ marginTop: 20 }}>
          <Text style={styles.subtitulo}>{seccion.titulo}</Text>

          {seccion.campos.map((campo: any) => (
            <View key={campo.id} style={styles.tarjeta}>
              <Text style={styles.texto}>{campo.label}</Text>

              {campo.tipo === "texto" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  style={{ borderBottomWidth: 1, borderColor: "#ccc", marginTop: 8, padding: 4 }}
                />
              )}

              {campo.tipo === "fecha" && (
                <TextInput
                  placeholder="YYYY-MM-DD"
                  style={{ borderBottomWidth: 1, borderColor: "#ccc", marginTop: 8, padding: 4 }}
                />
              )}

              {campo.tipo === "aprobacion" && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={[styles.boton, { flex: 1, backgroundColor: "#4CAF50" }]}>
                    <Text style={styles.botonTexto}> Aprobado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.boton, { flex: 1, backgroundColor: "#f44336" }]}>
                    <Text style={styles.botonTexto}> No aprobado</Text>
                  </TouchableOpacity>
                </View>
                
              )}
              
              {campo.tipo === "numero" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  keyboardType="numeric"
                  style={{ borderBottomWidth: 1, borderColor: "#ccc", marginTop: 8, padding: 4 }}
                />
              )} 

              {campo.tipo === "seleccion" && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  {campo.opciones.map((op: string) => (
                    <TouchableOpacity key={op} style={[styles.boton, { flex: 1 }]}>
                      <Text style={styles.botonTexto}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {campo.tipo === "aprobacion_doble" && (
                <View>
                  {campo.revisiones.map((rev: string, i: number) => (
                    <View key={i} style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                      <Text style={{ flex: 1, color: "#666" }}>{rev}</Text>
                      <TouchableOpacity style={[styles.boton, { backgroundColor: "#4CAF50" }]}>
                        <Text style={styles.botonTexto}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.boton, { backgroundColor: "#f44336" }]}>
                        <Text style={styles.botonTexto}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {campo.observacion && (
                    <TextInput
                      placeholder="Observación..."
                      style={{ borderBottomWidth: 1, borderColor: "#ccc", marginTop: 8, padding: 4 }}
                    />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}