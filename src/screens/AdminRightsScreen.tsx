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
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { loginSuccess } from '../store/slices/authSlice';
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
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.settings.darkMode);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
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
    Alert.alert('Delete User', `Permanently delete ${email}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.deleteUser(email);
            setUsers(prev => prev.filter(u => u.email !== email));
          } catch {
            Alert.alert('Error', 'Failed to delete user');
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
            await adminAPI.clearAllLogs();
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
    Alert.alert('Restart API', 'Railway will handle restart automatically on next deploy.', [
      { text: 'OK' }
    ]);
  }

  async function handleApproveOwner() {
    if (!ownerEmail.includes('@')) {
      Alert.alert('Invalid email');
      return;
    }
    try {
      await adminAPI.setUserRole(ownerEmail, 'owner');
      Alert.alert('Done', `${ownerEmail} promoted to owner`);
      setOwnerEmail('');
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to update role');
    }
  }

  function handleRoleSwitch(newRole: 'admin' | 'owner' | 'tester' | 'user') {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const updatedUser = {
      ...user,
      role: newRole,
    };

    dispatch(
      loginSuccess({
        token: token || '',
        refreshToken: refreshToken || '',
        user: updatedUser,
      })
    );

    Alert.alert('Success', `Switched to ${newRole} role. Check the navigation tabs to see available features.`);
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

      {/* Role Switcher for Testing */}
      <Text style={[styles.section, { color: text }]}>Test Different Roles</Text>
      <View style={[styles.card, { backgroundColor: card }]}>
        <Text style={{ color: subtext, fontSize: 12, marginBottom: 12 }}>
          Switch your role temporarily to test different user experiences.
        </Text>
        <View style={styles.roleButtonsRow}>
          {(['admin', 'owner', 'tester', 'user'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                { backgroundColor: ROLE_COLORS[role], opacity: 0.9 },
              ]}
              onPress={() => handleRoleSwitch(role)}
            >
              <Text style={styles.btnText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  roleButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleButton: { flex: 1, minWidth: '45%', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
});
