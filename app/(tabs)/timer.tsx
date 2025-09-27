import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function TimerScreen() {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemainingMs((prev) => (prev > 0 ? prev - 1000 : 0));
    }, 1000);
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatted = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [remainingMs]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Timer</ThemedText>
      <View style={styles.timerBox}>
        <Text style={styles.timeText}>{formatted}</Text>
      </View>
      <View style={styles.row}>
        <Pressable
          style={[styles.button, isRunning && styles.buttonAlt]}
          onPress={() => setIsRunning((prev) => !prev)}>
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            setIsRunning(false);
            setRemainingMs(0);
          }}>
          <Text style={styles.buttonText}>End</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.plan} onPress={() => setRemainingMs(12 * 3600 * 1000)}>
          <Text style={styles.planText}>12:12</Text>
        </Pressable>
        <Pressable style={styles.plan} onPress={() => setRemainingMs(16 * 3600 * 1000)}>
          <Text style={styles.planText}>16:8</Text>
        </Pressable>
        <Pressable style={styles.plan} onPress={() => setRemainingMs(18 * 3600 * 1000)}>
          <Text style={styles.planText}>18:6</Text>
        </Pressable>
        <Pressable style={styles.plan} onPress={() => setRemainingMs(20 * 3600 * 1000)}>
          <Text style={styles.planText}>20:4</Text>
        </Pressable>
        <Pressable style={styles.plan} onPress={() => setRemainingMs(24 * 3600 * 1000)}>
          <Text style={styles.planText}>24:0</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  timerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonAlt: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  plan: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  planText: {
    color: '#fff',
    fontWeight: '600',
  },
});

