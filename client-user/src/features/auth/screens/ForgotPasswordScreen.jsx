// src/features/auth/screens/ForgotPasswordScreen.jsx
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgotPassword } from '../../../shared/api/authClient';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  async function onSubmit(values) {
    setLoading(true);
    setError(null);

    try {
      await forgotPassword(values.email);

      Alert.alert(
        'Revisa tu correo',
        'Si el correo existe en CrediExpress, te enviamos instrucciones para restablecer tu contraseña.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../../assets/authBackground.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviaremos instrucciones para restablecerla.
          </Text>

          <Card style={styles.formCard}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El correo es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo no válido' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo"
                  placeholder="usuario@correo.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Enviar instrucciones" onPress={handleSubmit(onSubmit)} loading={loading} />

            <Button
              title="Volver a iniciar sesión"
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            />
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
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  formCard: {
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.sm,
  },
});
