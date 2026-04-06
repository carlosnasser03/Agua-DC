import React, { useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import apiClient from '../api/client';
import { EntityBrand } from '../components/EntityBrand';
import { ColonySearchInput } from '../components/ColonySearchInput';
import { ReportForm } from '../components/ReportForm';
import { Colors, Fonts } from '../theme';
import { useOffline } from '../context/OfflineContext';

export const ReportarScreen = () => {
  const { isConnected, saveReportOffline } = useOffline();

  const [colonySearch, setColonySearch]     = useState('');
  const [colonyResults, setColonyResults]   = useState<any[]>([]);
  const [selectedColony, setSelectedColony] = useState<{ id: string; name: string } | null>(null);
  const [reportType, setReportType]         = useState('');
  const [description, setDescription]       = useState('');
  const [reporterName, setReporterName]     = useState('');
  const [reporterPhone, setReporterPhone]   = useState('');
  const [loading, setLoading]               = useState(false);
  const [searching, setSearching]           = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        colonyId: selectedColony!.id,
        colonyName: selectedColony!.name, // added for visual reference in queue
        type: reportType,
        description: description.trim(),
      };
      if (reporterName.trim())  payload.reporterName  = reporterName.trim();
      if (reporterPhone.trim()) payload.reporterPhone = reporterPhone.trim();

      if (!isConnected) {
        await saveReportOffline(payload);
        Alert.alert(
          '📶 Sin conexión',
          'Tu reporte se ha guardado localmente y se enviará automáticamente cuando recuperes la conexión a internet.',
          [{ text: 'Entendido', onPress: resetForm }]
        );
      } else {
        const res = await apiClient.post('/reports/app', payload);
        Alert.alert(
          '🚀 Reporte enviado',
          `Tu reporte ha sido registrado con éxito.\n\nID: ${res.data.publicId?.slice(0, 8).toUpperCase()}\n\nPuedes ver el avance en la pestaña "Mis Reportes".`,
          [{ text: 'Entendido', onPress: resetForm }]
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      Alert.alert(
        '❌ Error al enviar',
        Array.isArray(msg) ? msg.join('\n') : (msg || 'No se pudo conectar con el servidor. Revisa tu conexión.')
      );
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
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" />
      
      <LinearGradient 
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <Text style={styles.headerTitle}>Reportar Problema</Text>
          <Text style={styles.headerSub}>Informa incidencias directamente a UMAPS</Text>
        </MotiView>
      </LinearGradient>

      <ScrollView 
        style={styles.container} 
        keyboardShouldPersistTaps="handled" 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.card}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>PASO 1</Text>
            </View>
            <Text style={styles.stepTitle}>Ubicación y Falla</Text>
          </View>

          <ColonySearchInput
            selectedColony={selectedColony}
            colonySearch={colonySearch}
            searching={searching}
            colonyResults={colonyResults}
            onSearchChange={setColonySearch}
            onColonySelect={setSelectedColony}
            onColonyClear={() => { setSelectedColony(null); setColonySearch(''); }}
            onSearchStateChange={setSearching}
            onResultsChange={setColonyResults}
          />

          <ReportForm
            reportType={reportType}
            description={description}
            reporterName={reporterName}
            reporterPhone={reporterPhone}
            loading={loading}
            selectedColony={selectedColony}
            onReportTypeChange={setReportType}
            onDescriptionChange={setDescription}
            onReporterNameChange={setReporterName}
            onReporterPhoneChange={setReporterPhone}
            onSubmit={handleSubmit}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={styles.footer}
        >
          <EntityBrand compact />
          <Text style={styles.helpText}>
            ¿Tienes una emergencia de fuga masiva?{'\n'}
            Llama directamente a la línea oficial.
          </Text>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
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
    marginBottom: 4 
  },
  headerSub: { 
    fontFamily: Fonts.body, 
    fontSize: 14, 
    color: Colors.accentPale, 
    opacity: 0.9 
  },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginTop: -10,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stepBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 1
  },
  stepTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: 16,
    color: Colors.textPrimary
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16
  },
  helpText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8
  }
});
