// src/features/profile/screens/ProfileScreen.jsx
//
// auth-service no expone un GET "mi perfil" (ver authClient.getUsers), así
// que se busca el propio registro dentro del listado completo por id. El
// avatar por defecto se resuelve con un ícono en vez de una imagen estática,
// ya que ProfilePicture del backend siempre es una URL completa (Cloudinary)
// o cadena vacía, nunca una ruta local.

import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUsers, updateProfile } from '../../../shared/api/authClient';
import Button from '../../../shared/components/common/Button';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ProfileScreen() {
  const storeUser = useAuthStore((state) => state.user);
  const updateStoreUser = useAuthStore((state) => state.updateUser);
  const { logout, loading: loggingOut } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', surname: '', phone: '' },
  });

  const loadProfile = useCallback(async () => {
    if (!storeUser?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await getUsers();
      const found = (data || []).find((item) => item.id === storeUser.id);

      if (found) {
        setProfile(found);
        reset({ name: found.name, surname: found.surname, phone: found.phone });
        updateStoreUser(found);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [storeUser?.id, reset, updateStoreUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tu galería para poder cambiar la foto de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setPickedImage(result.assets[0]);
    }
  }

  async function onSave(values) {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('Surname', values.surname);
      formData.append('Phone', values.phone);

      if (pickedImage) {
        const extension = pickedImage.uri.split('.').pop() || 'jpg';
        formData.append('ProfilePicture', {
          uri: pickedImage.uri,
          name: `profile.${extension}`,
          type: pickedImage.mimeType || `image/${extension}`,
        });
      }

      const { data } = await updateProfile(storeUser.id, formData);
      setProfile(data);
      updateStoreUser(data);
      setIsEditing(false);
      setPickedImage(null);
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  }

  if (loading && !profile) {
    return <LoadingSpinner label="Cargando perfil..." />;
  }

  const avatarUrl = profile?.profilePicture;
  const displayUri = pickedImage?.uri || (avatarUrl?.startsWith('http') ? avatarUrl : null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        {isEditing ? (
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarTouchable}>
            {displayUri ? (
              <Image source={{ uri: displayUri }} style={styles.avatar} />
            ) : (
              <MaterialIcons name="account-circle" size={72} color={COLORS.primary} />
            )}
            <View style={styles.avatarBadge}>
              <MaterialIcons name="photo-camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        ) : displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.avatar} />
        ) : (
          <MaterialIcons name="account-circle" size={72} color={COLORS.primary} />
        )}

        {!isEditing ? (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {profile?.name} {profile?.surname}
            </Text>
            <Text style={styles.username}>@{profile?.username}</Text>
            <Text style={styles.detail}>{profile?.email}</Text>
            <Text style={styles.detail}>{profile?.phone}</Text>
            <Text style={styles.role}>{profile?.role}</Text>

            <Button title="Editar perfil" onPress={() => setIsEditing(true)} style={styles.editButton} />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.avatarHint}>Toca la foto para cambiarla</Text>

            <Controller
              control={control}
              name="name"
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="surname"
              rules={{ required: 'El apellido es obligatorio' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Apellido"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.surname?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'El celular es obligatorio',
                pattern: { value: /^\d{8}$/, message: 'Debe tener exactamente 8 dígitos' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Celular"
                  keyboardType="number-pad"
                  maxLength={8}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Guardar" onPress={handleSubmit(onSave)} loading={saving} />
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                setIsEditing(false);
                setPickedImage(null);
                reset({ name: profile?.name, surname: profile?.surname, phone: profile?.phone });
              }}
              style={styles.cancelButton}
            />
          </View>
        )}
      </Card>

      <Button
        title="Cerrar sesión"
        variant="secondary"
        onPress={handleLogout}
        loading={loggingOut}
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: 'transparent',
  },
  card: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    alignSelf: 'stretch',
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  username: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  detail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  role: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  editButton: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  form: {
    alignSelf: 'stretch',
    marginTop: SPACING.md,
  },
  cancelButton: {
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});
