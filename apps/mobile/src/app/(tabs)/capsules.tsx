import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCapsules, deleteCapsule, getCapsuleStatus, getDaysUntil, formatDate, type Capsule } from '../../lib/store';

export default function CapsulesScreen() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => { setCapsules(await getCapsules()); }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Capsule', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteCapsule(id);
        await loadData();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />}
      >
        <Text style={styles.header}>All Capsules</Text>

        {capsules.map(c => {
          const status = getCapsuleStatus(c);
          const days = getDaysUntil(c.unlockDate);
          return (
            <View key={c.id} style={styles.capsuleCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{status === 'locked' ? '🔒' : '🔓'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={[styles.statusBadge, status === 'locked' ? styles.statusLocked : styles.statusUnlocked]}>
                    {status === 'locked' ? `${days} days left` : 'Unlocked'}
                  </Text>
                </View>
                <Pressable onPress={() => handleDelete(c.id, c.title)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>

              {status === 'unlocked' ? (
                <Text style={styles.cardMessage}>{c.message}</Text>
              ) : (
                <Text style={styles.lockedMessage}>🔒 Locked until {formatDate(c.unlockDate)}</Text>
              )}

              <Text style={styles.cardDate}>Created {formatDate(c.createdAt)}</Text>
            </View>
          );
        })}
        {capsules.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📬</Text>
            <Text style={styles.emptyText}>No capsules yet.</Text>
            <Text style={styles.emptySub}>Go to Create to make one!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  capsuleCard: { backgroundColor: '#1c1c2e', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statusBadge: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  statusLocked: { color: '#FF9500' },
  statusUnlocked: { color: '#34C759' },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: '#ff5555', fontSize: 14 },
  cardMessage: { fontSize: 14, color: '#ddd', marginTop: 12, lineHeight: 20 },
  lockedMessage: { fontSize: 14, color: '#666', marginTop: 12, fontStyle: 'italic' },
  cardDate: { fontSize: 12, color: '#555', marginTop: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#555', marginTop: 4 },
});
