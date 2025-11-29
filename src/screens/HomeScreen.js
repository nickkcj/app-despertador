import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { DEVICE_ID } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/config/${DEVICE_ID}`);
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (err) {
      setError('Nao foi possivel conectar ao servidor');
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

  const getNextAlarm = () => {
    if (!config || !config.alarms || config.alarms.length === 0) {
      return 'Nenhum alarme configurado';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const sortedAlarms = [...config.alarms].sort((a, b) => {
      const [aH, aM] = a.split(':').map(Number);
      const [bH, bM] = b.split(':').map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

    for (const alarm of sortedAlarms) {
      const [hours, minutes] = alarm.split(':').map(Number);
      const alarmTime = hours * 60 + minutes;
      if (alarmTime > currentTime) {
        return alarm;
      }
    }

    return sortedAlarms[0] + ' (amanha)';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      marginBottom: 24,
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
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 10,
    },
    cardValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    cardSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    loadingText: {
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 16,
    },
    errorText: {
      marginTop: 16,
      color: colors.warning,
      fontSize: 16,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    retryButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    errorBanner: {
      color: colors.warning,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (error && !config) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="cloud-offline" size={64} color={colors.warning} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchConfig}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Despertador Inteligente</Text>
        <Text style={styles.subtitle}>Dashboard</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="alarm" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Proximo Alarme</Text>
          </View>
          <Text style={styles.cardValue}>{getNextAlarm()}</Text>
          <Text style={styles.cardSubtext}>
            {config?.alarms?.length || 0} alarme(s) configurado(s)
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color={colors.success} />
            <Text style={styles.cardTitle}>Limiar de Luminosidade</Text>
          </View>
          <Text style={styles.cardValue}>
            {config?.lightThreshold ?? '-'}
          </Text>
          <Text style={styles.cardSubtext}>
            Se luz {'<'} {config?.lightThreshold ?? '-'}, persiana abre
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={colors.textSecondary} />
            <Text style={styles.cardTitle}>Informacoes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device ID:</Text>
            <Text style={styles.infoValue}>{config?.deviceId ?? DEVICE_ID}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ultima atualizacao:</Text>
            <Text style={styles.infoValue}>{formatDate(config?.updatedAt)}</Text>
          </View>
        </View>

        {error && (
          <Text style={styles.errorBanner}>
            <Ionicons name="warning" size={14} /> {error}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
