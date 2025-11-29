import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { DEVICE_ID } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function AlarmsScreen() {
  const { colors } = useTheme();
  const [alarms, setAlarms] = useState([]);
  const [lightThreshold, setLightThreshold] = useState(300);
  const [newAlarm, setNewAlarm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/config/${DEVICE_ID}`);
      if (response.data.success) {
        setAlarms(response.data.data.alarms || []);
        setLightThreshold(response.data.data.lightThreshold || 300);
      }
    } catch (err) {
      setError('Nao foi possivel carregar os alarmes');
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

  const isValidTime = (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(time);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const saveAlarms = async (newAlarmsList) => {
    setSaving(true);
    try {
      const response = await api.put(`/api/config/${DEVICE_ID}`, {
        alarms: newAlarmsList,
        lightThreshold: lightThreshold,
      });
      if (response.data.success) {
        setAlarms(newAlarmsList);
        return true;
      }
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel salvar os alarmes');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addAlarm = async () => {
    if (!newAlarm.trim()) {
      Alert.alert('Atencao', 'Digite um horario');
      return;
    }

    if (!isValidTime(newAlarm)) {
      Alert.alert('Formato invalido', 'Use o formato HH:MM (ex: 07:30)');
      return;
    }

    const formattedTime = formatTime(newAlarm);

    if (alarms.includes(formattedTime)) {
      Alert.alert('Atencao', 'Este alarme ja esta configurado');
      return;
    }

    const newAlarmsList = [...alarms, formattedTime].sort((a, b) => {
      const [aH, aM] = a.split(':').map(Number);
      const [bH, bM] = b.split(':').map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

    const success = await saveAlarms(newAlarmsList);
    if (success) {
      setNewAlarm('');
    }
  };

  const removeAlarm = (alarmToRemove) => {
    Alert.alert(
      'Remover Alarme',
      `Deseja remover o alarme das ${alarmToRemove}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const newAlarmsList = alarms.filter((a) => a !== alarmToRemove);
            await saveAlarms(newAlarmsList);
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
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
    inputContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 18,
      color: colors.textPrimary,
      marginRight: 12,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    alarmItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    alarmInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    alarmTime: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.textPrimary,
      marginLeft: 12,
    },
    deleteButton: {
      padding: 8,
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
    },
    loadingText: {
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 16,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.dark ? 'rgba(207, 102, 121, 0.2)' : 'rgba(211, 47, 47, 0.1)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
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

  const renderAlarmItem = ({ item }) => (
    <View style={styles.alarmItem}>
      <View style={styles.alarmInfo}>
        <Ionicons name="alarm-outline" size={24} color={colors.primary} />
        <Text style={styles.alarmTime}>{item}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeAlarm(item)}
        disabled={saving}
      >
        <Ionicons name="trash-outline" size={22} color={colors.warning} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alarm-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>Nenhum alarme configurado</Text>
      <Text style={styles.emptySubtext}>
        Adicione um horario no campo acima
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando alarmes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Alarmes</Text>
      <Text style={styles.subtitle}>Gerencie seus horarios</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="HH:MM (ex: 07:30)"
          placeholderTextColor={colors.textSecondary}
          value={newAlarm}
          onChangeText={setNewAlarm}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          editable={!saving}
        />
        <TouchableOpacity
          style={[styles.addButton, saving && styles.buttonDisabled]}
          onPress={addAlarm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="add" size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={alarms}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderAlarmItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={alarms.length === 0 ? styles.emptyList : null}
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
        {alarms.length} alarme(s) configurado(s)
      </Text>
    </SafeAreaView>
  );
}
