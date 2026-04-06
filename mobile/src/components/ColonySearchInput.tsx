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
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet
} from 'react-native';
import apiClient from '../api/client';

const COLORS = {
  navy:  '#001F3F',
  deep:  '#003366',
  mid:   '#0055A5',
  sky:   '#00AAEE',
  pale:  '#7FDBFF',
  tint:  '#E8F4FD',
  gray:  '#546E7A',
  white: '#FFFFFF',
};

interface ColonySearchInputProps {
  selectedColony: { id: string; name: string } | null;
  colonySearch: string;
  searching: boolean;
  colonyResults: any[];
  onSearchChange: (text: string) => void;
  onColonySelect: (colony: { id: string; name: string }) => void;
  onColonyClear: () => void;
  onSearchStateChange: (searching: boolean) => void;
  onResultsChange: (results: any[]) => void;
}

export const ColonySearchInput: React.FC<ColonySearchInputProps> = ({
  selectedColony,
  colonySearch,
  searching,
  colonyResults,
  onSearchChange,
  onColonySelect,
  onColonyClear,
  onSearchStateChange,
  onResultsChange,
}) => {
  useEffect(() => {
    if (colonySearch.length < 3) {
      onResultsChange([]);
      return;
    }
    const t = setTimeout(async () => {
      onSearchStateChange(true);
      try {
        const res = await apiClient.get('/schedules/search', { params: { colony: colonySearch } });
        const unique = Array.from(
          new Map((res.data || []).map((e: any) => [e.colony.id, e.colony])).values()
        );
        onResultsChange(unique);
      } catch {
        onResultsChange([]);
      } finally {
        onSearchStateChange(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [colonySearch, onSearchChange, onSearchStateChange, onResultsChange]);

  return (
    <View>
      <Text style={styles.label}>¿En qué colonia estás? *</Text>
      {selectedColony ? (
        <View style={styles.selectedChip}>
          <Text style={styles.chipText}>📍 {selectedColony.name}</Text>
          <TouchableOpacity onPress={onColonyClear}>
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
            onChangeText={onSearchChange}
          />
          {searching && <ActivityIndicator size="small" color={COLORS.sky} style={{ marginTop: 6 }} />}
          {colonyResults.length > 0 && (
            <View style={styles.dropdown}>
              {colonyResults.slice(0, 6).map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onColonySelect({ id: c.id, name: c.name });
                    onResultsChange([]);
                    onSearchChange(c.name);
                  }}
                >
                  <Text style={styles.dropdownText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
