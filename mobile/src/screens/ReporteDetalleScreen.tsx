/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import apiClient from '../api/client';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReporteDetalle'>;

const COLORS = { primary: '#003366', sky: '#00AEEF', gray: '#546E7A', bg: '#F5F5F5', white: '#fff' };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ENVIADO:     { label: 'Enviado',     color: '#1565C0', bg: '#E3F2FD', icon: '📨' },
  EN_REVISION: { label: 'En Revisión', color: '#E65100', bg: '#FFF3E0', icon: '🔍' },
  VALIDADO:    { label: 'Validado',    color: '#4527A0', bg: '#EDE7F6', icon: '✅' },
  RESUELTO:    { label: 'Resuelto',    color: '#2E7D32', bg: '#E8F5E9', icon: '🎉' },
  RECHAZADO:   { label: 'Rechazado',   color: '#B71C1C', bg: '#FFEBEE', icon: '❌' },
};

const TYPE_LABELS: Record<string, string> = {
  NO_WATER: 'Sin agua', LOW_PRESSURE: 'Baja presión',
  WRONG_SCHEDULE: 'Horario incorrecto', OTHER: 'Otro',
};

export const ReporteDetalleScreen = ({ route }: Props) => {
  const { publicId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/reports/app/${publicId}`)
      .then(res => setReport(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!report) return <View style={styles.center}><Text>Reporte no encontrado</Text></View>;

  const sc = STATUS_CONFIG[report.status] ?? { label: report.status, color: COLORS.gray, bg: '#eee', icon: '●' };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status hero */}
        <View style={[styles.statusCard, { backgroundColor: sc.bg }]}>
          <Text style={styles.statusIcon}>{sc.icon}</Text>
          <Text style={[styles.statusLabel, { color: sc.color }]}>{sc.label}</Text>
          <Text style={styles.statusId}>ID: {report.publicId?.slice(0, 8).toUpperCase()}</Text>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Reporte</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Colonia</Text>
            <Text style={styles.infoVal}>{report.colony?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Tipo</Text>
            <Text style={styles.infoVal}>{TYPE_LABELS[report.type] ?? report.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Fecha</Text>
            <Text style={styles.infoVal}>
              {new Date(report.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{report.description}</Text>
        </View>

        {/* Historial */}
        {report.statusHistory?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de estados</Text>
            {report.statusHistory.map((h: any, i: number) => {
              const hsc = STATUS_CONFIG[h.status] ?? { label: h.status, color: COLORS.gray, icon: '●' };
              return (
                <View key={h.id} style={styles.historyItem}>
                  <View style={[styles.historyDot, { backgroundColor: hsc.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyStatus, { color: hsc.color }]}>{hsc.icon} {hsc.label}</Text>
                    {h.publicNote && <Text style={styles.historyNote}>{h.publicNote}</Text>}
                    <Text style={styles.historyDate}>
                      {new Date(h.changedAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusCard: { borderRadius: 20, padding: 28, alignItems: 'center' },
  statusIcon: { fontSize: 48, marginBottom: 8 },
  statusLabel: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statusId: { fontSize: 13, color: COLORS.gray, fontFamily: 'monospace' },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoKey: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
  infoVal: { fontSize: 14, color: '#222', fontWeight: '600', textAlign: 'right', flex: 1, paddingLeft: 12 },
  description: { fontSize: 15, color: '#444', lineHeight: 22 },
  historyItem: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  historyStatus: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  historyNote: { fontSize: 13, color: '#555', marginBottom: 2 },
  historyDate: { fontSize: 12, color: COLORS.gray },
});
