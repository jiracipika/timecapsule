import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveCapsule, type Capsule } from '../../lib/store';

const PRESET_DAYS = [1, 7, 30, 90, 365];

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(30);

  const setPreset = (days: number) => {
    setSelectedPreset(days);
    const date = new Date();
    date.setDate(date.getDate() + days);
    setUnlockDate(date.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim() || !unlockDate) {
      Alert.alert('Missing fields', 'Please fill in title, message, and unlock date.');
      return;
    }
    const capsule: Capsule = {
      id: `cap-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      unlockDate,
      createdAt: new Date().toISOString(),
    };
    await saveCapsule(capsule);
    Alert.alert('📬 Capsule sealed!', `Will unlock on ${new Date(unlockDate).toLocaleDateString()}`);
    setTitle('');
    setMessage('');
    setUnlockDate('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Create Capsule</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Dear future me..."
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message to the future..."
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Unlock In</Text>
        <View style={styles.presetRow}>
          {PRESET_DAYS.map(d => (
            <Pressable
              key={d}
              style={[styles.presetBtn, selectedPreset === d && styles.presetActive]}
              onPress={() => setPreset(d)}
            >
              <Text style={[styles.presetText, selectedPreset === d && styles.presetTextActive]}>
                {d < 365 ? `${d}d` : '1yr'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Or pick a date</Text>
        <TextInput
          style={styles.input}
          value={unlockDate}
          onChangeText={setUnlockDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666"
        />

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>📬 Seal Capsule</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#aaa', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: '#1c1c2e', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#fff', marginBottom: 8,
  },
  messageInput: { minHeight: 120 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  presetBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1c1c2e', alignItems: 'center' },
  presetActive: { backgroundColor: '#FF9500' },
  presetText: { fontSize: 14, fontWeight: '700', color: '#888' },
  presetTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#FF9500', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 16,
  },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
