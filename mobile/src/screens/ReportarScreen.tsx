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
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { EntityBrand } from '../components/EntityBrand';

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

const REPORT_TYPES = [
  { value: 'NO_WATER',       label: 'Sin agua',          icon: '🚱' },
  { value: 'LOW_PRESSURE',   label: 'Baja presión',       icon: '💧' },
  { value: 'WRONG_SCHEDULE', label: 'Horario incorrecto', icon: '⏰' },
  { value: 'OTHER',          label: 'Otro problema',      icon: '❓' },
];

export const ReportarScreen = () => {
  const [colonySearch, setColonySearch]     = useState('');
  const [colonyResults, setColonyResults]   = useState<any[]>([]);
  const [selectedColony, setSelectedColony] = useState<{ id: string; name: string } | null>(null);
  const [reportType, setReportType]         = useState('');
  const [description, setDescription]       = useState('');
  const [reporterName, setReporterName]     = useState('');
  const [reporterPhone, setReporterPhone]   = useState('');
  const [loading, setLoading]               = useState(false);
  const [searching, setSearching]           = useState(false);

  // Colony search with debounce
  useEffect(() => {
    if (colonySearch.length < 3) { setColonyResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get('/schedules/search', { params: { colony: colonySearch } });
        const unique = Array.from(
          new Map((res.data || []).map((e: any) => [e.colony.id, e.colony])).values()
        );
        setColonyResults(unique);
      } catch { setColonyResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [colonySearch]);

  const validate = (): string | null => {
    if (!selectedColony) return 'Selecciona tu colonia.';
    if (!reportType) return 'Elige el tipo de problema.';
    if (description.trim().length < 10) return 'Describe el problema con al menos 10 caracteres.';
    if (reporterName.trim() && reporterName.trim().length > 60)
      return 'El nombre no puede superar 60 caracteres.';
    if (reporterPhone.trim() && !/^\d{8}$/.test(reporterPhone.trim()))
      return 'El celular debe tener exactamente 8 dígitos.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('Falta información', err);

    setLoading(true);
    try {
      const payload: any = {
        colonyId: selectedColony!.id,
        type: reportType,
        description: description.trim(),
      };
      if (reporterName.trim())  payload.reporterName  = reporterName.trim();
      if (reporterPhone.trim()) payload.reporterPhone = reporterPhone.trim();

      const res = await apiClient.post('/reports/app', payload);
      Alert.alert(
        'Reporte enviado',
        `Registrado con ID: ${res.data.publicId?.slice(0, 8).toUpperCase()}\n\nPuedes dar seguimiento en "Mis Reportes".`,
        [{ text: 'Entendido', onPress: resetForm }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : (msg || 'No se pudo enviar el reporte.'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedColony(null);
    setColonySearch('');
    setReportType('');
    setDescription('');
    setReporterName('');
    setReporterPhone('');
    setColonyResults([]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header gradient */}
      <LinearGradient colors={[COLORS.navy, COLORS.deep, COLORS.mid]} style={styles.header}>
        <Text style={styles.headerTitle}>Reportar Problema</Text>
        <Text style={styles.headerSub}>Tu reporte llega directo al equipo técnico</Text>
      </LinearGradient>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>

        {/* COLONIA */}
        <Text style={styles.label}>¿En qué colonia estás? *</Text>
        {selectedColony ? (
          <View style={styles.selectedChip}>
            <Text style={styles.chipText}>📍 {selectedColony.name}</Text>
            <TouchableOpacity onPress={() => { setSelectedColony(null); setColonySearch(''); }}>
              <Text style={styles.chipRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Escribe el nombre de tu colonia..."
              placeholderTextColor="#99B5CC"
              value={colonySearch}
              onChangeText={setColonySearch}
            />
            {searching && <ActivityIndicator size="small" color={COLORS.sky} style={{ marginTop: 6 }} />}
            {colonyResults.length > 0 && (
              <View style={styles.dropdown}>
                {colonyResults.slice(0, 6).map((c: any) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedColony({ id: c.id, name: c.name }); setColonyResults([]); setColonySearch(c.name); }}
                  >
                    <Text style={styles.dropdownText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* TIPO DE REPORTE */}
        <Text style={[styles.label, { marginTop: 24 }]}>¿Cuál es el problema? *</Text>
        <View style={styles.typeGrid}>
          {REPORT_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeCard, reportType === t.value && styles.typeCardActive]}
              onPress={() => setReportType(t.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, reportType === t.value && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DESCRIPCIÓN */}
        <Text style={[styles.label, { marginTop: 24 }]}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el problema con el mayor detalle posible..."
          placeholderTextColor="#99B5CC"
          value={description}
          onChangeText={t => setDescription(t.slice(0, 200))}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={200}
        />
        <Text style={[styles.charCount, description.length >= 190 && { color: '#E65100' }]}>
          {description.length}/200
        </Text>

        {/* DATOS OPCIONALES */}
        <View style={styles.optionalBox}>
          <Text style={styles.optionalTitle}>Datos de contacto (opcionales)</Text>
          <Text style={styles.optionalSub}>Si deseas que te contactemos para el seguimiento.</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            placeholderTextColor="#99B5CC"
            value={reporterName}
            onChangeText={setReporterName}
            maxLength={60}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Celular (8 dígitos)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 99887766"
            placeholderTextColor="#99B5CC"
            value={reporterPhone}
            onChangeText={t => setReporterPhone(t.replace(/\D/g, '').slice(0, 8))}
            keyboardType="numeric"
            maxLength={8}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          style={{ marginTop: 28 }}
        >
          <LinearGradient
            colors={loading ? ['#90B8D8', '#90B8D8'] : [COLORS.mid, COLORS.sky]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Enviar Reporte</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Tu reporte es anónimo. Solo los datos de contacto que escribas serán visibles para el equipo técnico.
        </Text>

        {/* Espaciador */}
        <View style={{ height: 24 }} />

        {/* Sello institucional */}
        <EntityBrand compact />

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.pale, opacity: 0.9 },
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.deep, marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A2B3C',
    borderWidth: 1.5,
    borderColor: '#C5DCF0',
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  charCount: { fontSize: 12, color: COLORS.gray, textAlign: 'right', marginTop: 4 },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5DCF0',
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF5FC',
  },
  dropdownText: { fontSize: 14, color: '#1A2B3C' },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.tint,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: COLORS.sky,
  },
  chipText: { fontSize: 14, fontWeight: '700', color: COLORS.deep, flex: 1 },
  chipRemove: { fontSize: 16, color: COLORS.gray, paddingLeft: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C5DCF0',
  },
  typeCardActive: { borderColor: COLORS.mid, backgroundColor: COLORS.tint },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray, textAlign: 'center' },
  typeLabelActive: { color: COLORS.deep },
  optionalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#D8EEFA',
  },
  optionalTitle: { fontSize: 14, fontWeight: '700', color: COLORS.deep, marginBottom: 2 },
  optionalSub: { fontSize: 12, color: COLORS.gray, marginBottom: 14 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  disclaimer: { fontSize: 12, color: COLORS.gray, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
