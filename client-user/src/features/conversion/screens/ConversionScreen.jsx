// src/features/conversion/screens/ConversionScreen.jsx
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useConversion } from '../hooks/useConversion';

export default function ConversionScreen({ navigation }) {
  const { quote, loading, error, fetchQuote, registerConversion } = useConversion();
  const [hasQuoted, setHasQuoted] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { from: 'GTQ', to: 'USD', amount: '' },
  });

  async function onQuote(values) {
    try {
      await fetchQuote(values.from.toUpperCase(), values.to.toUpperCase(), Number(values.amount));
      setHasQuoted(true);
    } catch {
      setHasQuoted(false);
    }
  }

  async function onConvert() {
    const values = getValues();

    try {
      await registerConversion({
        from: values.from.toUpperCase(),
        to: values.to.toUpperCase(),
        amount: Number(values.amount),
      });

      Alert.alert('Conversión registrada', 'Puedes verla en tu historial.', [
        { text: 'Ver historial', onPress: () => navigation.navigate('ConversionHistory') },
        { text: 'OK' },
      ]);
    } catch {
      // El error ya queda expuesto vía "error" desde useConversion.
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cambio de divisas</Text>

        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="from"
            rules={{
              required: 'Obligatorio',
              minLength: { value: 3, message: '3 letras' },
              maxLength: { value: 3, message: '3 letras' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="De (GTQ, USD, EUR)"
                autoCapitalize="characters"
                maxLength={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.from?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="to"
            rules={{
              required: 'Obligatorio',
              minLength: { value: 3, message: '3 letras' },
              maxLength: { value: 3, message: '3 letras' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="A (GTQ, USD, EUR)"
                autoCapitalize="characters"
                maxLength={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.to?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="amount"
            rules={{ required: 'El monto es obligatorio', min: { value: 0.01, message: 'Debe ser mayor a 0' } }}
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

          <Button title="Cotizar" onPress={handleSubmit(onQuote)} loading={loading} />
        </Card>

        {hasQuoted && quote ? (
          <Card style={styles.quoteCard}>
            <Text style={styles.quoteAmount}>
              {quote.toCurrency} {Number(quote.convertedAmount).toFixed(2)}
            </Text>
            <Text style={styles.quoteDetail}>
              Tasa: {quote.exchangeRate} · Comisión: {quote.commissionPercent}%
            </Text>
            <Button title="Registrar conversión" onPress={onConvert} loading={loading} style={styles.convertButton} />
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Ver historial"
          variant="secondary"
          onPress={() => navigation.navigate('ConversionHistory')}
          style={styles.historyButton}
        />
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
  quoteCard: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  quoteAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quoteDetail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  convertButton: {
    alignSelf: 'stretch',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  historyButton: {
    marginTop: SPACING.md,
  },
});
