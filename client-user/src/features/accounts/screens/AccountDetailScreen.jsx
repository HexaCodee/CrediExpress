// src/features/accounts/screens/AccountDetailScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOperationalAccount, getRecentMovements } from '../../../shared/api/coreBankingClient';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';

export default function AccountDetailScreen({ route, navigation }) {
  const { accountNumber } = route.params;
  const [account, setAccount] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [accountResponse, movementsResponse] = await Promise.all([
        getOperationalAccount(accountNumber),
        getRecentMovements(accountNumber),
      ]);

      setAccount(accountResponse.data.account);
      setMovements(movementsResponse.data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la cuenta');
    } finally {
      setLoading(false);
    }
  }, [accountNumber]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading && !account) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <LoadingSpinner label="Cargando cuenta..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={styles.accountNumber}>{accountNumber}</Text>
        <Text style={styles.balance}>
          {account?.currency} {Number(account?.balance || 0).toFixed(2)}
        </Text>
        <Text style={styles.status}>{account?.status}</Text>
      </Card>

      <Button
        title="Nueva transferencia"
        onPress={() =>
          navigation.navigate('TransfersTab', {
            screen: 'CreateTransfer',
            params: { fromAccountNumber: accountNumber },
          })
        }
        style={styles.transferButton}
      />

      <Text style={styles.sectionTitle}>Movimientos recientes</Text>

      {movements.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="Sin movimientos"
          description={error || 'Todavía no hay movimientos en esta cuenta.'}
        />
      ) : (
        movements.map((movement) => (
          <Card key={movement._id} style={styles.movementCard}>
            <Text style={styles.movementType}>{movement.type}</Text>
            <Text style={styles.movementAmount}>
              {movement.currency} {Number(movement.amount).toFixed(2)}
            </Text>
            <Text style={styles.movementDescription}>{movement.description}</Text>
          </Card>
        ))
      )}
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
    padding: SPACING.md,
    flexGrow: 1,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  accountNumber: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  balance: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  status: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  transferButton: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  movementCard: {
    marginBottom: SPACING.sm,
  },
  movementType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  movementAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  movementDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
