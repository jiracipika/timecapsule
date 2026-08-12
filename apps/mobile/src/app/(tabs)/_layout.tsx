import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, active }: { name: string; active: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: active ? 1 : 0.5 }}>{name}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="🏠" active={focused} /> }}
      />
      <Tabs.Screen
        name="capsules"
        options={{ title: 'Capsules', tabBarIcon: ({ focused }) => <TabIcon name="📬" active={focused} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Create', tabBarIcon: ({ focused }) => <TabIcon name="✏️" active={focused} /> }}
      />
      <Tabs.Screen
        name="timeline"
        options={{ title: 'Timeline', tabBarIcon: ({ focused }) => <TabIcon name="📅" active={focused} /> }}
      />
    </Tabs>
  );
}
