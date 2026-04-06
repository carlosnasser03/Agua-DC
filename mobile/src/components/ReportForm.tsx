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
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  navy:  '#001F3F',
  deep:  '#003366',
  mid:   '#0055A5',
  sky:   '#00AAEE',
  tint:  '#E8F4FD',
  gray:  '#546E7A',
  white: '#FFFFFF',
};

const REPORT_TYPES = [
  { value: 'NO_WATER',       label: 'Sin agua',          icon: '🚱' },
  { value: 'LOW_PRESSURE',   label: 'Baja presión',       icon: '💧' },
  { value: 'WRONG_SCHEDULE', label: 'Horario incorrecto', icon: '⏰' },
  { value: 'OTHER',          label: 'Otro problema',      icon: '❓' },
];

interface ReportFormProps {
  reportType: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  loading: boolean;
  selectedColony: { id: string; name: string } | null;
  onReportTypeChange: (type: string) => void;
  onDescriptionChange: (text: string) => void;
  onReporterNameChange: (text: string) => void;
  onReporterPhoneChange: (text: string) => void;
  onSubmit: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  reportType,
  description,
  reporterName,
  reporterPhone,
  loading,
  selectedColony,
  onReportTypeChange,
  onDescriptionChange,
  onReporterNameChange,
  onReporterPhoneChange,
  onSubmit,
}) => {
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

  const handleSubmit = () => {
    const err = validate();
    if (!err) {
      onSubmit();
    }
  };

  return (
    <View style={styles.container}>
      {/* TIPO DE REPORTE */}
      <Text style={[styles.label, { marginTop: 24 }]}>¿Cuál es el problema? *</Text>
      <View style={styles.typeGrid}>
        {REPORT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeCard, reportType === t.value && styles.typeCardActive]}
            onPress={() => onReportTypeChange(t.value)}
            activeOpacity={0.75}
          >
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text style={[styles.typeLabel, reportType === t.value && styles.typeLabelActive]}>
              {t.label}
            </Text>
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
        onChangeText={t => onDescriptionChange(t.slice(0, 200))}
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
          onChangeText={onReporterNameChange}
          maxLength={60}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Celular (8 dígitos)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 99887766"
          placeholderTextColor="#99B5CC"
          value={reporterPhone}
          onChangeText={t => onReporterPhoneChange(t.replace(/\D/g, '').slice(0, 8))}
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0 },
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
