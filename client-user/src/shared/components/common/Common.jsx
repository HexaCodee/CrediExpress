// src/shared/components/common/Common.jsx
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, SHADOWS, SPACING } from '../../constants/theme';

export function LoadingSpinner({ label = 'Cargando...' }) {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {label ? <Text style={styles.spinnerLabel}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon = 'info-outline',
  title = 'Sin datos',
  description,
}) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name={icon} size={48} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  spinnerLabel: {
    marginTop: SPACING.sm,
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyDescription: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
});
