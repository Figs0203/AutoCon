import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/styles/colors";
import { ImageInfo, LocalImage } from "../../src/types";

interface Props {
  readonly: boolean;
  images: ImageInfo[];
  pendingImages: LocalImage[];
  onPendingChange: (images: LocalImage[]) => void;
  onServerImageDelete: (imageId: number) => void;
  isSubmitting?: boolean;
}

export default function ImageAttachment({
  readonly,
  images,
  pendingImages,
  onPendingChange,
  onServerImageDelete,
  isSubmitting = false,
}: Props) {
  const MAX_IMAGES = 5;
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (antes de compresión para seguridad local)
  
  const currentTotal = images.length + pendingImages.length;

  const handlePickImages = async () => {
    if (currentTotal >= MAX_IMAGES) {
      Alert.alert("Límite alcanzado", `Solo puedes adjuntar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería para adjuntar imágenes.");
      return;
    }

    const maxToSelect = MAX_IMAGES - currentTotal;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxToSelect,
      quality: 1, // Calidad inicial, luego la comprimimos manualmente
    });

    if (!result.canceled && result.assets) {
      const newPending = [...pendingImages];
      
      for (const asset of result.assets) {
        if (newPending.length + images.length >= MAX_IMAGES) break;

        // Comprimir imagen y redimensionar
        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1200 } }], // Redimensionar si es muy grande
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          // Verificar si el archivo tiene info, ImageManipulator genera nuevo archivo
          // Estimación de peso o uso directo
          newPending.push({
            uri: manipResult.uri,
            fileName: asset.fileName || `adjunto_${Date.now()}.jpg`,
            fileSize: asset.fileSize || 0, // Fallback, el back validará exacto
            mimeType: "image/jpeg",
          });
        } catch (error) {
          console.error("Error comprimiendo imagen", error);
        }
      }

      onPendingChange(newPending);
    }
  };

  const removePending = (index: number) => {
    const newPending = [...pendingImages];
    newPending.splice(index, 1);
    onPendingChange(newPending);
  };

  const removeServerImage = (item: ImageInfo) => {
    Alert.alert(
      "Eliminar imagen",
      "¿Estás seguro de que deseas eliminar esta imagen? Se eliminará permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => onServerImageDelete(item.id) 
        }
      ]
    );
  };

  const getFullUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    // Si viene como /media/... desde el backend, le podemos anexar env o lo maneja auth
    // Depende del framework, pero asumimos que el serializer manda ruta completa o un helper a nivel global
    // El serializer de Django con context={"request": request} retorna rutas absolutas.
    return url;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evidencia Fotográfica</Text>
        <Text style={styles.counter}>{currentTotal}/{MAX_IMAGES}</Text>
      </View>

      {!readonly && currentTotal < MAX_IMAGES && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handlePickImages}
          disabled={isSubmitting}
        >
          <Ionicons name="images-outline" size={24} color={Colors.accent} />
          <Text style={styles.addButtonText}>Adjuntar imágenes de galería</Text>
        </TouchableOpacity>
      )}

      {currentTotal > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.grid}>
          {/* Imágenes ya guardadas en servidor */}
          {images.map((img) => (
            <View key={`server_${img.id}`} style={styles.imageWrapper}>
              <Image source={{ uri: getFullUrl(img.imagen) }} style={styles.image} />
              {!readonly && (
                <TouchableOpacity
                  style={styles.deleteBadge}
                  onPress={() => removeServerImage(img)}
                  disabled={isSubmitting}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Imágenes pendientes por subir */}
          {pendingImages.map((img, index) => (
            <View key={`pending_${index}`} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={[styles.image, { opacity: 0.8 }]} />
              {!readonly && (
                <TouchableOpacity
                  style={styles.deleteBadge}
                  onPress={() => removePending(index)}
                  disabled={isSubmitting}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              )}
              {/* Overlay de carga subiendo */}
              {isSubmitting && (
                <View style={styles.loadingOverlay}>
                   <ActivityIndicator color={Colors.white} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      
      {currentTotal === 0 && (
        <Text style={styles.emptyText}>No hay imágenes adjuntas.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  counter: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: "dashed",
    backgroundColor: "#FFFDF6",
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});
