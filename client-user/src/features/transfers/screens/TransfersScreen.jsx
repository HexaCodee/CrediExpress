// src/features/transfers/screens/TransfersScreen.jsx
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useTransfers } from '../hooks/useTransfers';

const TYPE_LABELS = {
  TRANSFER_OUT: 'Enviada',
  TRANSFER_IN: 'Recibida',
  DEPOSIT: 'Depósito',
};

export default function TransfersScreen({ navigation }) {
  const { accountNumber, history, loading, error, reload } = useTransfers();

  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner label="Cargando transferencias..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Button
        title="Nueva transferencia"
        onPress={() => navigation.navigate('CreateTransfer', { fromAccountNumber: accountNumber })}
        disabled={!accountNumber}
        style={styles.createButton}
      />

      <FlatList
        contentContainerStyle={styles.listContent}
        data={history}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState
            icon="sync-alt"
            title="Sin transferencias"
            description={error || 'Todavía no tienes movimientos de transferencia.'}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.type}>{TYPE_LABELS[item.type] || item.type}</Text>
            <Text style={styles.amount}>
              {item.currency} {Number(item.amount).toFixed(2)}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-GT')}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: SPACING.md,
  },
  createButton: {
    marginBottom: SPACING.md,
  },
  listContent: {
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  type: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
