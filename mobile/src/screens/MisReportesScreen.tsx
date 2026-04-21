import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/client';
import type { RootStackParamList } from '../navigation';
import { Colors, Fonts } from '../theme';
import { useOffline } from '../context/OfflineContext';

type StatusConfig = { label: string; colors: [string, string]; text: string; icon: string };

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ENVIADO:     { label: 'Enviado',     colors: ['#1565C0', '#1E88E5'], text: '#fff', icon: '📨' },
  EN_REVISION: { label: 'En Revisión', colors: ['#E65100', '#FB8C00'], text: '#fff', icon: '🔍' },
  VALIDADO:    { label: 'Validado',    colors: ['#4527A0', '#7B1FA2'], text: '#fff', icon: '✅' },
  RESUELTO:    { label: 'Resuelto',    colors: ['#1B5E20', '#388E3C'], text: '#fff', icon: '🎉' },
  RECHAZADO:   { label: 'Rechazado',   colors: ['#B71C1C', '#E53935'], text: '#fff', icon: '❌' },
};

const TYPE_LABEL: Record<string, string> = {
  NO_WATER:       'Sin agua',
  LOW_PRESSURE:   'Baja presión',
  WRONG_SCHEDULE: 'Horario incorrecto',
  OTHER:          'Otro problema',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MisReportesScreen = () => {
  const { isConnected, pendingSync, isSyncing, getMyReportsCache, saveMyReportsCache } = useOffline();
  
  const navigation = useNavigation<Nav>();
  const [reports, setReports]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      if (!isConnected) {
        const cached = await getMyReportsCache();
        if (cached) setReports(cached);
      } else {
        const res = await apiClient.get('/reports/app');
        setReports(res.data || []);
        await saveMyReportsCache(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, [isConnected]));

  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando tus reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      
      {/* Indicador Offline / Sincronización */}
      {!isConnected && (
        <View style={[styles.syncBanner, { backgroundColor: '#F57C00' }]}>
          <Text style={styles.syncBannerText}>📶 Estás sin conexión (Modo Offline)</Text>
        </View>
      )}
      {isConnected && pendingSync && (
        <View style={[styles.syncBanner, { backgroundColor: isSyncing ? '#1976D2' : '#FBC02D' }]}>
          <Text style={styles.syncBannerText}>
             {isSyncing ? '🔄 Sincronizando reportes pendientes...' : '⚠️ Tienes reportes pendientes por subir.'}
          </Text>
        </View>
      )}

      {/* Header */}
      <LinearGradient 
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text style={styles.headerTitle}>Mis Reportes</Text>
          <Text style={styles.headerSub}>
            {reports.length === 0
              ? 'Aún no has enviado reportes'
              : `${reports.length} reporte${reports.length !== 1 ? 's' : ''} registrado${reports.length !== 1 ? 's' : ''}`}
          </Text>
        </MotiView>
      </LinearGradient>

      <FlatList
        data={reports}
        keyExtractor={r => r.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]} 
            tintColor={Colors.primary} 
          />
        }
        contentContainerStyle={reports.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <MotiView
              from={{ translateY: 0, opacity: 0.5 }}
              animate={{ translateY: -15, opacity: 1 }}
              transition={{ type: 'timing', duration: 2000, loop: true, repeatReverse: true }}
            >
              <Text style={styles.emptyEmoji}>📋</Text>
            </MotiView>
            <Text style={styles.emptyTitle}>Sin reportes aún</Text>
            <Text style={styles.emptySubtitle}>
              Cuando envíes un reporte aparecerá aquí para que puedas seguir su progreso.
            </Text>
          </View>
        }
        renderItem={({ item: r, index }) => {
          const sc = STATUS_CONFIG[r.status] ?? { label: r.status, colors: ['#546E7A', '#78909C'] as [string,string], text: '#fff', icon: '●' };
          const lastNote = r.statusHistory?.[0]?.publicNote;

          return (
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 400, delay: index * 60 }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ReporteDetalle', { publicId: r.publicId })}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.colony} numberOfLines={1}>{r.colony?.name ?? 'Colonia'}</Text>
                    <Text style={styles.publicId}>ID: {r.publicId?.slice(0, 8).toUpperCase()}</Text>
                  </View>
                  <LinearGradient
                    colors={sc.colors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.badge}
                  >
                    <Text style={[styles.badgeText, { color: sc.text }]}>{sc.icon} {sc.label}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.divider} />

                <View style={styles.typeRow}>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>{TYPE_LABEL[r.type] ?? r.type}</Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(r.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>{r.description}</Text>

                {lastNote ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Respuesta UMAPS:</Text>
                    <Text style={styles.noteText} numberOfLines={2}>{lastNote}</Text>
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.detailLink}>Toca para ver historial completo</Text>
                  <Text style={styles.arrow}>→</Text>
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
  flex: { flex: 1, backgroundColor: Colors.background },
  syncBanner: {
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  syncBannerText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
  },
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
    opacity: 0.9 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40 
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12
  },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyEmoji: { fontSize: 80, marginBottom: 16, textAlign: 'center' },
  emptyTitle: { 
    fontFamily: Fonts.headingBold, 
    fontSize: 20, 
    color: Colors.primaryDark, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  emptySubtitle: { 
    fontFamily: Fonts.body, 
    fontSize: 15, 
    color: Colors.textMuted, 
    textAlign: 'center', 
    lineHeight: 22 
  },
  listContent: { padding: 20, gap: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.05)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flex: 1, marginRight: 10 },
  colony: { 
    fontFamily: Fonts.headingBold, 
    fontSize: 18, 
    color: Colors.primaryDark, 
    marginBottom: 2 
  },
  publicId: { 
    fontFamily: Fonts.body, 
    fontSize: 11, 
    color: Colors.textMuted,
    letterSpacing: 1
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
    elevation: 2
  },
  badgeText: { 
    fontFamily: Fonts.bodyBold, 
    fontSize: 11, 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12
  },
  typeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10
  },
  typePill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.1)',
  },
  typePillText: { 
    fontFamily: Fonts.bodyBold, 
    fontSize: 11, 
    color: Colors.primary 
  },
  date: { 
    fontFamily: Fonts.body, 
    fontSize: 12, 
    color: Colors.textMuted 
  },
  description: { 
    fontFamily: Fonts.body, 
    fontSize: 14, 
    color: '#4A5568', 
    lineHeight: 20, 
    marginBottom: 14 
  },
  noteBox: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  noteLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  noteText: { 
    fontFamily: Fonts.body, 
    fontSize: 13, 
    color: Colors.primaryDark, 
    lineHeight: 18,
    fontStyle: 'italic'
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.03)'
  },
  detailLink: { 
    fontFamily: Fonts.bodySemiBold, 
    fontSize: 12, 
    color: Colors.primary 
  },
  arrow: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold'
  }
});
