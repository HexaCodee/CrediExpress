// src/features/favorites/screens/FavoritesScreen.jsx
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesScreen({ navigation }) {
  const { favorites, loading, error, reload } = useFavorites();

  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <LoadingSpinner label="Cargando favoritos..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Button
        title="Agregar favorito"
        onPress={() => navigation.navigate('CreateFavorite')}
        style={styles.createButton}
      />

      <FlatList
        contentContainerStyle={styles.container}
        data={favorites}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState
            icon="star"
            title="Sin favoritos"
            description={error || 'Agrega cuentas frecuentes para transferir más rápido.'}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('FavoriteDetail', { favorite: item })}>
            <Card style={styles.card}>
              <Text style={styles.alias}>{item.alias}</Text>
              <Text style={styles.accountNumber}>{item.accountNumber}</Text>
              <Text style={styles.type}>{item.accountType}</Text>
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
  createButton: {
    margin: SPACING.md,
    marginBottom: 0,
  },
  container: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  alias: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  accountNumber: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  type: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
});
