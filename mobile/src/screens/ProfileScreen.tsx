/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, StatusBar, Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts } from '../theme';
import { EntityBrand } from '../components/EntityBrand';

export const ProfileScreen = () => {
  const { deviceId, isAuthenticated, authPending, authenticateDevice, logout, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthenticate = async () => {
    setAuthenticating(true);
    try {
      await authenticateDevice();
      if (!isConnected) {
        Alert.alert(
          '📶 Sin conexión',
          'Tu dispositivo se autenticará cuando recuperes la conexión a internet.',
        );
      } else {
        Alert.alert(
          '✅ Autenticación completada',
          'Tu dispositivo ha sido registrado exitosamente.',
        );
      }
    } catch (err) {
      Alert.alert(
        '❌ Error',
        'No se pudo autenticar el dispositivo. Intenta de nuevo.',
      );
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas cerrar la sesión de este dispositivo?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            await logout();
            Alert.alert('✅ Sesión cerrada', 'Tu dispositivo ha sido desconectado.');
          },
          style: 'destructive',
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerSub}>Información de tu dispositivo</Text>
        </MotiView>
      </LinearGradient>

      {/* Estado de Conexión */}
      {!isConnected && (
        <View style={[styles.banner, { backgroundColor: '#F57C00' }]}>
          <Text style={styles.bannerText}>📶 Estás sin conexión</Text>
        </View>
      )}

      {isConnected && authPending && (
        <View style={[styles.banner, { backgroundColor: '#FBC02D' }]}>
          <Text style={styles.bannerText}>⚠️ Autenticación pendiente</Text>
        </View>
      )}

      {/* Card: Device ID */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 100 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📱 Identificador del Dispositivo</Text>
        </View>

        {deviceId ? (
          <>
            <Text style={styles.deviceId}>{deviceId}</Text>
            <Text style={styles.deviceIdHelper}>
              Este es tu identificador único. Se usa para rastrear tus reportes y preferencias.
            </Text>
          </>
        ) : (
          <Text style={styles.deviceIdHelper}>Cargando...</Text>
        )}
      </MotiView>

      {/* Card: Estado de Autenticación */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔐 Estado de Autenticación</Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isAuthenticated
                  ? '#4CAF50'
                  : authPending
                    ? '#FF9800'
                    : '#9E9E9E',
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isAuthenticated ? '✅ Autenticado' : authPending ? '⏳ Pendiente' : '⭕ Anónimo'}
            </Text>
          </View>
        </View>

        <Text style={styles.statusHelp}>
          {isAuthenticated
            ? 'Tu dispositivo está registrado y tus reportes están protegidos.'
            : authPending
              ? 'Tu dispositivo se autenticará cuando recuperes la conexión.'
              : 'Tu dispositivo aún no está registrado. Puedes usarlo de forma anónima, pero se recomienda autenticarse para mayor seguridad.'}
        </Text>
      </MotiView>

      {/* Card: Acciones */}
      {!isAuthenticated && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.card}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.primary }]}
            onPress={handleAuthenticate}
            disabled={authenticating}
            activeOpacity={0.8}
          >
            {authenticating ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>🔐 Autenticar Dispositivo</Text>
                <Text style={styles.buttonSubtext}>Conecta este dispositivo a tu cuenta</Text>
              </>
            )}
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Card: Logout */}
      {isAuthenticated && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.card}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#B71C1C' }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🚪 Cerrar Sesión</Text>
            <Text style={styles.buttonSubtext}>Desconectar este dispositivo</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Card: Información */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 400 }}
        style={styles.card}
      >
        <Text style={styles.infoTitle}>ℹ️ ¿Qué es la autenticación?</Text>
        <Text style={styles.infoText}>
          Autenticar tu dispositivo lo registra en nuestro sistema, permitiéndote:
        </Text>
        <View style={styles.infoList}>
          <Text style={styles.infoBullet}>✓ Historial seguro de reportes</Text>
          <Text style={styles.infoBullet}>✓ Notificaciones en tiempo real</Text>
          <Text style={styles.infoBullet}>✓ Sincronización automática</Text>
          <Text style={styles.infoBullet}>✓ Acceso desde cualquier dispositivo</Text>
        </View>
      </MotiView>

      {/* Footer */}
      <View style={styles.footer}>
        <EntityBrand compact />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 24,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.accentPale,
    opacity: 0.9,
  },

  banner: {
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.white,
    textAlign: 'center',
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    margin: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  deviceId: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  deviceIdHelper: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  statusRow: {
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.white,
    textAlign: 'center',
  },
  statusHelp: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  buttonText: {
    fontFamily: Fonts.headingBold,
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  infoTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoBullet: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
});
