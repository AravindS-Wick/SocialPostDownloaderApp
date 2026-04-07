import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure, clearAuthError, setPendingVerification } from '../store/slices/authSlice';
import { userAPI } from '../services/api';

// RFC 5322-ish — matches what the API accepts
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

const safeGoBack = (nav: any) => {
  if (nav.canGoBack?.()) {
    nav.goBack();
  } else {
    nav.navigate?.('Main');
  }
};

export default function AuthScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = emailTouched && email && !EMAIL_REGEX.test(email.trim())
    ? 'Enter a valid email address (e.g. you@example.com)'
    : '';

  const passwordRuleResults = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const allPasswordRulesPassed = passwordRuleResults.every(r => r.passed);

  const handleLogin = async () => {
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Email is required.');
      setEmailTouched(true);
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      setEmailTouched(true);
      return;
    }
    if (!password) {
      setLocalError('Password is required.');
      return;
    }

    dispatch(loginStart());
    try {
      const response = await userAPI.login({ email: email.trim().toLowerCase(), password });
      if (response.success && response.token) {
        dispatch(loginSuccess({
          token: response.token,
          refreshToken: response.refreshToken,
          user: {
            id: response.user?.id || email,
            username: response.user?.name || email.split('@')[0],
            email: response.user?.email || email,
            role: response.user?.role || 'user',
          },
        }));
        safeGoBack(navigation);
      } else {
        dispatch(loginFailure(response.error || 'Login failed'));
      }
    } catch (err: any) {
      if (err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        dispatch(setPendingVerification(email.trim().toLowerCase()));
        (navigation as any).navigate('Verification');
        return;
      }
      const msg = err?.response?.data?.error || err?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(msg));
    }
  };

  const handleRegister = async () => {
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Email is required.');
      setEmailTouched(true);
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      setEmailTouched(true);
      return;
    }
    if (!password) {
      setLocalError('Password is required.');
      return;
    }
    if (!allPasswordRulesPassed) {
      setLocalError('Password does not meet the requirements below.');
      setPasswordTouched(true);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    dispatch(loginStart());
    try {
      const regResponse = await userAPI.register({
        username: email.split('@')[0],
        email: email.trim().toLowerCase(),
        password,
      });

      if (regResponse.success) {
        dispatch(setPendingVerification(email.trim().toLowerCase()));
        (navigation as any).navigate('Verification');
      } else {
        dispatch(loginFailure(regResponse.message || 'Registration failed'));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      dispatch(loginFailure(msg));
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Close button */}
        <View style={styles.closeRow}>
          <IconButton icon="close" size={24} onPress={() => safeGoBack(navigation)} />
        </View>

        <Text variant="headlineMedium" style={[styles.heading, { color: theme.colors.onSurface }]}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text variant="bodyMedium" style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>
          {mode === 'login'
            ? 'Sign in to sync your downloads and settings'
            : 'Sign up to save your download history'}
        </Text>

        {/* Mode toggle */}
        <SegmentedButtons
          value={mode}
          onValueChange={(val) => {
            setMode(val as 'login' | 'register');
            setLocalError('');
            setEmailTouched(false);
            setPasswordTouched(false);
            dispatch(clearAuthError());
          }}
          buttons={[
            { value: 'login', label: 'Login' },
            { value: 'register', label: 'Sign Up' },
          ]}
          style={styles.segmented}
        />

        {/* Error */}
        {displayError ? (
          <View style={[styles.errorBox, { backgroundColor: theme.dark ? 'rgba(211,47,47,0.15)' : '#FFEBEE' }]}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        {/* Email */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
          onBlur={() => setEmailTouched(true)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
          error={!!emailError}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        {/* Password */}
        <TextInput
          label="Password"
          value={password}
          onChangeText={(v) => { setPassword(v); setPasswordTouched(true); }}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
          style={styles.input}
        />

        {/* Password rules — show only in register mode after user starts typing */}
        {mode === 'register' && passwordTouched && (
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

        {mode === 'register' && (
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-check" />}
            style={styles.input}
            error={!!confirmPassword && confirmPassword !== password}
          />
        )}
        {mode === 'register' && confirmPassword && confirmPassword !== password ? (
          <Text style={styles.fieldError}>Passwords do not match</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={mode === 'login' ? handleLogin : handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>

        {/* Forgot Password Link */}
        {mode === 'login' && (
          <Button
            mode="text"
            onPress={() => (navigation as any).navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}
            labelStyle={styles.forgotPasswordButtonLabel}
          >
            Forgot Password?
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 8 },
  closeRow: { alignItems: 'flex-end', marginBottom: 8 },
  heading: { fontWeight: 'bold', marginBottom: 8 },
  subheading: { marginBottom: 24 },
  segmented: { marginBottom: 24 },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: '#d32f2f', fontSize: 14 },
  fieldError: { color: '#c62828', fontSize: 12, marginTop: -10, marginBottom: 10, paddingLeft: 4 },
  input: { marginBottom: 16 },
  rulesBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  ruleRow: { marginBottom: 4 },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitButtonContent: { height: 50 },
  submitButtonLabel: { fontSize: 16, fontWeight: 'bold' },
  forgotPasswordButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  forgotPasswordButtonLabel: {
    fontSize: 12,
  },
});
