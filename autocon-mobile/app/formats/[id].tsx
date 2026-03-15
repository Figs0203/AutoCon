import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import styles from "../../src/styles/global";
import { Formato } from "../../src/types";
import { API_URL, submitForm } from "../../src/config/ApiServices";

// ─── Tipos internos ─────────────────────────────────────────────────────────
type Respuestas = Record<string, any>;

// ─── Componente principal ───────────────────────────────────────────────────
export default function DetalleFormato() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formato, setFormato] = useState<Formato | null>(null);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [enviando, setEnviando] = useState(false);

  // ─── Cargar formato desde la API ────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/formats/${id}/`)
      .then(res => res.json())
      .then(data => setFormato(data))
      .catch(err => console.error("Error al cargar formato:", err.message));
  }, [id]);

  // ─── Helper para actualizar un campo en el estado ───────────────────────
  const actualizarCampo = useCallback((campoId: string, valor: any) => {
    setRespuestas(prev => ({ ...prev, [campoId]: valor }));
  }, []);

  // ─── Helper para campos compuestos (novedad, no_conformidad, etc.) ──────
  const actualizarSubcampo = useCallback(
    (campoId: string, subcampo: string, valor: any) => {
      setRespuestas(prev => ({
        ...prev,
        [campoId]: { ...(prev[campoId] || {}), [subcampo]: valor },
      }));
    },
    [],
  );

  // ─── Helper para aprobacion_doble (revisiones individuales) ─────────────
  const actualizarRevision = useCallback(
    (campoId: string, indiceRevision: number, valor: boolean) => {
      setRespuestas(prev => {
        const revisiones = Array.isArray(prev[campoId]?.revisiones)
          ? [...prev[campoId].revisiones]
          : [];
        revisiones[indiceRevision] = valor;
        return {
          ...prev,
          [campoId]: { ...(prev[campoId] || {}), revisiones },
        };
      });
    },
    [],
  );

  // ─── Enviar formulario ──────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (!id) return;

    setEnviando(true);
    try {
      const formatoId = Number(id);
      await submitForm(formatoId, respuestas);
      Alert.alert("Éxito", "Formulario enviado correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo enviar el formulario.");
    } finally {
      setEnviando(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────
  if (!formato) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────
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

              {/* ── Texto ──────────────────────────────────────── */}
              {campo.tipo === "texto" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  style={styles.inputBase}
                  value={respuestas[campo.id] ?? ""}
                  onChangeText={text => actualizarCampo(campo.id, text)}
                />
              )}

              {/* ── Fecha ──────────────────────────────────────── */}
              {campo.tipo === "fecha" && (
                <TextInput
                  placeholder="YYYY-MM-DD"
                  style={styles.inputBase}
                  value={respuestas[campo.id] ?? ""}
                  onChangeText={text => actualizarCampo(campo.id, text)}
                />
              )}

              {/* ── Aprobación simple ──────────────────────────── */}
              {campo.tipo === "aprobacion" && (
                <View style={styles.filaOpciones}>
                  <TouchableOpacity
                    style={[
                      styles.boton,
                      styles.botonFlexible,
                      respuestas[campo.id] === true
                        ? styles.botonAprobado
                        : styles.botonInactivo,
                    ]}
                    onPress={() => actualizarCampo(campo.id, true)}
                  >
                    <Text style={styles.botonTexto}>Aprobado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.boton,
                      styles.botonFlexible,
                      respuestas[campo.id] === false
                        ? styles.botonNoAprobado
                        : styles.botonInactivo,
                    ]}
                    onPress={() => actualizarCampo(campo.id, false)}
                  >
                    <Text style={styles.botonTexto}>No aprobado</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Número ─────────────────────────────────────── */}
              {campo.tipo === "numero" && (
                <TextInput
                  placeholder={`Ingrese ${campo.label}`}
                  keyboardType="numeric"
                  style={styles.inputBase}
                  value={respuestas[campo.id] ?? ""}
                  onChangeText={text => actualizarCampo(campo.id, text)}
                />
              )}

              {/* ── Selección ──────────────────────────────────── */}
              {campo.tipo === "seleccion" && (
                <View style={styles.filaOpciones}>
                  {campo.opciones.map((op: string) => (
                    <TouchableOpacity
                      key={op}
                      style={[
                        styles.boton,
                        styles.botonFlexible,
                        respuestas[campo.id] === op
                          ? styles.botonAprobado
                          : styles.botonInactivo,
                      ]}
                      onPress={() => actualizarCampo(campo.id, op)}
                    >
                      <Text style={styles.botonTexto}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* ── Aprobación doble (revisiones) ──────────────── */}
              {campo.tipo === "aprobacion_doble" && (
                <View>
                  {campo.revisiones.map((rev: string, i: number) => {
                    const valorRevision = respuestas[campo.id]?.revisiones?.[i];
                    return (
                      <View key={i} style={styles.filaRevision}>
                        <Text style={styles.textoRevision}>{rev}</Text>
                        <TouchableOpacity
                          style={[
                            styles.boton,
                            valorRevision === true
                              ? styles.botonAprobado
                              : styles.botonInactivo,
                          ]}
                          onPress={() => actualizarRevision(campo.id, i, true)}
                        >
                          <Text style={styles.botonTexto}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.boton,
                            valorRevision === false
                              ? styles.botonNoAprobado
                              : styles.botonInactivo,
                          ]}
                          onPress={() => actualizarRevision(campo.id, i, false)}
                        >
                          <Text style={styles.botonTexto}>✗</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {campo.observacion && (
                    <TextInput
                      placeholder="Observación..."
                      style={styles.inputBase}
                      value={respuestas[campo.id]?.observacion ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "observacion", text)
                      }
                    />
                  )}
                </View>
              )}

              {/* ── Novedad ────────────────────────────────────── */}
              {campo.tipo === "novedad" && (
                <View style={styles.bloqueCampo}>
                  <View style={styles.filaInputs}>
                    <TextInput
                      placeholder="De (m)"
                      keyboardType="numeric"
                      style={[styles.inputInline, styles.inputFlexible]}
                      value={respuestas[campo.id]?.de ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "de", text)
                      }
                    />
                    <TextInput
                      placeholder="A (m)"
                      keyboardType="numeric"
                      style={[styles.inputInline, styles.inputFlexible]}
                      value={respuestas[campo.id]?.a ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "a", text)
                      }
                    />
                  </View>
                  <TextInput
                    placeholder="Observación..."
                    style={styles.inputBase}
                    value={respuestas[campo.id]?.observacion ?? ""}
                    onChangeText={text =>
                      actualizarSubcampo(campo.id, "observacion", text)
                    }
                  />
                </View>
              )}

              {/* ── No Conformidad ─────────────────────────────── */}
              {campo.tipo === "no_conformidad" && (
                <View style={styles.bloqueCampo}>
                  <TextInput
                    placeholder="N° Item no conforme"
                    style={styles.inputInline}
                    value={respuestas[campo.id]?.item ?? ""}
                    onChangeText={text =>
                      actualizarSubcampo(campo.id, "item", text)
                    }
                  />
                  <TextInput
                    placeholder="Solución a la no conformidad..."
                    style={styles.inputBase}
                    value={respuestas[campo.id]?.solucion ?? ""}
                    onChangeText={text =>
                      actualizarSubcampo(campo.id, "solucion", text)
                    }
                  />
                </View>
              )}

              {/* ── Aprobación con fecha ───────────────────────── */}
              {campo.tipo === "aprobacion_con_fecha" && (
                <View style={styles.bloqueCampo}>
                  <View style={styles.filaOpciones}>
                    <TouchableOpacity
                      style={[
                        styles.boton,
                        styles.botonFlexible,
                        respuestas[campo.id]?.conforme === true
                          ? styles.botonAprobado
                          : styles.botonInactivo,
                      ]}
                      onPress={() =>
                        actualizarSubcampo(campo.id, "conforme", true)
                      }
                    >
                      <Text style={styles.botonTexto}>Conforme</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.boton,
                        styles.botonFlexible,
                        respuestas[campo.id]?.conforme === false
                          ? styles.botonNoAprobado
                          : styles.botonInactivo,
                      ]}
                      onPress={() =>
                        actualizarSubcampo(campo.id, "conforme", false)
                      }
                    >
                      <Text style={styles.botonTexto}>No Conforme</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="Fecha de revisión (YYYY-MM-DD)"
                    style={styles.inputBase}
                    value={respuestas[campo.id]?.fecha ?? ""}
                    onChangeText={text =>
                      actualizarSubcampo(campo.id, "fecha", text)
                    }
                  />
                  {campo.observacion && (
                    <TextInput
                      placeholder="Observación..."
                      style={styles.inputBase}
                      value={respuestas[campo.id]?.observacion ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "observacion", text)
                      }
                    />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}

      {/* ── Botón Enviar ─────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.botonEnviar, enviando && styles.botonDeshabilitado]}
        onPress={handleEnviar}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Enviar Formulario</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}