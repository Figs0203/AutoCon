import { View, Button } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Button title="Ver lista" onPress={() => router.push('/list')} />
    </View>
  );
}