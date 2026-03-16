import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../src/styles/global";
import { Formato } from "../../src/types";
import { API_URL, submitForm, getSubmissionDetail, updateSubmission, deleteSubmission } from "../../src/config/ApiServices";

type Respuestas = Record<string, any>;

export default function DetalleFormato() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  
  const [formato, setFormato] = useState<Formato | null>(null);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [estado, setEstado] = useState<string>("BORRADOR");
  const [cargando, setCargando] = useState(true);
  const [enviandoBorrador, setEnviandoBorrador] = useState(false);
  const [enviandoCompletado, setEnviandoCompletado] = useState(false);

  const isInitialLoad = useRef(true);
  const localDraftKey = `draft_${type}_${id}`;

  // ─── Cargar Base (Plantilla o Instancia + Draft Local) ─────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        let baseRespuestas = {};
        let currentEstado = "BORRADOR";
        
        if (type === "instance") {
          const instanciaObj = await getSubmissionDetail(id);
          baseRespuestas = instanciaObj.datos || {};
          currentEstado = instanciaObj.estado;
          setEstado(currentEstado);
          
          const formatoIdObj = typeof instanciaObj.formato === 'object' ? instanciaObj.formato.id : instanciaObj.formato;
          const res = await fetch(`${API_URL}/formats/${formatoIdObj}/`);
          setFormato(await res.json());
        } else {
          const res = await fetch(`${API_URL}/formats/${id}/`);
          setFormato(await res.json());
          setEstado("BORRADOR");
        }

        // Si el cuestionario no está finalizado, revisar si hay un borrador local más reciente
        if (currentEstado !== "ENVIADO") {
          const localDraft = await AsyncStorage.getItem(localDraftKey);
          if (localDraft) {
            baseRespuestas = JSON.parse(localDraft);
          }
        }
        
        setRespuestas(baseRespuestas);
      } catch (error: any) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del formulario.");
      } finally {
        setCargando(false);
        // Permitir que el auto-save empiece a registrar cambios después de cargar
        setTimeout(() => { isInitialLoad.current = false; }, 500); 
      }
    };
    if (id) cargarDatos();
  }, [id, type]);

  // ─── Autoguardado Local (Invisible) ────────────────────────────────────────
  useEffect(() => {
    if (isInitialLoad.current || estado === "ENVIADO") return;

    const autoSave = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(localDraftKey, JSON.stringify(respuestas));
      } catch (e) {
        console.error("Error guardando borrador localmente", e);
      }
    }, 1000); // Guarda 1 segundo después de dejar de escribir

    return () => clearTimeout(autoSave);
  }, [respuestas, estado]);

  // ─── Helpers de actualización de campos ────────────────────────────────────
  const actualizarCampo = useCallback((campoId: string, valor: any) => {
    setRespuestas(prev => ({ ...prev, [campoId]: valor }));
  }, []);

  const actualizarSubcampo = useCallback(
    (campoId: string, subcampo: string, valor: any) => {
      setRespuestas(prev => ({
        ...prev,
        [campoId]: { ...(prev[campoId] || {}), [subcampo]: valor },
      }));
    },
    []
  );

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
    []
  );

  const isDraftEmpty = (resp: Respuestas): boolean => {
    if (!resp || Object.keys(resp).length === 0) return true;
    for (const key in resp) {
      if (!Object.prototype.hasOwnProperty.call(resp, key)) continue;
      const v = resp[key];
      
      if (v === null || v === undefined) continue;
      
      // Si hay un booleano (true o false), se considera que el usuario ya tomó una decisión (ej. check de aprobación)
      if (typeof v === 'boolean') return false;
      
      // Si hay un número (ej. 0), se considera que hay un valor ingresado
      if (typeof v === 'number') return false;
      
      // Si hay una cadena con contenido real
      if (typeof v === 'string' && v.trim().length > 0) return false;
      if (typeof v === 'string' && v.trim().length === 0) continue;

      // Si es un arreglo (ej. revisiones), verificar si todos sus ítems están vacíos
      if (Array.isArray(v)) {
        const hasData = v.some(item => {
          if (item === null || item === undefined) return false;
          if (typeof item === 'boolean') return true;
          if (typeof item === 'number') return true;
          if (typeof item === 'string' && item.trim().length > 0) return true;
          return false;
        });
        if (hasData) return false;
        continue;
      }

      // Si es un objeto anidado (ej. novedades o no conformidades)
      if (typeof v === 'object') {
        if (!isDraftEmpty(v)) return false;
        continue;
      }
    }
    return true;
  };

  // ─── Guardar en la Base de Datos Oficial ──────────────────────────────────
  const handleGuardar = async (nuevoEstado: "BORRADOR" | "ENVIADO") => {
    if (!id) return;
    
    // Evitar borradores vacíos
    if (isDraftEmpty(respuestas)) {
      if (type === "instance") {
        try {
          await deleteSubmission(id);
          await AsyncStorage.removeItem(localDraftKey);
          Alert.alert("Borrador Eliminado", "Como el borrador no contenía ninguna información, fue eliminado automáticamente para mantener tu bandeja limpia.");
          router.back();
        } catch (error) {
          Alert.alert("Error", "No se pudo eliminar el borrador vacío.");
        }
      } else {
        await AsyncStorage.removeItem(localDraftKey);
        Alert.alert("Descartado", "Como no completaste ninguna información, el borrador no se ha guardado.");
        router.back();
      }
      return;
    }

    if (nuevoEstado === "BORRADOR") setEnviandoBorrador(true);
    else setEnviandoCompletado(true);

    try {
      if (type === "instance") {
        await updateSubmission(id, respuestas, nuevoEstado);
      } else {
        await submitForm(id, respuestas, nuevoEstado);
      }
      setEstado(nuevoEstado);
      
      // Limpiar el borrador local ya que se guardó en la base de datos central
      await AsyncStorage.removeItem(localDraftKey);

      Alert.alert("Éxito", nuevoEstado === "ENVIADO" ? "Tu cuestionario ha sido enviado exitosamente." : "Borrador guardado exitosamente.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo comunicar con el servidor.");
    } finally {
      if (nuevoEstado === "BORRADOR") setEnviandoBorrador(false);
      else setEnviandoCompletado(false);
    }
  };

  if (cargando || !formato) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={[styles.textoGris, { marginTop: 16 }]}>Cargando formulario...</Text>
      </View>
    );
  }

  // Si ya está completado, idealmente se mostraría en modo sólo lectura,
  // pero por ahora mantenemos el formulario igual o ligeramente alterado.
  const readonly = estado === "ENVIADO";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>{type === "instance" ? `#${id} - ` : ""}{formato.nombre}</Text>
      <Text style={styles.textoGris}>{formato.codigo} - {type === "instance" ? `Editando (${estado})` : "Nuevo Registro"}</Text>

      <View style={{ marginBottom: 40 }} pointerEvents={readonly ? "none" : "auto"}>
        {formato.schema.secciones.map((seccion: any) => (
          <View key={seccion.id} style={[styles.detalleSeccion, readonly && { opacity: 0.7 }]}>
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
                    editable={!readonly}
                  />
                )}

                {/* ── Fecha ──────────────────────────────────────── */}
                {campo.tipo === "fecha" && (
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    style={styles.inputBase}
                    value={respuestas[campo.id] ?? ""}
                    onChangeText={text => actualizarCampo(campo.id, text)}
                    editable={!readonly}
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
                      onPress={() => !readonly && actualizarCampo(campo.id, true)}
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
                      onPress={() => !readonly && actualizarCampo(campo.id, false)}
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
                    editable={!readonly}
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
                        onPress={() => !readonly && actualizarCampo(campo.id, op)}
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
                            onPress={() => !readonly && actualizarRevision(campo.id, i, true)}
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
                            onPress={() => !readonly && actualizarRevision(campo.id, i, false)}
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
                        editable={!readonly}
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
                        editable={!readonly}
                      />
                      <TextInput
                        placeholder="A (m)"
                        keyboardType="numeric"
                        style={[styles.inputInline, styles.inputFlexible]}
                        value={respuestas[campo.id]?.a ?? ""}
                        onChangeText={text =>
                          actualizarSubcampo(campo.id, "a", text)
                        }
                        editable={!readonly}
                      />
                    </View>
                    <TextInput
                      placeholder="Observación..."
                      style={styles.inputBase}
                      value={respuestas[campo.id]?.observacion ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "observacion", text)
                      }
                      editable={!readonly}
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
                      editable={!readonly}
                    />
                    <TextInput
                      placeholder="Solución a la no conformidad..."
                      style={styles.inputBase}
                      value={respuestas[campo.id]?.solucion ?? ""}
                      onChangeText={text =>
                        actualizarSubcampo(campo.id, "solucion", text)
                      }
                      editable={!readonly}
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
                        onPress={() => !readonly &&
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
                        onPress={() => !readonly &&
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
                      editable={!readonly}
                    />
                    {campo.observacion && (
                      <TextInput
                        placeholder="Observación..."
                        style={styles.inputBase}
                        value={respuestas[campo.id]?.observacion ?? ""}
                        onChangeText={text =>
                          actualizarSubcampo(campo.id, "observacion", text)
                        }
                        editable={!readonly}
                      />
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
        
        {/* ── Botones de Gestión ───────────────────────────────── */}
        {!readonly && (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {/* Botón Borrador */}
            <TouchableOpacity
              style={[styles.botonEnviar, { flex: 1, backgroundColor: "#64748B" }, enviandoBorrador && styles.botonDeshabilitado]}
              onPress={() => handleGuardar("BORRADOR")}
              disabled={enviandoBorrador || enviandoCompletado}
            >
              {enviandoBorrador ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>Guardar Borrador</Text>
              )}
            </TouchableOpacity>

            {/* Botón Completar */}
            <TouchableOpacity
              style={[styles.botonEnviar, { flex: 1, backgroundColor: "#10B981" }, enviandoCompletado && styles.botonDeshabilitado]}
              onPress={() => handleGuardar("ENVIADO")}
              disabled={enviandoBorrador || enviandoCompletado}
            >
              {enviandoCompletado ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>Finalizar y Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}