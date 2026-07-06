// src/features/auth/screens/LoginScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { handleLogin, loading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { emailOrUsername: '', password: '' },
  });

  async function onSubmit(values) {
    await handleLogin(values.emailOrUsername, values.password);
  }

  return (
    <ImageBackground
      source={require('../../../../assets/authBackground.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>CrediExpress</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <Card style={styles.formCard}>
            <Controller
              control={control}
              name="emailOrUsername"
              rules={{ required: 'El usuario o correo es obligatorio' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Usuario o correo"
                  placeholder="usuario@correo.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.emailOrUsername?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ required: 'La contraseña es obligatoria' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Ingresar" onPress={handleSubmit(onSubmit)} loading={loading} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.90)',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formCard: {
    padding: SPACING.lg,
  },
  forgotPasswordLink: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
