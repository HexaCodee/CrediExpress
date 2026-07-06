// src/features/transfers/screens/CreateTransferScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useTransfers } from '../hooks/useTransfers';

export default function CreateTransferScreen({ route, navigation }) {
  const { fromAccountNumber, toAccountNumber } = route.params || {};
  const { createTransfer, loading, error } = useTransfers();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fromAccountNumber: fromAccountNumber || '',
      toAccountNumber: toAccountNumber || '',
      amount: '',
      description: '',
    },
  });

  async function onSubmit(values) {
    try {
      await createTransfer({
        fromAccountNumber: values.fromAccountNumber,
        toAccountNumber: values.toAccountNumber,
        amount: Number(values.amount),
        description: values.description,
      });

      Alert.alert('Transferencia exitosa', 'La transferencia se aplicó correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      // El error ya queda expuesto vía "error" desde useTransfers.
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nueva transferencia</Text>

        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="fromAccountNumber"
            rules={{ required: 'La cuenta de origen es obligatoria' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Cuenta de origen"
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fromAccountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="toAccountNumber"
            rules={{ required: 'La cuenta de destino es obligatoria' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Cuenta de destino"
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.toAccountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'El monto es obligatorio',
              min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Monto"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.amount?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Descripción (opcional)" value={value} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title="Transferir" onPress={handleSubmit(onSubmit)} loading={loading} />
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
