import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
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

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/logs/${DEVICE_ID}?limit=50`);
      if (response.data.success) {
        setLogs(response.data.data || []);
      }
    } catch (err) {
      setError('Não foi possível carregar o histórico');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLogs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Formata timestamp para exibição
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logCard}>
      {/* Header com timestamp */}
      <View style={styles.logHeader}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      {/* Conteúdo do log */}
      <View style={styles.logContent}>
        {/* Luminosidade */}
        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons name="sunny-outline" size={20} color={COLORS.primary} />
            <Text style={styles.logLabel}>Luminosidade</Text>
          </View>
          <Text style={styles.logValue}>{item.light ?? '-'}</Text>
        </View>

        {/* Alarme disparado */}
        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons
              name={item.alarmTriggered ? 'alarm' : 'alarm-outline'}
              size={20}
              color={item.alarmTriggered ? COLORS.warning : COLORS.textSecondary}
            />
            <Text style={styles.logLabel}>Alarme</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.alarmTriggered ? COLORS.warning : COLORS.textSecondary },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.alarmTriggered ? COLORS.warning : COLORS.textSecondary },
              ]}
            >
              {item.alarmTriggered ? 'Disparou' : 'Inativo'}
            </Text>
          </View>
        </View>

        {/* Persiana/Servo */}
        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons
              name={item.servoOpened ? 'sunny' : 'moon-outline'}
              size={20}
              color={item.servoOpened ? COLORS.success : COLORS.textSecondary}
            />
            <Text style={styles.logLabel}>Persiana</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.servoOpened ? COLORS.success : COLORS.textSecondary },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.servoOpened ? COLORS.success : COLORS.textSecondary },
              ]}
            >
              {item.servoOpened ? 'Aberta' : 'Fechada'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
      <Text style={styles.emptySubtext}>
        Os logs aparecerão aqui quando o ESP32 enviar dados
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (error && logs.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="cloud-offline" size={64} color={COLORS.warning} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLogs}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Logs de execução</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={COLORS.warning} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={logs}
        keyExtractor={(item, index) => `${item.id || index}`}
        renderItem={renderLogItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />

      <Text style={styles.footer}>
        {logs.length} registro(s) encontrado(s)
      </Text>
    </View>
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
  header: {
    padding: 20,
    paddingBottom: 8,
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
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  timestamp: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  logContent: {},
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  logValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(207, 102, 121, 0.2)',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorBannerText: {
    color: COLORS.warning,
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
