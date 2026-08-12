import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCapsules, getCapsuleStatus, getDaysUntil, formatDate, type Capsule } from '../../lib/store';

export default function TimelineScreen() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => { setCapsules(await getCapsules()); }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Sort by unlock date ascending
  const sorted = [...capsules].sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());

  // Group by month
  const grouped: { [month: string]: Capsule[] } = {};
  for (const c of sorted) {
    const m = new Date(c.unlockDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    (grouped[m] ||= []).push(c);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />}
      >
        <Text style={styles.header}>Timeline</Text>

        {Object.entries(grouped).map(([month, caps]) => (
          <View key={month}>
            <Text style={styles.monthHeader}>{month}</Text>
            {caps.map(c => {
              const status = getCapsuleStatus(c);
              const days = getDaysUntil(c.unlockDate);
              return (
                <View key={c.id} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, status === 'locked' ? styles.dotLocked : styles.dotUnlocked]} />
                  <View style={styles.timelineCard}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardIcon}>{status === 'locked' ? '🔒' : '🔓'}</Text>
                      <Text style={styles.cardTitle}>{c.title}</Text>
                    </View>
                    {status === 'unlocked' && (
                      <Text style={styles.cardMessage} numberOfLines={2}>{c.message}</Text>
                    )}
                    <Text style={styles.cardDate}>
                      {status === 'locked'
                        ? `${days > 0 ? days : 0} days remaining`
                        : `Unlocked ${formatDate(c.unlockDate)}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {capsules.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>Your timeline is empty.</Text>
            <Text style={styles.emptySub}>Create a capsule to see it here!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20 },
  monthHeader: { fontSize: 14, fontWeight: '700', color: '#FF9500', marginBottom: 10, marginTop: 8 },
  timelineItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 18 },
  dotLocked: { backgroundColor: '#FF9500' },
  dotUnlocked: { backgroundColor: '#34C759' },
  timelineCard: {
    flex: 1, backgroundColor: '#1c1c2e', borderRadius: 14,
    padding: 14, marginLeft: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  cardMessage: { fontSize: 13, color: '#ccc', marginTop: 8, lineHeight: 18 },
  cardDate: { fontSize: 12, color: '#666', marginTop: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#555', marginTop: 4 },
});
