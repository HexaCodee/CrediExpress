// src/features/conversion/screens/ConversionHistoryScreen.jsx
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useConversion } from '../hooks/useConversion';

export default function ConversionHistoryScreen() {
  const { history, loading, error, reload } = useConversion();

  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <LoadingSpinner label="Cargando historial..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.container}
        data={history}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState
            icon="swap-horiz"
            title="Sin conversiones"
            description={error || 'Todavía no has registrado conversiones.'}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.pair}>
              {item.fromCurrency} → {item.toCurrency}
            </Text>
            <Text style={styles.amount}>
              {item.amount} {item.fromCurrency} = {Number(item.convertedAmount).toFixed(2)} {item.toCurrency}
            </Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-GT')}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  pair: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  amount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
