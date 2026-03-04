import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getForms } from '../src/services/apiService';

export default function ListFormScreen() {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        getForms().then(data => setForms(data));
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={forms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text>{item.nombre}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    card: { padding: 12, marginBottom: 8, backgroundColor: '#f0f0f0', borderRadius: 8 },
});