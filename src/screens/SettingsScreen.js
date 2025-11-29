import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { DEVICE_ID } from '../services/api';

// Cores do tema escuro
const COLORS = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#BB86FC',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  success: '#03DAC6',
  warning: '#CF6679',
  inputBg: '#2C2C2C',
};

// Constantes do ESP32 ADC
const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 4095;

export default function SettingsScreen() {
  const [threshold, setThreshold] = useState(300);
  const [savedThreshold, setSavedThreshold] = useState(300);
  const [alarms, setAlarms] = useState([]);
  const [inputValue, setInputValue] = useState('300');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/config/${DEVICE_ID}`);
      if (response.data.success) {
        const value = response.data.data.lightThreshold || 300;
        setThreshold(value);
        setSavedThreshold(value);
        setInputValue(String(value));
        setAlarms(response.data.data.alarms || []);
      }
    } catch (err) {
      setError('Não foi possível carregar as configurações');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConfig();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConfig();
  };

  const handleSliderChange = (value) => {
    const roundedValue = Math.round(value);
    setThreshold(roundedValue);
    setInputValue(String(roundedValue));
  };

  const handleInputChange = (text) => {
    // Remove caracteres não numéricos
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);

    const numValue = parseInt(numericText, 10);
    if (!isNaN(numValue)) {
      // Limita ao range válido
      const clampedValue = Math.min(Math.max(numValue, MIN_THRESHOLD), MAX_THRESHOLD);
      setThreshold(clampedValue);
    }
  };

  const handleInputBlur = () => {
    // Ao sair do input, ajusta o valor para o range válido
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < MIN_THRESHOLD) {
      setThreshold(MIN_THRESHOLD);
      setInputValue(String(MIN_THRESHOLD));
    } else if (numValue > MAX_THRESHOLD) {
      setThreshold(MAX_THRESHOLD);
      setInputValue(String(MAX_THRESHOLD));
    } else {
      setInputValue(String(numValue));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/api/config/${DEVICE_ID}`, {
        alarms: alarms,
        lightThreshold: threshold,
      });
      if (response.data.success) {
        setSavedThreshold(threshold);
        Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = threshold !== savedThreshold;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Ajuste o limiar de luminosidade</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={COLORS.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Card principal */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sunny" size={24} color={COLORS.success} />
          <Text style={styles.cardTitle}>Limiar de Luminosidade</Text>
        </View>

        <Text style={styles.description}>
          Quando o sensor detectar um valor de luz menor que o limiar configurado,
          a persiana será aberta automaticamente junto com o alarme.
        </Text>

        {/* Valor atual com input */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Valor atual:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="numeric"
              maxLength={4}
              editable={!saving}
            />
          </View>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{MIN_THRESHOLD}</Text>
          <Slider
            style={styles.slider}
            minimumValue={MIN_THRESHOLD}
            maximumValue={MAX_THRESHOLD}
            value={threshold}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.inputBg}
            thumbTintColor={COLORS.primary}
            disabled={saving}
          />
          <Text style={styles.sliderLabel}>{MAX_THRESHOLD}</Text>
        </View>

        {/* Indicador visual */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicatorItem}>
            <Ionicons name="moon" size={20} color={COLORS.textSecondary} />
            <Text style={styles.indicatorText}>Escuro</Text>
          </View>
          <View style={styles.indicatorBar}>
            <View
              style={[
                styles.indicatorFill,
                { width: `${(threshold / MAX_THRESHOLD) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.indicatorItem}>
            <Ionicons name="sunny" size={20} color={COLORS.success} />
            <Text style={styles.indicatorText}>Claro</Text>
          </View>
        </View>

        {/* Valor salvo */}
        <Text style={styles.savedValue}>
          Valor salvo: {savedThreshold}
        </Text>
      </View>

      {/* Explicação */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          O ESP32 possui um ADC de 12 bits, portanto os valores variam de 0 (escuro total)
          até 4095 (luz máxima). Valores típicos para ambientes internos ficam entre 100-500.
        </Text>
      </View>

      {/* Botão salvar */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!hasChanges || saving) && styles.buttonDisabled,
        ]}
        onPress={saveSettings}
        disabled={!hasChanges || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.background} />
        ) : (
          <>
            <Ionicons name="save" size={20} color={COLORS.background} />
            <Text style={styles.saveButtonText}>
              {hasChanges ? 'Salvar Configurações' : 'Sem alterações'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  indicatorItem: {
    alignItems: 'center',
    width: 50,
  },
  indicatorText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  indicatorBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  indicatorFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  savedValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 12,
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(207, 102, 121, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.warning,
    fontSize: 14,
    marginLeft: 8,
  },
});
