// src/features/favorites/screens/FavoriteDetailScreen.jsx
import { Alert, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoriteDetailScreen({ route, navigation }) {
  const { favorite } = route.params;
  const { removeFavorite, loading, error } = useFavorites();

  function handleRemove() {
    Alert.alert('Eliminar favorito', `¿Quitar "${favorite.alias}" de tus favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavorite(favorite._id);
            navigation.goBack();
          } catch {
            // El error ya queda expuesto vía "error" desde useFavorites.
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Card style={styles.card}>
        <Text style={styles.alias}>{favorite.alias}</Text>
        <Text style={styles.accountNumber}>{favorite.accountNumber}</Text>
        <Text style={styles.type}>{favorite.accountType}</Text>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        title="Transferir a esta cuenta"
        onPress={() =>
          navigation.navigate('TransfersTab', {
            screen: 'CreateTransfer',
            params: { toAccountNumber: favorite.accountNumber },
          })
        }
        style={styles.actionButton}
      />

      <Button
        title="Eliminar favorito"
        variant="secondary"
        onPress={handleRemove}
        loading={loading}
        style={styles.actionButton}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: 'transparent',
  },
  card: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  alias: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  accountNumber: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  type: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});
