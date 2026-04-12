import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
// expo-image-picker uses a native module — lazy-import to avoid crash on Expo Go startup
// import * as ImagePicker from 'expo-image-picker';
import type { RootState } from '../store';
import { bugAPI } from '../services/api';

type BugStatus = 'todo' | 'inprogress' | 'pr-raised' | 'verify' | 'blocked' | 'fixed';

const STATUS_COLORS: Record<BugStatus, string> = {
  todo: '#888',
  inprogress: '#2980b9',
  'pr-raised': '#e67e22',
  verify: '#f39c12',
  blocked: '#c0392b',
  fixed: '#27ae60',
};

const STATUS_OPTIONS: BugStatus[] = ['todo', 'inprogress', 'pr-raised', 'verify', 'blocked', 'fixed'];

interface BugReport {
  id: number;
  reporter_email: string;
  error_text: string;
  status: BugStatus;
  has_image: boolean;
  created_at: number;
}

export default function BugReportScreen() {
  const darkMode = useSelector((state: RootState) => state.settings.darkMode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [errorText, setErrorText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ id: number; current: BugStatus } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const bg = darkMode ? '#121212' : '#f5f5f5';
  const card = darkMode ? '#1e1e1e' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';
  const subtext = darkMode ? '#aaa' : '#666';
  const inputBorder = darkMode ? '#444' : '#ddd';

  useEffect(() => {
    if (isAdmin) loadReports();
  }, [isAdmin]);

  async function loadReports() {
    setLoadingReports(true);
    try {
      const res = await bugAPI.list();
      setReports(res.data.reports ?? []);
    } catch {
      Alert.alert('Error', 'Failed to load bug reports');
    } finally {
      setLoadingReports(false);
    }
  }

  async function pickImage() {
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach screenshots');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const approxBytes = (asset.base64?.length ?? 0) * 0.75;
      if (approxBytes > 100_000) {
        Alert.alert('Image too large', 'Please choose an image under 100KB, or the quality compression will reduce it. Try a screenshot crop.');
        return;
      }
      setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      setImageUri(asset.uri);
    }
  }

  async function handleSubmit() {
    if (!errorText.trim()) {
      Alert.alert('Required', 'Please describe the bug');
      return;
    }
    setSubmitting(true);
    try {
      await bugAPI.submit(errorText.trim(), imageBase64 ?? undefined);
      setErrorText('');
      setImageBase64(null);
      setImageUri(null);
      Alert.alert('Submitted', 'Bug report submitted successfully');
      if (isAdmin) loadReports();
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: BugStatus) {
    try {
      await bugAPI.updateStatus(id, newStatus);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch {
      Alert.alert('Error', 'Failed to update status');
    }
    setPickerVisible(false);
    setStatusTarget(null);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <ScrollView style={{ backgroundColor: bg }} contentContainerStyle={styles.container}>
      {/* Submission form */}
      <Text style={[styles.section, { color: textColor }]}>Report a Bug</Text>
      <View style={[styles.card, { backgroundColor: card }]}>
        <TextInput
          style={[styles.textArea, { color: textColor, borderColor: inputBorder }]}
          placeholder="Describe the bug or error... (required)"
          placeholderTextColor={subtext}
          multiline
          numberOfLines={5}
          value={errorText}
          onChangeText={setErrorText}
          textAlignVertical="top"
        />

        <TouchableOpacity style={[styles.imageBtn, { borderColor: inputBorder }]} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewThumb} />
          ) : (
            <Text style={{ color: subtext }}>Attach screenshot (optional, max 100KB)</Text>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={() => { setImageBase64(null); setImageUri(null); }}>
            <Text style={{ color: '#e74c3c', marginTop: 4, fontSize: 12 }}>Remove image</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit Bug Report</Text>}
        </TouchableOpacity>
      </View>

      {/* Bug list — admin only */}
      {isAdmin && (
        <>
          <Text style={[styles.section, { color: textColor }]}>All Reports ({reports.length})</Text>
          {loadingReports
            ? <ActivityIndicator color="#e74c3c" style={{ marginTop: 20 }} />
            : reports.map(report => (
              <View key={report.id} style={[styles.card, { backgroundColor: card }]}>
                <View style={styles.row}>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[report.status] }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                  <Text style={{ color: subtext, fontSize: 11, marginLeft: 8 }}>#{report.id} · {formatDate(report.created_at)}</Text>
                </View>
                <Text style={{ color: subtext, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                  {report.reporter_email}
                </Text>
                <Text style={{ color: textColor, marginTop: 6 }} numberOfLines={3}>
                  {report.error_text}
                </Text>
                <View style={[styles.row, { marginTop: 10, flexWrap: 'wrap', gap: 6 }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setStatusTarget({ id: report.id, current: report.status }); setPickerVisible(true); }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11 }}>Change Status</Text>
                  </TouchableOpacity>
                  {report.has_image && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#2980b9' }]}
                      onPress={async () => {
                        try {
                          const res = await bugAPI.getReport(report.id);
                          setPreviewImage(res.data.report.image_base64);
                        } catch {
                          Alert.alert('Error', 'Could not load image');
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11 }}>View Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          }
        </>
      )}

      {/* Status picker modal */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: card }]}>
            <Text style={[styles.section, { color: textColor, marginTop: 0 }]}>Set Status</Text>
            {STATUS_OPTIONS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, { backgroundColor: STATUS_COLORS[s] }]}
                onPress={() => statusTarget && handleStatusChange(statusTarget.id, s)}
              >
                <Text style={styles.statusText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image preview modal */}
      {previewImage && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPreviewImage(null)}>
            <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  card: { borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 100, fontSize: 14 },
  imageBtn: { marginTop: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, padding: 12, alignItems: 'center' },
  previewThumb: { width: '100%', height: 120, borderRadius: 8, resizeMode: 'cover' },
  submitBtn: { marginTop: 14, backgroundColor: '#e74c3c', borderRadius: 8, padding: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  actionBtn: { backgroundColor: '#555', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 260, borderRadius: 12, padding: 16 },
  statusOption: { borderRadius: 8, padding: 10, marginVertical: 4, alignItems: 'center' },
  fullImage: { width: '90%', height: '70%' },
});
