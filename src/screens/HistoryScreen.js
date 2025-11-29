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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { DEVICE_ID } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
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
      setError('Nao foi possivel carregar o historico');
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    logCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    timestamp: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      marginLeft: 10,
    },
    logValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
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
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 40,
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(207, 102, 121, 0.2)' : 'rgba(211, 47, 47, 0.1)',
      padding: 12,
      marginHorizontal: 20,
      borderRadius: 8,
      marginBottom: 8,
    },
    errorBannerText: {
      color: colors.warning,
      fontSize: 14,
      marginLeft: 8,
    },
    footer: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 12,
    },
  });

  const renderLogItem = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      <View style={styles.logContent}>
        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons name="sunny-outline" size={20} color={colors.primary} />
            <Text style={styles.logLabel}>Luminosidade</Text>
          </View>
          <Text style={styles.logValue}>{item.light ?? '-'}</Text>
        </View>

        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons
              name={item.alarmTriggered ? 'alarm' : 'alarm-outline'}
              size={20}
              color={item.alarmTriggered ? colors.warning : colors.textSecondary}
            />
            <Text style={styles.logLabel}>Alarme</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.alarmTriggered ? colors.warning : colors.textSecondary },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.alarmTriggered ? colors.warning : colors.textSecondary },
              ]}
            >
              {item.alarmTriggered ? 'Disparou' : 'Inativo'}
            </Text>
          </View>
        </View>

        <View style={styles.logRow}>
          <View style={styles.logItem}>
            <Ionicons
              name={item.ledOn ? 'bulb-outline' : 'bulb'}
              size={20}
              color={item.ledOn ? colors.textSecondary : colors.success}
            />
            <Text style={styles.logLabel}>Luz</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.ledOn ? colors.textSecondary : colors.success },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.ledOn ? colors.textSecondary : colors.success },
              ]}
            >
              {item.ledOn ? 'Apagada' : 'Acesa'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
      <Text style={styles.emptySubtext}>
        Os logs aparecerao aqui quando o ESP32 enviar dados
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando historico...</Text>
      </SafeAreaView>
    );
  }

  if (error && logs.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="cloud-offline" size={64} color={colors.warning} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLogs}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historico</Text>
        <Text style={styles.subtitle}>Logs de execucao</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={colors.warning} />
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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <Text style={styles.footer}>
        {logs.length} registro(s) encontrado(s)
      </Text>
    </SafeAreaView>
  );
}
