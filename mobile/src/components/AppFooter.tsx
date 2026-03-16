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
 * AppFooter
 * Pie de página global con nota de copyright.
 * Se integra en la pantalla de inicio y en Acerca De.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

export function AppFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.text}>
        © 2026 AguaDC. Todos los derechos reservados.
      </Text>
      <Text style={styles.sub}>
        Impulsado por U.M.A.P.S.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginBottom: 10,
    opacity: 0.6,
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sub: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 3,
    letterSpacing: 0.5,
  },
});
