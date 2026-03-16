/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
/**
 * EntityBrand
 * Sello institucional oficial de U.M.A.P.S.
 * Se coloca al pie de pantallas donde se requiere acreditar
 * que la app es un producto oficial del municipio.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface EntityBrandProps {
  /** Variante compacta para pies de pantalla secundarios */
  compact?: boolean;
}

export function EntityBrand({ compact = false }: EntityBrandProps) {
  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {/* Línea decorativa superior */}
      <View style={styles.divider} />

      {/* Bloque principal */}
      <View style={[styles.container, compact && styles.containerCompact]}>
        {/* Isotipo */}
        <Image
          source={require('../assets/icon.png')}
          style={[styles.logo, compact && styles.logoCompact]}
          resizeMode="contain"
          accessibilityLabel="Logotipo UMAPS"
        />

        {/* Texto institucional */}
        <View style={styles.textBlock}>
          <Text style={[styles.acronym, compact && styles.acronymCompact]}>
            U.M.A.P.S.
          </Text>
          <Text
            style={[styles.fullName, compact && styles.fullNameCompact]}
            numberOfLines={2}
          >
            Unidad Municipal de Agua Potable{'\n'}y Saneamiento
          </Text>
          {!compact && (
            <Text style={styles.municipality}>
              Municipio del Distrito Central · Honduras
            </Text>
          )}
        </View>
      </View>

      {/* Etiqueta de app oficial */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>App Oficial</Text>
        </View>
        <Text style={styles.appName}>AGUA DC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
  },
  wrapperCompact: {
    paddingBottom: 16,
    paddingTop: 0,
  },

  // Línea divisora
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
    opacity: 0.6,
  },

  // Fila logo + texto
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  containerCompact: {
    gap: 10,
    marginBottom: 8,
  },

  // Isotipo
  logo: {
    width: 56,
    height: 56,
    borderRadius: 13,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoCompact: {
    width: 40,
    height: 40,
    borderRadius: 9,
  },

  // Texto
  textBlock: {
    flex: 1,
  },
  acronym: {
    fontFamily: Fonts.headingBold,
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: 2.5,
    lineHeight: 24,
  },
  acronymCompact: {
    fontSize: 16,
    letterSpacing: 2,
    lineHeight: 20,
  },
  fullName: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },
  fullNameCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  municipality: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.accent,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Badge "App Oficial"
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  appName: {
    fontFamily: Fonts.headingBold,
    fontSize: 13,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
});
