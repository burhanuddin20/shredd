import { StyleSheet, Switch, View, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch value />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Haptics</Text>
        <Switch value />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontWeight: '700', fontSize: 16 },
});

