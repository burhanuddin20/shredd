import { IconSymbol } from '@/components/ui/icon-symbol';
import { FASTING_PLANS } from '@/constants/game';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDatabase } from '@/src/lib/DatabaseProvider';
import { useFasting } from '@/src/lib/FastingProvider';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type for display purposes
interface DisplayFast {
  id: string;
  planId: string;
  startTime: Date;
  endTime?: Date;
  actualEndTime?: Date;
  status: 'completed' | 'cancelled' | 'in-progress' | 'paused';
  xpEarned: number;
  achievements: string[];
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { isInitialized: dbInitialized } = useDatabase();
  const { fastHistory, isLoading, updateFast, deleteFast: deleteFastFromHook } = useFasting();

  const [selectedFast, setSelectedFast] = useState<DisplayFast | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // Convert database fasts to display format
  const fasts: DisplayFast[] = fastHistory.map(fast => ({
    id: fast.id!.toString(),
    planId: fast.planId,
    startTime: new Date(fast.startTime),
    endTime: fast.endTime ? new Date(fast.endTime) : undefined,
    actualEndTime: fast.endTime ? new Date(fast.endTime) : undefined,
    status: fast.status as 'completed' | 'cancelled' | 'in-progress' | 'paused',
    xpEarned: fast.xpEarned,
    achievements: [], // TODO: Get achievements for each fast
  }));

  const getPlanName = (planId: string): string => {
    const plan = FASTING_PLANS.find(p => p.id === planId);
    return plan?.name || planId;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colors.success;
      case 'cancelled': return colors.danger;
      case 'in-progress': return colors.accent;
      default: return colors.icon;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark.circle.fill';
      case 'cancelled': return 'xmark.circle.fill';
      case 'in-progress': return 'clock.fill';
      case 'paused': return 'pause.circle.fill';
      default: return 'circle';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startTime: Date, endTime: Date): number => {
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 100) / 10); // Round to 1 decimal place
  };

  const openEditModal = (fast: DisplayFast) => {
    setSelectedFast(fast);
    setEditStartTime(formatTime(fast.startTime));
    setEditEndTime(formatTime(fast.actualEndTime || fast.endTime || new Date()));
    setIsEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedFast) return;

    try {
      const [startHour, startMinute] = editStartTime.split(':').map(Number);
      const [endHour, endMinute] = editEndTime.split(':').map(Number);

      const newStartTime = new Date(selectedFast.startTime);
      newStartTime.setHours(startHour, startMinute, 0, 0);

      const newEndTime = new Date(selectedFast.startTime);
      newEndTime.setHours(endHour, endMinute, 0, 0);

      // Ensure end time is after start time (handle day rollover)
      if (newEndTime <= newStartTime) {
        newEndTime.setDate(newEndTime.getDate() + 1);
      }

      // Update the fast in the database
      await updateFast(
        parseInt(selectedFast.id),
        newStartTime.toISOString(),
        newEndTime.toISOString()
      );

      setIsEditModalVisible(false);
      setSelectedFast(null);
      Alert.alert('Success', 'Fast updated successfully');
    } catch (error) {
      console.error('Error updating fast:', error);
      Alert.alert('Invalid Time', 'Please enter valid time in HH:MM format');
    }
  };

  const deleteFast = (fastId: string) => {
    Alert.alert(
      'Delete Fast',
      'Are you sure you want to delete this fast record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFastFromHook(parseInt(fastId));
              Alert.alert('Success', 'Fast deleted successfully');
            } catch (error) {
              console.error('Error deleting fast:', error);
              Alert.alert('Error', 'Failed to delete fast');
            }
          },
        },
      ]
    );
  };

  const renderFastCard = ({ item }: { item: DisplayFast }) => {
    const duration = calculateDuration(
      item.startTime,
      item.actualEndTime || item.endTime || new Date()
    );

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={styles.planInfo}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {getPlanName(item.planId)}
            </Text>
            <Text style={[styles.date, { color: colors.icon }]}>
              {formatDate(item.startTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <IconSymbol
              name={getStatusIcon(item.status)}
              size={12}
              color={colors.primary}
            />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <IconSymbol name="clock.fill" size={16} color={colors.icon} />
            <Text style={[styles.timeLabel, { color: colors.icon }]}>Start:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(item.startTime)}
            </Text>
          </View>

          <View style={styles.timeRow}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={colors.icon} />
            <Text style={[styles.timeLabel, { color: colors.icon }]}>End:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(item.actualEndTime || item.endTime || new Date())}
            </Text>
          </View>

          <View style={styles.timeRow}>
            <IconSymbol name="timer" size={16} color={colors.icon} />
            <Text style={[styles.timeLabel, { color: colors.icon }]}>Duration:</Text>
            <Text style={[styles.durationValue, { color: colors.accent }]}>
              {duration}h
            </Text>
          </View>
        </View>

        {item.xpEarned && item.xpEarned > 0 && (
          <View style={styles.xpSection}>
            <IconSymbol name="star.fill" size={16} color={colors.rankGold} />
            <Text style={[styles.xpText, { color: colors.rankGold }]}>
              +{item.xpEarned} XP
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => openEditModal(item)}
          >
            <IconSymbol name="pencil" size={16} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => deleteFast(item.id)}
          >
            <IconSymbol name="trash" size={16} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!dbInitialized || isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Fast History',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Fast History',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {fasts.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="clock" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Fast History</Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Start your first fast to see your history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={fasts}
          keyExtractor={(item) => item.id}
          renderItem={renderFastCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Fast</Text>
            <TouchableOpacity onPress={saveEdit}>
              <Text style={[styles.modalSaveText, { color: colors.accent }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Start Time</Text>
              <TextInput
                style={[styles.timeInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={editStartTime}
                onChangeText={setEditStartTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>End Time</Text>
              <TextInput
                style={[styles.timeInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={editEndTime}
                onChangeText={setEditEndTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.icon}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeInfo: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 60,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  xpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

