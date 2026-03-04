import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getForms } from '../../src/services/ApiService';

export default function ListFormScreen() {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        getForms().then(data => setForms(data));
    }, []);

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
            <FlatList
                data={forms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}>
                        <Text>ID: {item.id}</Text>
                        <Text>Nombre: {item.name}</Text>
                        <Text>Descripción: {item.description}</Text>
                        <Text>Estado: {item.status}</Text>
                        <Text>Preguntas: {JSON.stringify(item.list_of_questions)}</Text>
                    </View>
                )}
            />
        </View>
    );
}