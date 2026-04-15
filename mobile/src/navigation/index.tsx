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
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { HorariosScreen } from '../screens/HorariosScreen';
import { ReportarScreen } from '../screens/ReportarScreen';
import { MisReportesScreen } from '../screens/MisReportesScreen';
import { ReporteDetalleScreen } from '../screens/ReporteDetalleScreen';
import { AcercaDeScreen } from '../screens/AcercaDeScreen';

export type RootStackParamList = {
  Tabs: undefined;
  ReporteDetalle: { publicId: string };
};

export type TabParamList = {
  Horarios: undefined;
  Reportar: undefined;
  MisReportes: undefined;
  AcercaDe: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const COLORS = {
  primary:    '#0047AB',  // Deep Cobalt Blue (oficial)
  accent:     '#87CEEB',  // Sky Blue (oficial)
  gray:       '#546E7A',
  background: '#F5F5F5',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Horarios:   '📅',
    Reportar:   '📢',
    MisReportes:'📋',
    AcercaDe:   'ℹ️',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>
      {icons[name] ?? '○'}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Horarios"
        component={HorariosScreen}
        options={{ title: 'Horarios', headerShown: false }}
      />
      <Tab.Screen
        name="Reportar"
        component={ReportarScreen}
        options={{ title: 'Reportar', headerShown: false }}
      />
      <Tab.Screen
        name="MisReportes"
        component={MisReportesScreen}
        options={{ title: 'Mis Reportes', headerShown: false }}
      />
      <Tab.Screen
        name="AcercaDe"
        component={AcercaDeScreen}
        options={{ title: 'Acerca De', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="ReporteDetalle"
          component={ReporteDetalleScreen}
          options={{
            title: 'Detalle del Reporte',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
