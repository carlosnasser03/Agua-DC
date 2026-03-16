/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/client';
import type { RootStackParamList } from '../navigation';

const COLORS = {
  navy:  '#001F3F',
  deep:  '#003366',
  mid:   '#0055A5',
  sky:   '#00AAEE',
  pale:  '#7FDBFF',
  tint:  '#E8F4FD',
  bg:    '#F0F8FF',
  gray:  '#546E7A',
  white: '#FFFFFF',
};

type StatusConfig = { label: string; colors: [string, string]; text: string };

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ENVIADO:     { label: 'Enviado',       colors: ['#1565C0', '#1E88E5'], text: '#fff' },
  EN_REVISION: { label: 'En Revisión',   colors: ['#E65100', '#FB8C00'], text: '#fff' },
  VALIDADO:    { label: 'Validado',      colors: ['#4527A0', '#7B1FA2'], text: '#fff' },
  RESUELTO:    { label: 'Resuelto',      colors: ['#1B5E20', '#388E3C'], text: '#fff' },
  RECHAZADO:   { label: 'Rechazado',     colors: ['#B71C1C', '#E53935'], text: '#fff' },
};

const TYPE_LABEL: Record<string, string> = {
  NO_WATER:       'Sin agua',
  LOW_PRESSURE:   'Baja presión',
  WRONG_SCHEDULE: 'Horario incorrecto',
  OTHER:          'Otro problema',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MisReportesScreen = () => {
  const navigation = useNavigation<Nav>();
  const [reports, setReports]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/reports/app');
      setReports(res.data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.mid} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <LinearGradient colors={[COLORS.navy, COLORS.deep, COLORS.mid]} style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reportes</Text>
        <Text style={styles.headerSub}>
          {reports.length === 0
            ? 'Aún no has enviado reportes'
            : `${reports.length} reporte${reports.length !== 1 ? 's' : ''} registrado${reports.length !== 1 ? 's' : ''}`}
        </Text>
      </LinearGradient>

      <FlatList
        data={reports}
        keyExtractor={r => r.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.mid]} tintColor={COLORS.mid} />}
        contentContainerStyle={reports.length === 0 ? styles.emptyContainer : { padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -10 }}
              transition={{ type: 'timing', duration: 1800, loop: true, repeatReverse: true }}
            >
              <Text style={styles.emptyEmoji}>📋</Text>
            </MotiView>
            <Text style={styles.emptyTitle}>Sin reportes aún</Text>
            <Text style={styles.emptySubtitle}>
              Cuando envíes un reporte aparecerá aquí con su estado actualizado en tiempo real.
            </Text>
          </View>
        }
        renderItem={({ item: r, index }) => {
          const sc = STATUS_CONFIG[r.status] ?? { label: r.status, colors: ['#546E7A', '#78909C'] as [string,string], text: '#fff' };
          const lastNote = r.statusHistory?.[0]?.publicNote;

          return (
            <MotiView
              from={{ opacity: 0, translateY: 28 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: index * 80 }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ReporteDetalle', { publicId: r.publicId })}
                activeOpacity={0.8}
              >
                {/* Card top row */}
                <View style={styles.cardTop}>
                  <Text style={styles.colony} numberOfLines={1}>{r.colony?.name ?? 'Colonia'}</Text>
                  <LinearGradient
                    colors={sc.colors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.badge}
                  >
                    <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
                  </LinearGradient>
                </View>

                {/* Type pill */}
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>{TYPE_LABEL[r.type] ?? r.type}</Text>
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>{r.description}</Text>

                {/* Last public note */}
                {lastNote ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText} numberOfLines={2}>{lastNote}</Text>
                  </View>
                ) : null}

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.date}>
                    {new Date(r.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={styles.detailLink}>Ver detalle →</Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.pale, opacity: 0.9 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyContainer: { flex: 1 },
  emptyEmoji: { fontSize: 56, marginBottom: 12, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A2B3C', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: COLORS.deep,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  colony: { fontSize: 15, fontWeight: '800', color: COLORS.deep, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tint,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C5DCF0',
  },
  typePillText: { fontSize: 11, fontWeight: '700', color: COLORS.mid },
  description: { fontSize: 13, color: '#4A5568', lineHeight: 19, marginBottom: 8 },
  noteBox: {
    backgroundColor: COLORS.tint,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.sky,
  },
  noteText: { fontSize: 12, color: COLORS.deep, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  date: { fontSize: 12, color: COLORS.gray },
  detailLink: { fontSize: 12, fontWeight: '700', color: COLORS.mid },
});
