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
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Colors, Fonts } from '../theme';

export function BitnovaFooter() {
  const handlePress = async () => {
    const url = 'https://www.instagram.com/bitnova_labs/';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('No se pudo abrir', 'Tu dispositivo no puede abrir URLs externas');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
        <View style={styles.content}>
          <Text style={styles.text}>Powered by </Text>
          <Text style={styles.highlight}>Bitnova_labs</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  highlight: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
