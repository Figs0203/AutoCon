import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

import styles from "../../src/styles/global";

type SignatureFieldProps = {
  label: string;
  value?: string;
  readonly?: boolean;
  onChange: (signatureBase64: string) => void;
  onClear: () => void;
};

export default function SignatureField({
  label,
  value,
  readonly = false,
  onChange,
  onClear,
}: SignatureFieldProps) {
  const signatureRef = useRef<any>(null);
  const [openPad, setOpenPad] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!signatureRef.current) return;
    setSaving(true);
    signatureRef.current.readSignature();
  };

  const handleOk = (signature: string) => {
    onChange(signature);
    setSaving(false);
    setOpenPad(false);
  };

  const handleEmpty = () => {
    setSaving(false);
  };

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.subtitulo}>{label}</Text>

      {value ? (
        <Image
          source={{ uri: value }}
          style={{ width: "100%", height: 120, borderRadius: 10, marginTop: 10 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.textoGris}>Sin firma</Text>
      )}

      {!readonly && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <TouchableOpacity
            style={[styles.boton, styles.botonFlexible, styles.botonAprobado]}
            onPress={() => setOpenPad(true)}
          >
            <Text style={styles.botonTexto}>{value ? "Editar firma" : "Firmar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boton, styles.botonFlexible, styles.botonNoAprobado]}
            onPress={onClear}
          >
            <Text style={styles.botonTexto}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={openPad} animationType="slide" onRequestClose={() => setOpenPad(false)}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={[styles.subtitulo, { marginBottom: 0 }]}>{label}</Text>
            <TouchableOpacity onPress={() => setOpenPad(false)}>
              <Text style={[styles.texto, { color: "#DC2626" }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOk}
              onEmpty={handleEmpty}
              autoClear={false}
              descriptionText="Firma en el recuadro"
              clearText="Limpiar"
              confirmText="Listo"
              webStyle={`.m-signature-pad--footer {display: none;}`}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12, padding: 16 }}>
            <TouchableOpacity
              style={[styles.botonEnviar, { flex: 1, backgroundColor: "#64748B" }]}
              onPress={() => signatureRef.current?.clearSignature()}
            >
              <Text style={styles.botonTexto}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonEnviar, { flex: 1, backgroundColor: "#10B981" }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Guardar firma</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
