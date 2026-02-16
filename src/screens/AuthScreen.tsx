import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure, clearAuthError } from '../store/slices/authSlice';
import { userAPI } from '../services/api';

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

  const handleLogin = async () => {
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    dispatch(loginStart());
    try {
      const response = await userAPI.login({ email: email.trim(), password });
      if (response.success && response.token) {
        dispatch(loginSuccess({
          token: response.token,
          user: {
            id: response.user?.id || email,
            username: response.user?.name || email.split('@')[0],
            email: response.user?.email || email,
          },
        }));
        navigation.goBack();
      } else {
        dispatch(loginFailure(response.error || 'Login failed'));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(msg));
    }
  };

  const handleRegister = async () => {
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
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
        email: email.trim(),
        password,
      });

      if (regResponse.success) {
        // Auto-login after successful registration
        const loginResponse = await userAPI.login({ email: email.trim(), password });
        if (loginResponse.success && loginResponse.token) {
          dispatch(loginSuccess({
            token: loginResponse.token,
            user: {
              id: loginResponse.user?.id || email,
              username: loginResponse.user?.name || email.split('@')[0],
              email: loginResponse.user?.email || email,
            },
          }));
          navigation.goBack();
        } else {
          dispatch(loginFailure('Registration succeeded but auto-login failed. Please log in manually.'));
          setMode('login');
        }
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
          <IconButton icon="close" size={24} onPress={() => navigation.goBack()} />
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

        {/* Form */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
          style={styles.input}
        />

        {mode === 'register' && (
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-check" />}
            style={styles.input}
          />
        )}

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
  input: { marginBottom: 16 },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitButtonContent: { height: 50 },
  submitButtonLabel: { fontSize: 16, fontWeight: 'bold' },
});
