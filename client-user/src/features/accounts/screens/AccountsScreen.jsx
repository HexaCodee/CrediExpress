// src/features/accounts/screens/AccountsScreen.jsx
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useAccounts } from '../hooks/useAccounts';

export default function AccountsScreen({ navigation }) {
  const { accounts, loading, error, reload } = useAccounts();

  if (loading && accounts.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <LoadingSpinner label="Cargando cuentas..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.container}
        data={accounts}
        keyExtractor={(item) => item.accountNumber}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState
            icon="account-balance-wallet"
            title="Sin cuentas"
            description={error || 'Todavía no tienes cuentas bancarias registradas.'}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AccountDetail', { accountNumber: item.accountNumber })}
          >
            <Card style={styles.card}>
              <Text style={styles.accountNumber}>{item.accountNumber}</Text>
              {item.isPrimary ? <Text style={styles.badge}>Principal</Text> : null}
              <Text style={styles.balance}>
                {item.currency} {Number(item.balance).toFixed(2)}
              </Text>
              <Text style={styles.status}>{item.status}</Text>
            </Card>
          </TouchableOpacity>
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
    marginBottom: SPACING.md,
  },
  accountNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  badge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  balance: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  status: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
