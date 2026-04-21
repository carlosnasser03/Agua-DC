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
import {
  View, Text, ScrollView, Image, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { EntityBrand } from '../components/EntityBrand';
import { AppFooter } from '../components/AppFooter';
import { Colors, Fonts } from '../theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const INFO_ITEMS = [
  { label: 'Versión', value: APP_VERSION },
  { label: 'Plataforma', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
  { label: 'Cobertura', value: 'Distrito Central, Honduras' },
  { label: 'Contacto', value: 'umaps@amarategalpa.gob.hn' },
];

export function AcercaDeScreen() {
  return (
    <View style={styles.flex}>
      {/* Header degradado — mismo estilo que las demás pantallas */}
      <LinearGradient
        colors={['#001A4E', Colors.primary, '#0063CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBrand}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>AGUA DC</Text>
            <Text style={styles.headerSub}>Horario de Agua para el Distrito Central</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Descripción oficial */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Qué es AguaDC?</Text>
          <Text style={styles.cardBody}>
            <Text style={styles.highlight}>AguaDC</Text>
            {' '}es una herramienta diseñada para facilitar el acceso a los
            horarios de distribución de agua en el Distrito Central, promoviendo
            la transparencia y la planificación ciudadana.{'\n\n'}
            Es la aplicación oficial de la{' '}
            <Text style={styles.highlight}>Unidad Municipal de Agua Potable
            y Saneamiento (U.M.A.P.S.)</Text>
            {' '}del Municipio del Distrito Central, Honduras.{'\n\n'}
            Permite a los ciudadanos consultar el calendario de suministro de agua
            potable por colonia, reportar incidencias en el servicio y dar
            seguimiento a sus reportes en tiempo real, sin necesidad de registrarse.
          </Text>
        </View>

        {/* Información de la app */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información</Text>
          {INFO_ITEMS.map((item, i) => (
            <View
              key={item.label}
              style={[styles.infoRow, i < INFO_ITEMS.length - 1 && styles.infoRowBorder]}
            >
              <Text style={styles.infoKey}>{item.label}</Text>
              <Text style={styles.infoVal}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Características */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funcionalidades</Text>
          {[
            { icon: '📅', text: 'Consulta de horarios por colonia' },
            { icon: '🔔', text: 'Reporta problemas en el suministro' },
            { icon: '📋', text: 'Seguimiento de tus reportes' },
            { icon: '🔒', text: 'Uso anónimo — sin necesidad de registro' },
          ].map(f => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Espaciador antes del EntityBrand */}
        <View style={{ height: 8 }} />

        {/* ── Sello institucional oficial ── */}
        <EntityBrand />

        {/* ── Pie de página con copyright ── */}
        <AppFooter />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  headerTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 24,
    color: Colors.white,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: '#BDE3F5',
    opacity: 0.9,
    letterSpacing: 0.2,
    marginTop: 2,
  },

  // Scroll
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 8 },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 22,
  },
  highlight: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoKey: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoVal: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    paddingLeft: 16,
  },

  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureIcon: { fontSize: 20 },
  featureText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
});
