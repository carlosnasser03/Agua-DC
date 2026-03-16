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
  View, Text, TextInput, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity, RefreshControl, Dimensions,
  Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import apiClient from '../api/client';
import { AppFooter } from '../components/AppFooter';

// ─── Paleta oficial Agua DC ────────────────────────────────────────────────────
const C = {
  navy:        '#001A4E',   // Azul marino (inicio gradiente)
  primary:     '#0047AB',   // Deep Cobalt Blue (oficial)
  primaryMid:  '#0063CC',   // Tono medio del gradiente
  accent:      '#87CEEB',   // Sky Blue (oficial)
  accentDark:  '#5BA8CC',   // Sky blue oscuro
  pale:        '#BDE3F5',   // Acento pálido
  tint:        '#E8F2FB',   // Tinte muy claro
  bg:          '#F0F8FF',   // Fondo de pantalla
  white:       '#FFFFFF',   // Clean White (oficial)
  textPrimary: '#001A4E',
  textMuted:   '#546E7A',
  shadow:      '#001A4E',
};

const { width: SW } = Dimensions.get('window');

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ScheduleEntry {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  colony: { name: string; sector: { name: string } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear()
    && d.getMonth() === t.getMonth()
    && d.getDate() === t.getDate();
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-HN', {
    weekday: 'long', day: '2-digit', month: 'long',
  });

const formatDateShort = (d: string) =>
  new Date(d).toLocaleDateString('es-HN', {
    weekday: 'short', day: '2-digit', month: 'short',
  });

const formatTime = (start: string | null, end: string | null) => {
  if (!start && !end) return 'Horario no especificado';
  if (start && end) return `${start} — ${end}`;
  return start ?? end ?? '';
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Tarjeta de estado actual: brilla si hay agua hoy */
function TodayCard({ entry }: { entry: ScheduleEntry | null }) {
  if (!entry) {
    return (
      <View style={styles.todayEmpty}>
        <Text style={styles.todayEmptyIcon}>💧</Text>
        <Text style={styles.todayEmptyTitle}>Sin suministro programado hoy</Text>
        <Text style={styles.todayEmptySubtitle}>Revisa los próximos días</Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0.88 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 2200, loop: true, repeatReverse: true }}
    >
      <LinearGradient
        colors={[C.primary, C.primaryMid, C.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.todayCard}
      >
        {/* Badge */}
        <View style={styles.todayBadge}>
          <Text style={styles.todayBadgeText}>💧 Hay agua HOY</Text>
        </View>

        {/* Colonia */}
        <Text style={styles.todaySector}>
          {entry.colony?.sector?.name?.toUpperCase()}
        </Text>
        <Text style={styles.todayColony}>{entry.colony?.name}</Text>

        {/* Horario */}
        <View style={styles.todayTimeRow}>
          <Text style={styles.todayTimeIcon}>⏰</Text>
          <Text style={styles.todayTime}>{formatTime(entry.startTime, entry.endTime)}</Text>
        </View>

        {/* Fecha completa */}
        <Text style={styles.todayDate}>{formatDate(entry.date)}</Text>
      </LinearGradient>
    </MotiView>
  );
}

/** Tarjeta para días próximos — entra en cascada según su índice */
function DayCard({ entry, index }: { entry: ScheduleEntry; index: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 28 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 380, delay: index * 80 }}
    >
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.sectorBadge}>
              <Text style={styles.sectorBadgeText}>
                {entry.colony?.sector?.name}
              </Text>
            </View>
            <Text style={styles.cardDate}>{formatDateShort(entry.date)}</Text>
          </View>
          <Text style={styles.cardColony}>{entry.colony?.name}</Text>
          <View style={styles.timeRow}>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>⏰ {formatTime(entry.startTime, entry.endTime)}</Text>
            </View>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const HorariosScreen = () => {
  const [query, setQuery]     = useState('');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched]     = useState(false);

  const search = async (q?: string) => {
    const term = (q !== undefined ? q : query).trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await apiClient.get('/schedules/search', { params: { colony: term } });
      setEntries(res.data || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); search(); };

  const todayEntry      = entries.find(e => isToday(e.date)) ?? null;
  const upcomingEntries = entries.filter(e => !isToday(e.date));

  // FlatList header: shows TodayCard + section labels
  const ListHeader = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={styles.stateText}>Consultando horarios...</Text>
        </View>
      );
    }
    if (!searched) {
      return (
        <View style={styles.stateBox}>
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -10 }}
            transition={{ type: 'timing', duration: 1800, loop: true, repeatReverse: true }}
          >
            <LinearGradient colors={[C.tint, C.bg]} style={styles.emptyIllustration}>
              <Text style={styles.emptyIcon}>💧</Text>
            </LinearGradient>
          </MotiView>
          <Text style={styles.emptyTitle}>¿Cuándo llega el agua?</Text>
          <Text style={styles.emptySubtitle}>
            Escribe el nombre de tu colonia o sector para consultar los días y horas de suministro.
          </Text>
        </View>
      );
    }
    if (entries.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            No encontramos horarios para "{query}".{'\n'}Intenta con otro nombre.
          </Text>
        </View>
      );
    }
    return (
      <>
        <Text style={styles.sectionLabel}>Estado actual</Text>
        <TodayCard entry={todayEntry} />
        {upcomingEntries.length > 0 && (
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
            Próximos días ({upcomingEntries.length})
          </Text>
        )}
      </>
    );
  }, [loading, searched, entries, query, todayEntry, upcomingEntries.length]);

  const renderDayCard = useCallback(
    ({ item, index }: { item: ScheduleEntry; index: number }) => (
      <DayCard entry={item} index={index} />
    ),
    []
  );

  return (
    <View style={styles.container}>

      {/* ── Header con gradiente ── */}
      <LinearGradient
        colors={[C.navy, C.primary, C.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Branding institucional centrado */}
        <View style={styles.brandBlock}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>U.M.A.P.S.</Text>
            <Text style={styles.brandTagline}>Horario de Agua para el Distrito Central</Text>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Colonia o sector..."
              placeholderTextColor={C.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => search()}
              returnKeyType="search"
              selectionColor={C.accent}
            />
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => search()}
            activeOpacity={0.8}
          >
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Lista virtualizada ── */}
      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        data={upcomingEntries}
        keyExtractor={item => item.id}
        renderItem={renderDayCard}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<AppFooter />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.accent]} tintColor={C.accent} />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Layout
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Header
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 11,
  },
  brandText: {
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    letterSpacing: 3,
    lineHeight: 26,
  },
  brandTagline: {
    fontSize: 11,
    color: C.pale,
    opacity: 0.92,
    letterSpacing: 0.3,
    lineHeight: 15,
  },

  // Barra de búsqueda
  searchRow: { flexDirection: 'row', gap: 10 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(127,219,255,0.3)',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1, color: C.white, fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
  },
  searchBtn: {
    backgroundColor: C.pale, borderRadius: 14,
    paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 0,
  },
  searchBtnText: { color: C.navy, fontWeight: '800', fontSize: 14 },

  // Estados vacíos / carga
  stateBox: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 28,
  },
  stateText: { fontSize: 14, color: C.textMuted, marginTop: 12 },
  emptyIllustration: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyIcon:    { fontSize: 52 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 10, textAlign: 'center' },
  emptySubtitle:{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 },

  // Etiqueta de sección
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
  },

  // Tarjeta de hoy
  todayCard: {
    borderRadius: 20, padding: 22,
    shadowColor: C.primary, shadowOpacity: 0.35,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 14,
  },
  todayBadgeText:  { color: C.white, fontSize: 12, fontWeight: '700' },
  todaySector:     { fontSize: 11, color: C.pale, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  todayColony:     { fontSize: 24, fontWeight: '900', color: C.white, marginBottom: 14, lineHeight: 28 },
  todayTimeRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  todayTimeIcon:   { fontSize: 18 },
  todayTime:       { fontSize: 18, color: C.white, fontWeight: '700' },
  todayDate:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // Sin suministro hoy
  todayEmpty: {
    backgroundColor: C.tint, borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,119,204,0.15)',
    shadowColor: C.shadow, shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  todayEmptyIcon:     { fontSize: 36, marginBottom: 8 },
  todayEmptyTitle:    { fontSize: 15, fontWeight: '700', color: C.navy, textAlign: 'center' },
  todayEmptySubtitle: { fontSize: 13, color: C.textMuted, marginTop: 4 },

  // Tarjetas de días próximos
  card: {
    backgroundColor: C.white, borderRadius: 16,
    flexDirection: 'row', marginBottom: 10,
    shadowColor: C.shadow, shadowOpacity: 0.08,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 3, overflow: 'hidden',
  },
  cardAccent:  { width: 5, backgroundColor: C.accent },
  cardContent: { flex: 1, padding: 14 },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  sectorBadge: {
    backgroundColor: C.tint, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  sectorBadgeText: { fontSize: 10, fontWeight: '700', color: C.primaryMid, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate:    { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  cardColony:  { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 8 },
  timeRow:     { flexDirection: 'row' },
  timePill: {
    backgroundColor: C.tint, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  timePillText: { fontSize: 13, color: C.primaryMid, fontWeight: '600' },
});
