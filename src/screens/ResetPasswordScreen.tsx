import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../services/api';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

export default function ResetPasswordScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const theme = useTheme();

  // Get email and reset token from route params
  const { email = '', resetToken = '' } = (route.params as any) || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordRuleResults = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    passed: rule.test(newPassword),
  }));
  const allPasswordRulesPassed = passwordRuleResults.every(r => r.passed);

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword) {
      setError('New password is required.');
      setPasswordTouched(true);
      return;
    }

    if (!allPasswordRulesPassed) {
      setError('Password does not meet the requirements.');
      setPasswordTouched(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.resetPassword({
        email: email.toLowerCase(),
        resetToken,
        newPassword,
      });

      if (response.success) {
        setSuccess('Password reset successfully!');
        Alert.alert('Success', 'Your password has been reset. Please log in with your new password.', [
          { text: 'OK', onPress: () => navigation.navigate('Auth' as never) }
        ]);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
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
            onPress={() => navigation.navigate('Auth' as never)}
          />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Create New Password
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter a new password for your account
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
          New Password
        </Text>
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          onBlur={() => setPasswordTouched(true)}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />

        {passwordTouched && (
          <View style={[styles.rulesBox, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }]}>
            {passwordRuleResults.map((rule) => (
              <View key={rule.label} style={styles.ruleRow}>
                <Text style={{ color: rule.passed ? '#2e7d32' : '#c62828', fontSize: 13 }}>
                  {rule.passed ? '✓' : '✗'}{'  '}{rule.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onBackground, marginTop: 16 }]}>
          Confirm Password
        </Text>
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-check" />}
          style={styles.input}
          error={!!confirmPassword && confirmPassword !== newPassword}
        />
        {confirmPassword && confirmPassword !== newPassword ? (
          <Text style={styles.fieldError}>Passwords do not match</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading || !allPasswordRulesPassed}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          Reset Password
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Auth' as never)}
          disabled={loading}
          style={styles.cancelButton}
        >
          Back to Login
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
