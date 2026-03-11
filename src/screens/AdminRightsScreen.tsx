// AdminRightsScreen — Phase 4 implementation (placeholder)
// Full implementation added in Phase 4
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { adminAPI } from '../services/api';

interface AdminUser {
  email: string;
  role: string;
  is_blocked: number;
  monthly_downloads: number;
  created_at: number;
}

interface DbStats {
  users: number;
  downloads: number;
  bugReports: number;
  guestDownloads: number;
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#e74c3c',
  owner: '#8e44ad',
  tester: '#2980b9',
  user: '#27ae60',
};

export default function AdminRightsScreen() {
  const theme = useSelector((state: RootState) => state.settings.darkMode);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState('');

  const bg = theme ? '#121212' : '#f5f5f5';
  const card = theme ? '#1e1e1e' : '#fff';
  const text = theme ? '#fff' : '#000';
  const subtext = theme ? '#aaa' : '#555';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getDbStats(),
      ]);
      setUsers(usersRes.data.users ?? []);
      setStats(statsRes.data.stats ?? null);
    } catch {
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock(email: string, currentlyBlocked: boolean) {
    try {
      await adminAPI.blockUser(email, !currentlyBlocked);
      setUsers(prev =>
        prev.map(u => u.email === email ? { ...u, is_blocked: currentlyBlocked ? 0 : 1 } : u)
      );
    } catch {
      Alert.alert('Error', 'Failed to update user');
    }
  }

  async function handleRemove(email: string) {
    Alert.alert('Remove User', `Remove ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.removeUser(email);
            setUsers(prev => prev.filter(u => u.email !== email));
          } catch {
            Alert.alert('Error', 'Failed to remove user');
          }
        }
      }
    ]);
  }

  async function handleClearDb() {
    Alert.alert('Clear Logs', 'Delete all download logs? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.clearDb();
            await loadData();
            Alert.alert('Done', 'Download logs cleared');
          } catch {
            Alert.alert('Error', 'Failed to clear logs');
          }
        }
      }
    ]);
  }

  async function handleRestart() {
    Alert.alert('Restart API', 'The API will restart. App will reconnect shortly.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.restart();
            Alert.alert('Restart initiated', 'API is restarting. Please wait a few seconds.');
          } catch {
            // Expected — API goes down before response arrives
            Alert.alert('Restart initiated', 'API is restarting. Please wait a few seconds.');
          }
        }
      }
    ]);
  }

  async function handleApproveOwner() {
    if (!ownerEmail.includes('@')) {
      Alert.alert('Invalid email');
      return;
    }
    try {
      await adminAPI.approveOwner(ownerEmail);
      Alert.alert('Done', `${ownerEmail} confirmed as owner`);
      setOwnerEmail('');
    } catch {
      Alert.alert('Error', 'Failed to approve owner');
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: bg }} contentContainerStyle={styles.container}>
      {/* Stats */}
      <Text style={[styles.section, { color: text }]}>Database Stats</Text>
      <View style={[styles.card, { backgroundColor: card }]}>
        {stats && Object.entries(stats).map(([key, val]) => (
          <View key={key} style={styles.statRow}>
            <Text style={{ color: subtext, textTransform: 'capitalize' }}>{key}</Text>
            <Text style={{ color: text, fontWeight: 'bold' }}>{String(val)}</Text>
          </View>
        ))}
      </View>

      {/* Users */}
      <Text style={[styles.section, { color: text }]}>Users ({users.length})</Text>
      {users.map(u => (
        <View key={u.email} style={[styles.card, { backgroundColor: card }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: text, fontSize: 13 }} numberOfLines={1}>{u.email}</Text>
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: ROLE_COLORS[u.role] ?? '#888' }]}>
                  <Text style={styles.badgeText}>{u.role}</Text>
                </View>
                {u.is_blocked === 1 && (
                  <View style={[styles.badge, { backgroundColor: '#c0392b', marginLeft: 4 }]}>
                    <Text style={styles.badgeText}>BLOCKED</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: u.is_blocked ? '#27ae60' : '#e67e22' }]}
              onPress={() => handleBlock(u.email, u.is_blocked === 1)}
            >
              <Text style={styles.btnText}>{u.is_blocked ? 'Unblock' : 'Block'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#c0392b', marginLeft: 6 }]}
              onPress={() => handleRemove(u.email)}
            >
              <Text style={styles.btnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Owner DB Access */}
      <Text style={[styles.section, { color: text }]}>Approve Owner DB Access</Text>
      <View style={[styles.card, { backgroundColor: card }]}>
        <TextInput
          style={[styles.input, { color: text, borderColor: subtext }]}
          placeholder="owner@email.com"
          placeholderTextColor={subtext}
          value={ownerEmail}
          onChangeText={setOwnerEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#8e44ad', marginTop: 8 }]} onPress={handleApproveOwner}>
          <Text style={styles.btnText}>Approve as Owner</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.section, { color: '#e74c3c' }]}>Danger Zone</Text>
      <View style={[styles.card, { backgroundColor: card }]}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#c0392b' }]} onPress={handleClearDb}>
          <Text style={styles.btnText}>Clear Download Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#c0392b', marginTop: 10 }]} onPress={handleRestart}>
          <Text style={styles.btnText}>Restart API</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  card: { borderRadius: 12, padding: 14, marginBottom: 8, elevation: 2 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  btn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
});
