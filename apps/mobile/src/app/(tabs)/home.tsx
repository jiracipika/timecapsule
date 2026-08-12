import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCapsules, getCapsuleStatus, getDaysUntil, formatDate, type Capsule } from '../../lib/store';

export default function HomeScreen() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => { setCapsules(await getCapsules()); }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const locked = capsules.filter(c => getCapsuleStatus(c) === 'locked');
  const unlocked = capsules.filter(c => getCapsuleStatus(c) === 'unlocked');
  const nextUnlock = locked.length > 0
    ? locked.reduce((min, c) => new Date(c.unlockDate) < new Date(min.unlockDate) ? c : min)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />}
      >
        <Text style={styles.header}>TimeCapsule</Text>
        <Text style={styles.subtitle}>Send messages to the future</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{capsules.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#FF9500' }]}>{locked.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#34C759' }]}>{unlocked.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>

        {nextUnlock && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>⏳ Next Unlock</Text>
            <Text style={styles.nextTitle}>{nextUnlock.title}</Text>
            <Text style={styles.nextDate}>{getDaysUntil(nextUnlock.unlockDate)} days • {formatDate(nextUnlock.unlockDate)}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Recently Unlocked</Text>
        {unlocked.slice(0, 5).map(c => (
          <View key={c.id} style={styles.capsuleCard}>
            <View style={styles.capsuleHeader}>
              <Text style={styles.capsuleIcon}>🔓</Text>
              <Text style={styles.capsuleTitle}>{c.title}</Text>
            </View>
            <Text style={styles.capsuleMessage} numberOfLines={3}>{c.message}</Text>
            <Text style={styles.capsuleDate}>Unlocked {formatDate(c.unlockDate)}</Text>
          </View>
        ))}
        {unlocked.length === 0 && (
          <Text style={styles.emptyText}>No unlocked capsules yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  nextCard: {
    backgroundColor: '#FF9500', borderRadius: 18, padding: 20, marginBottom: 24,
  },
  nextLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  nextTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 4 },
  nextDate: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  capsuleCard: { backgroundColor: '#1c1c2e', borderRadius: 16, padding: 16, marginBottom: 10 },
  capsuleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capsuleIcon: { fontSize: 22 },
  capsuleTitle: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  capsuleMessage: { fontSize: 14, color: '#ccc', marginTop: 8, lineHeight: 20 },
  capsuleDate: { fontSize: 12, color: '#666', marginTop: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
});
