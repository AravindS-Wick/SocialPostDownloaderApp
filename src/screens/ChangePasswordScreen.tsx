import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { userAPI } from '../services/api';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);

  const newPasswordRuleResults = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    passed: rule.test(newPassword),
  }));
  const allPasswordRulesPassed = newPasswordRuleResults.every(r => r.passed);

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required.');
      setCurrentPasswordTouched(true);
      return;
    }

    if (!newPassword) {
      setError('New password is required.');
      setNewPasswordTouched(true);
      return;
    }

    if (!allPasswordRulesPassed) {
      setError('New password does not meet the requirements.');
      setNewPasswordTouched(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.changePassword({
        oldPassword: currentPassword,
        newPassword,
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        Alert.alert('Success', 'Password changed. Please log in again.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Change Password
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Update your password to keep your account secure
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.dark ? 'rgba(211,47,47,0.15)' : '#FFEBEE' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={[styles.successBox, { backgroundColor: theme.dark ? 'rgba(56,142,60,0.15)' : '#E8F5E9' }]}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground }]}>
          Current Password
        </Text>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          onBlur={() => setCurrentPasswordTouched(true)}
          mode="outlined"
          secureTextEntry={!showCurrentPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showCurrentPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            />
          }
          style={styles.input}
        />

        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground, marginTop: 16 }]}>
          New Password
        </Text>
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          onBlur={() => setNewPasswordTouched(true)}
          mode="outlined"
          secureTextEntry={!showNewPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showNewPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowNewPassword(!showNewPassword)}
            />
          }
          style={styles.input}
        />

        {newPasswordTouched && (
          <View style={[styles.rulesBox, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }]}>
            {newPasswordRuleResults.map((rule) => (
              <View key={rule.label} style={styles.ruleRow}>
                <Text style={{ color: rule.passed ? '#2e7d32' : '#c62828', fontSize: 13 }}>
                  {rule.passed ? '✓' : '✗'}{'  '}{rule.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground, marginTop: 16 }]}>
          Confirm New Password
        </Text>
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={!showNewPassword}
          left={<TextInput.Icon icon="lock-check" />}
          style={styles.input}
          error={!!confirmPassword && confirmPassword !== newPassword}
        />
        {confirmPassword && confirmPassword !== newPassword ? (
          <Text style={styles.fieldError}>Passwords do not match</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading || !allPasswordRulesPassed}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          Change Password
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 24 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#d32f2f', fontSize: 14 },
  successBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  successText: { color: '#2e7d32', fontSize: 14 },
  label: { marginBottom: 8 },
  input: { marginBottom: 16 },
  rulesBox: { borderRadius: 8, padding: 12, marginTop: -8, marginBottom: 16 },
  ruleRow: { marginBottom: 4 },
  fieldError: { color: '#c62828', fontSize: 12, marginTop: -10, marginBottom: 10, paddingLeft: 4 },
  submitButton: { marginTop: 8, borderRadius: 8 },
  submitButtonContent: { height: 50 },
  submitButtonLabel: { fontSize: 16, fontWeight: 'bold' },
  cancelButton: { marginTop: 12 },
});
