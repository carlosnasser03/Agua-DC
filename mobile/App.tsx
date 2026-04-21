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
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AppNavigator } from './src/navigation';
import { useDeviceId } from './src/hooks/useDeviceId';
import { Colors } from './src/theme';
import { OfflineProvider } from './src/context/OfflineContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const { loading: deviceLoading } = useDeviceId();

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular':  Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold':     Montserrat_700Bold,
    'Inter-Regular':       Inter_400Regular,
    'Inter-SemiBold':      Inter_600SemiBold,
    'Inter-Bold':          Inter_700Bold,
  });

  // Bloquea el render hasta que fonts y deviceId estén listos
  if (!fontsLoaded || deviceLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <OfflineProvider>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <AppNavigator />
      </OfflineProvider>
    </AuthProvider>
  );
}
