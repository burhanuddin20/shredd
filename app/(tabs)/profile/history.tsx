import { useState } from 'react';
import { FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Stack } from 'expo-router';

type Fast = {
  id: string;
  date: string;
  type: string;
  start: string;
  end: string;
  durationHrs: number;
  status: 'completed' | 'in-progress' | 'cancelled';
};

const MOCK: Fast[] = [
  { id: '1', date: '2025-09-24', type: '16:8', start: '20:00', end: '12:00', durationHrs: 16, status: 'completed' },
  { id: '2', date: '2025-09-25', type: '18:6', start: '19:00', end: '13:00', durationHrs: 18, status: 'completed' },
];

export default function HistoryScreen() {
  const [data, setData] = useState<Fast[]>(MOCK);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'History' }} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.type}</Text>
              <Text style={styles.badge}>{item.status}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.rowBetween}>
              <Text>Start: {item.start}</Text>
              <Text>End: {item.end}</Text>
              <Text>{item.durationHrs}h</Text>
            </View>
            <View style={styles.row}>
              <Pressable style={styles.btnSmall} onPress={() => {}}>
                <Text style={styles.btnTxt}>Edit</Text>
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#111827', padding: 12, borderRadius: 8, gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  title: { color: '#fff', fontWeight: '800', fontSize: 16 },
  badge: { backgroundColor: '#1f2937', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  date: { color: '#9ca3af' },
  sep: { height: 12 },
  btnSmall: { backgroundColor: '#0a7ea4', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnTxt: { color: '#fff', fontWeight: '700' },
});

