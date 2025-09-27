import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
        <View>
          <ThemedText type="title">Scout</ThemedText>
          <ThemedText>scout@example.com</ThemedText>
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Rank 3</Text>
          <Text style={styles.statLabel}>Corporal</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>2200</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Level 7</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>
      <View style={styles.links}>
        <Link href="/profile/history" asChild>
          <Text style={styles.link}>History</Text>
        </Link>
        <Link href="/profile/settings" asChild>
          <Text style={styles.link}>Settings</Text>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  stats: { flexDirection: 'row', gap: 12 },
  statBox: { backgroundColor: '#1f2937', padding: 12, borderRadius: 8 },
  statValue: { color: '#fff', fontWeight: '800' },
  statLabel: { color: '#ccc', fontWeight: '600' },
  links: { flexDirection: 'row', gap: 16 },
  link: { color: '#0a7ea4', fontWeight: '700', fontSize: 16 },
});

