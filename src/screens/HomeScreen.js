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
};

export default function HomeScreen() {
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
      setError('Não foi possível conectar ao servidor');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega quando a tela ganha foco
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

  // Calcula o próximo alarme
  const getNextAlarm = () => {
    if (!config || !config.alarms || config.alarms.length === 0) {
      return 'Nenhum alarme configurado';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Ordena os alarmes e encontra o próximo
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

    // Se todos já passaram, o próximo é o primeiro do dia seguinte
    return sortedAlarms[0] + ' (amanhã)';
  };

  // Formata a data de atualização
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error && !config) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="cloud-offline" size={64} color={COLORS.warning} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchConfig}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
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
      <Text style={styles.title}>Despertador Inteligente</Text>
      <Text style={styles.subtitle}>Dashboard</Text>

      {/* Card - Próximo Alarme */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="alarm" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Próximo Alarme</Text>
        </View>
        <Text style={styles.cardValue}>{getNextAlarm()}</Text>
        <Text style={styles.cardSubtext}>
          {config?.alarms?.length || 0} alarme(s) configurado(s)
        </Text>
      </View>

      {/* Card - Limiar de Luminosidade */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sunny" size={24} color={COLORS.success} />
          <Text style={styles.cardTitle}>Limiar de Luminosidade</Text>
        </View>
        <Text style={styles.cardValue}>
          {config?.lightThreshold ?? '-'}
        </Text>
        <Text style={styles.cardSubtext}>
          Se luz {'<'} {config?.lightThreshold ?? '-'}, persiana abre
        </Text>
      </View>

      {/* Card - Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color={COLORS.textSecondary} />
          <Text style={styles.cardTitle}>Informações</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>{config?.deviceId ?? DEVICE_ID}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Última atualização:</Text>
          <Text style={styles.infoValue}>{formatDate(config?.updatedAt)}</Text>
        </View>
      </View>

      {error && (
        <Text style={styles.errorBanner}>
          <Ionicons name="warning" size={14} /> {error}
        </Text>
      )}
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
    marginBottom: 24,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    color: COLORS.warning,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    color: COLORS.warning,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
