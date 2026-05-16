import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorMessages';
import { validateLoginForm } from '../../utils/validation';
import Logo from '../../components/Logo';
import FieldError from '../../components/FieldError';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    const errs = validateLoginForm(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
  Alert.alert("Sign Out", "Are you sure you want to sign out?", [
    { text: "Cancel", style: "cancel" },
    { text: "Sign Out", style: "destructive", onPress: () => {} },
  ]);
};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <Logo size={100} />
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
                errors.email && styles.inputError,
              ]}
              placeholder="you@university.edu"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: null })); }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <FieldError message={errors.email} />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Password</Text>
            <TextInput
              ref={passwordRef}
              style={[
                styles.input,
                passwordFocused && styles.inputFocused,
                errors.password && styles.inputError,
              ]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: null })); }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <FieldError message={errors.password} />

            <TouchableOpacity activeOpacity={0.8} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled, SHADOWS.button]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Login</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center' },
  topSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 8,
  },
  welcome: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    margin: 24,
    padding: 24,
    ...SHADOWS.card,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  inputFocused: { borderColor: COLORS.accent },
  inputError: { borderColor: COLORS.danger },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.accent,
  },
  loginBtn: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  registerLink: { fontSize: 14, color: COLORS.accent, fontWeight: '700' },
});
