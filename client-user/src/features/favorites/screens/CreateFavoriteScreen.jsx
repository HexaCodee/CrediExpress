// src/features/favorites/screens/CreateFavoriteScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useFavorites } from '../hooks/useFavorites';

export default function CreateFavoriteScreen({ navigation }) {
  const { addFavorite, loading, error } = useFavorites();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { accountNumber: '', accountType: '', alias: '' },
  });

  async function onSubmit(values) {
    try {
      await addFavorite(values);

      Alert.alert('Favorito agregado', 'La cuenta se agregó a tus favoritos.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      // El error ya queda expuesto vía "error" desde useFavorites.
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Agregar favorito</Text>

        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="accountNumber"
            rules={{
              required: 'El número de cuenta es obligatorio',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Número de cuenta"
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="accountType"
            rules={{ required: 'El tipo de cuenta es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Tipo de cuenta"
                placeholder="Ej. Ahorro, Monetaria"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountType?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="alias"
            rules={{ required: 'El alias es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Alias"
                placeholder="Ej. Mamá, Renta"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.alias?.message}
              />
            )}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title="Guardar" onPress={handleSubmit(onSubmit)} loading={loading} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
});
