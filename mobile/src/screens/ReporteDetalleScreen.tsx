import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, StatusBar, Platform, Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import apiClient from '../api/client';
import type { RootStackParamList } from '../navigation';
import { Colors, Fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReporteDetalle'>;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; description: string }> = {
  ENVIADO:     { 
    label: 'Enviado',     
    color: '#1565C0', 
    bg: '#E3F2FD', 
    icon: '📨',
    description: 'Hemos recibido tu reporte. El equipo de UMAPS lo revisará pronto.'
  },
  EN_REVISION: { 
    label: 'En Revisión', 
    color: '#E65100', 
    bg: '#FFF3E0', 
    icon: '🔍',
    description: 'Un técnico está analizando la situación en tu zona.'
  },
  VALIDADO:    { 
    label: 'Validado',    
    color: '#4527A0', 
    bg: '#EDE7F6', 
    icon: '✅',
    description: 'El problema ha sido confirmado y categorizado.'
  },
  RESUELTO:    { 
    label: 'Resuelto',    
    color: '#2E7D32', 
    bg: '#E8F5E9', 
    icon: '🎉',
    description: 'El servicio ha sido normalizado o la incidencia cerrada.'
  },
  RECHAZADO:   { 
    label: 'Rechazado',   
    color: '#B71C1C', 
    bg: '#FFEBEE', 
    icon: '❌',
    description: 'No se pudo proceder con el reporte. Revisa las notas.'
  },
};

const TYPE_LABELS: Record<string, string> = {
  NO_WATER: 'Sin suministro de agua', 
  LOW_PRESSURE: 'Baja presión de agua',
  WRONG_SCHEDULE: 'Incumplimiento de horario', 
  OTHER: 'Otro tipo de reporte',
};

export const ReporteDetalleScreen = ({ route, navigation }: Props) => {
  const { publicId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/reports/app/${publicId}`)
      .then(res => setReport(res.data))
      .catch((err) => {
        console.error('Error fetching report detail:', err);
      })
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Cargando detalles...</Text>
    </View>
  );

  if (!report) return (
    <View style={styles.center}>
      <Text style={styles.errorEmoji}>🔍</Text>
      <Text style={styles.errorText}>No pudimos encontrar este reporte.</Text>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Regresar</Text>
      </TouchableOpacity>
    </View>
  );

  const sc = STATUS_CONFIG[report.status] ?? { 
    label: report.status, 
    color: Colors.textMuted, 
    bg: '#f0f0f0', 
    icon: '●', 
    description: 'Estado del reporte actualizado.' 
  };

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header Overlay */}
        <LinearGradient 
          colors={[Colors.primaryDark, Colors.primary]} 
          style={styles.headerGradient}
        >
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.headerContent}
          >
            <View style={[styles.statusIconCircle, { backgroundColor: sc.bg }]}>
              <Text style={styles.statusEmoji}>{sc.icon}</Text>
            </View>
            <Text style={styles.statusTitle}>{sc.label}</Text>
            <Text style={styles.statusDescription}>{sc.description}</Text>
            <View style={styles.publicIdPill}>
              <Text style={styles.publicIdText}>REPORTE: {report.publicId?.slice(0, 12).toUpperCase()}</Text>
            </View>
          </MotiView>
        </LinearGradient>

        <View style={styles.body}>
          {/* Main Info Card */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Resumen del Reporte</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Colonia</Text>
                <Text style={styles.infoValue}>{report.colony?.name}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tipo</Text>
                <Text style={styles.infoValue}>{TYPE_LABELS[report.type] ?? report.type}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de Envío</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.createdAt).toLocaleDateString('es-HN', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.createdAt).toLocaleTimeString('es-HN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.infoLabel}>Descripción del Ciudadano</Text>
            <Text style={styles.descriptionText}>{report.description}</Text>
          </MotiView>

          {/* History Timeline */}
          {report.statusHistory?.length > 0 && (
            <MotiView 
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 400 }}
              style={styles.card}
            >
              <Text style={styles.sectionTitle}>Historial de Avance</Text>
              
              <View style={styles.timeline}>
                {report.statusHistory.map((h: any, i: number) => {
                  const hsc = STATUS_CONFIG[h.status] ?? { label: h.status, color: Colors.textMuted, icon: '●' };
                  const isLast = i === report.statusHistory.length - 1;

                  return (
                    <View key={h.id} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: hsc.color }]} />
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <View style={styles.timelineHeader}>
                          <Text style={[styles.timelineStatus, { color: hsc.color }]}>{hsc.label}</Text>
                          <Text style={styles.timelineDate}>
                            {new Date(h.changedAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        {h.publicNote && (
                          <View style={styles.historyNoteCard}>
                            <Text style={styles.historyNoteText}>{h.publicNote}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </MotiView>
          )}

          <TouchableOpacity 
            style={styles.primaryBackButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBackButtonText}>Volver a Mis Reportes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { alignItems: 'center', marginTop: 20 },
  statusIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  statusEmoji: { fontSize: 44 },
  statusTitle: { 
    fontFamily: Fonts.headingBold, 
    fontSize: 28, 
    color: Colors.white, 
    marginBottom: 8 
  },
  statusDescription: { 
    fontFamily: Fonts.body, 
    fontSize: 14, 
    color: Colors.white, 
    opacity: 0.85, 
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  publicIdPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  publicIdText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 1.5
  },
  body: { padding: 20, marginTop: -40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 14,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 20
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  infoItem: { width: '45%' },
  infoLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  infoValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.primaryDark
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 20
  },
  descriptionText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    fontStyle: 'italic'
  },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 4 },
  timelineRight: { flex: 1, paddingBottom: 24 },
  timelineHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8
  },
  timelineStatus: { fontFamily: Fonts.headingBold, fontSize: 16 },
  timelineDate: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted },
  historyNoteCard: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  historyNoteText: { 
    fontFamily: Fonts.body, 
    fontSize: 13, 
    color: Colors.primaryDark,
    lineHeight: 18 
  },
  primaryBackButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBackButtonText: {
    fontFamily: Fonts.headingBold,
    fontSize: 16,
    color: Colors.white
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: Colors.background },
  loadingText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textMuted, marginTop: 16 },
  errorEmoji: { fontSize: 60, marginBottom: 16 },
  errorText: { fontFamily: Fonts.headingBold, fontSize: 16, color: Colors.textMuted, textAlign: 'center', marginBottom: 24 },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  backButtonText: { fontFamily: Fonts.bodyBold, color: Colors.primary }
});
