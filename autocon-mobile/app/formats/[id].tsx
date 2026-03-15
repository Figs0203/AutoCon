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
        <View key={seccion.id} style={styles.detalleSeccion}>
          <Text style={styles.subtitulo}>{seccion.titulo}</Text>

          {seccion.campos.map((campo: any) => (
            <View key={campo.id} style={styles.tarjeta}>
              <Text style={styles.texto}>{campo.label}</Text>

              {campo.tipo === "texto" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  style={styles.inputBase}
                />
              )}

              {campo.tipo === "fecha" && (
                <TextInput
                  placeholder="YYYY-MM-DD"
                  style={styles.inputBase}
                />
              )}

              {campo.tipo === "aprobacion" && (
                <View style={styles.filaOpciones}>
                  <TouchableOpacity style={[styles.boton, styles.botonFlexible, styles.botonAprobado]}>
                    <Text style={styles.botonTexto}> Aprobado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.boton, styles.botonFlexible, styles.botonNoAprobado]}>
                    <Text style={styles.botonTexto}> No aprobado</Text>
                  </TouchableOpacity>
                </View>
                
              )}
              
              {campo.tipo === "numero" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  keyboardType="numeric"
                  style={styles.inputBase}
                />
              )} 

              {campo.tipo === "seleccion" && (
                <View style={styles.filaOpciones}>
                  {campo.opciones.map((op: string) => (
                    <TouchableOpacity key={op} style={[styles.boton, styles.botonFlexible]}>
                      <Text style={styles.botonTexto}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {campo.tipo === "aprobacion_doble" && (
                <View>
                  {campo.revisiones.map((rev: string, i: number) => (
                    <View key={i} style={styles.filaRevision}>
                      <Text style={styles.textoRevision}>{rev}</Text>
                      <TouchableOpacity style={[styles.boton, styles.botonAprobado]}>
                        <Text style={styles.botonTexto}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.boton, styles.botonNoAprobado]}>
                        <Text style={styles.botonTexto}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {campo.observacion && (
                    <TextInput
                      placeholder="Observación..."
                      style={styles.inputBase}
                    />
                  )}
                </View>
              )}

              {campo.tipo === "novedad" && (
                <View style={styles.bloqueCampo}>
                  <View style={styles.filaInputs}>
                    <TextInput
                      placeholder="De (m)"
                      keyboardType="numeric"
                      style={[styles.inputInline, styles.inputFlexible]}
                    />
                    <TextInput
                      placeholder="A (m)"
                      keyboardType="numeric"
                      style={[styles.inputInline, styles.inputFlexible]}
                    />
                  </View>
                  <TextInput
                    placeholder="Observación..."
                    style={styles.inputBase}
                  />
                </View>
              )}

              {campo.tipo === "no_conformidad" && (
                <View style={styles.bloqueCampo}>
                  <TextInput
                    placeholder="N° Item no conforme"
                    style={styles.inputInline}
                  />
                  <TextInput
                    placeholder="Solución a la no conformidad..."
                    style={styles.inputBase}
                  />
                </View>
              )}

              {campo.tipo === "aprobacion_con_fecha" && (
                <View style={styles.bloqueCampo}>
                  <View style={styles.filaOpciones}>
                    <TouchableOpacity style={[styles.boton, styles.botonFlexible, styles.botonAprobado]}>
                      <Text style={styles.botonTexto}>Conforme</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.boton, styles.botonFlexible, styles.botonNoAprobado]}>
                      <Text style={styles.botonTexto}>No Conforme</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="Fecha de revisión (YYYY-MM-DD)"
                    style={styles.inputBase}
                  />
                  {campo.observacion && (
                    <TextInput
                      placeholder="Observación..."
                      style={styles.inputBase}
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