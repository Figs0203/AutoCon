import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import styles from "../src/styles/global";
import { Formato } from "../src/types";
import { router } from "expo-router";
import { API_URL } from "../src/config/ApiServices";


export default function Formatos() {
  const [formatos, setFormatos] = useState<Formato[]>([]);

  useEffect(() => {
    axios.get(`${API_URL}/formats/`).then(res => setFormatos(res.data));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Formatos Técnicos</Text>
      <FlatList
        data={formatos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
          style={styles.tarjeta}
          onPress={() => router.push(`/formats/${item.id}` as any)}
          >
            <Text style={styles.subtitulo}>{item.codigo}</Text>
            <Text style={styles.texto}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}