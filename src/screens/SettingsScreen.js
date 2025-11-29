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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { DEVICE_ID } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 4095;

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
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
      setError('Nao foi possivel carregar as configuracoes');
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
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);

    const numValue = parseInt(numericText, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, MIN_THRESHOLD), MAX_THRESHOLD);
      setThreshold(clampedValue);
    }
  };

  const handleInputBlur = () => {
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
        Alert.alert('Sucesso', 'Configuracoes salvas com sucesso!');
      }
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel salvar as configuracoes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = threshold !== savedThreshold;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginLeft: 10,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      marginRight: 12,
    },
    inputContainer: {
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    input: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
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
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      marginTop: 4,
    },
    indicatorBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.inputBg,
      borderRadius: 4,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    indicatorFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    savedValue: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(187, 134, 252, 0.1)' : 'rgba(98, 0, 238, 0.08)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 12,
      lineHeight: 18,
    },
    saveButton: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
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
      color: '#FFFFFF',
      marginLeft: 8,
    },
    loadingText: {
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 16,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(207, 102, 121, 0.2)' : 'rgba(211, 47, 47, 0.1)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: colors.warning,
      fontSize: 14,
      marginLeft: 8,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeLabelText: {
      fontSize: 16,
      color: colors.textPrimary,
      marginLeft: 12,
    },
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando configuracoes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={styles.title}>Configuracoes</Text>
        <Text style={styles.subtitle}>Ajuste as preferencias do app</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Card Tema */}
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View style={styles.themeLabel}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.themeLabelText}>
                Tema {isDark ? 'Escuro' : 'Claro'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Card Luminosidade */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color={colors.success} />
            <Text style={styles.cardTitle}>Limiar de Luminosidade</Text>
          </View>

          <Text style={styles.description}>
            Quando o sensor detectar um valor de luz menor que o limiar configurado,
            a persiana sera aberta automaticamente junto com o alarme.
          </Text>

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

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{MIN_THRESHOLD}</Text>
            <Slider
              style={styles.slider}
              minimumValue={MIN_THRESHOLD}
              maximumValue={MAX_THRESHOLD}
              value={threshold}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.inputBg}
              thumbTintColor={colors.primary}
              disabled={saving}
            />
            <Text style={styles.sliderLabel}>{MAX_THRESHOLD}</Text>
          </View>

          <View style={styles.indicatorContainer}>
            <View style={styles.indicatorItem}>
              <Ionicons name="moon" size={20} color={colors.textSecondary} />
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
              <Ionicons name="sunny" size={20} color={colors.success} />
              <Text style={styles.indicatorText}>Claro</Text>
            </View>
          </View>

          <Text style={styles.savedValue}>
            Valor salvo: {savedThreshold}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            O ESP32 possui um ADC de 12 bits, portanto os valores variam de 0 (escuro total)
            ate 4095 (luz maxima). Valores tipicos para ambientes internos ficam entre 100-500.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || saving) && styles.buttonDisabled,
          ]}
          onPress={saveSettings}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {hasChanges ? 'Salvar Configuracoes' : 'Sem alteracoes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
