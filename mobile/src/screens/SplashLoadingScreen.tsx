/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Colors, Fonts } from '../theme';

export const SplashLoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#001A4E', Colors.primary, '#0063CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Logo pulsante */}
      <MotiView
        from={{ scale: 0.8, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
          repeatReverse: true,
        }}
        style={styles.logoWrapper}
      >
        <View style={styles.logoBg}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </MotiView>

      {/* Ondas animadas alrededor */}
      <MotiView
        from={{ scale: 0.8, opacity: 0.3 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={styles.wave}
      />

      {/* Texto */}
      <View style={styles.textContainer}>
        <Text style={styles.appName}>AGUA DC</Text>
        <Text style={styles.subtitle}>Horario de Agua para el Distrito Central</Text>
      </View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentPale} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    marginBottom: 40,
    zIndex: 10,
  },
  logoBg: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logo: {
    width: 100,
    height: 100,
  },
  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(189, 227, 245, 0.4)',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appName: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.white,
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.accentPale,
    opacity: 0.85,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.accentPale,
    opacity: 0.8,
  },
});
