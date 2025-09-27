import { FlatList, StyleSheet, View, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

type Entry = { id: string; username: string; xp: number; rank: number };

const MOCK: Entry[] = [
  { id: '1', username: 'Eren', xp: 3200, rank: 1 },
  { id: '2', username: 'Mikasa', xp: 2800, rank: 2 },
  { id: '3', username: 'Armin', xp: 2200, rank: 3 },
];

export default function LeaderboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Leaderboard</ThemedText>
      <FlatList
        data={MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <Text style={styles.name}>{item.username}</Text>
            <Text style={styles.xp}>{item.xp} XP</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rank: { fontSize: 18, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '600' },
  xp: { fontSize: 14, fontWeight: '600' },
  sep: { height: 1, backgroundColor: '#333' },
});

