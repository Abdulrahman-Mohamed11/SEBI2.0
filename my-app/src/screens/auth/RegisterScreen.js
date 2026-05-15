import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorMessages';
import { validateRegisterForm } from '../../utils/validation';
import Logo from '../../components/Logo';
import RoleCard from '../../components/RoleCard';
import FieldError from '../../components/FieldError';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const ROLES = [
  { icon: '👤', title: 'Community Member', description: 'Report campus facility issues', value: 'COMMUNITY_MEMBER' },
  { icon: '🏢', title: 'Facility Manager', description: 'Manage and assign reported issues', value: 'FACILITY_MANAGER' },
  { icon: '🔧', title: 'Worker', description: 'Fix and resolve assigned issues', value: 'WORKER' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COMMUNITY_MEMBER');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    const errs = validateRegisterForm(name, email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
    } catch (err) {
      Alert.alert('Registration failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
            <Logo size={80} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CampusCare today</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                nameFocused && styles.inputFocused,
                errors.name && styles.inputError,
              ]}
              placeholder="John Smith"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: null })); }}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
            <FieldError message={errors.name} />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Email</Text>
            <TextInput
              ref={emailRef}
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
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <FieldError message={errors.password} />

            <Text style={styles.roleLabel}>Select Your Role</Text>

            <View style={styles.rolesContainer}>
              {ROLES.map((r) => (
                <View key={r.value} style={styles.roleCardWrapper}>
                  <RoleCard
                    icon={r.icon}
                    title={r.title}
                    description={r.description}
                    selected={role === r.value}
                    onPress={() => setRole(r.value)}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createBtn, loading && styles.btnDisabled, SHADOWS.button]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.createBtnText}>Create Account</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1 },
  topSection: {
    alignItems: 'center',
    paddingTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: 24,
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
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  rolesContainer: { gap: 10 },
  roleCardWrapper: {},
  createBtn: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, color: COLORS.accent, fontWeight: '700' },
});
