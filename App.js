import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexto de tema
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Importação das telas
import HomeScreen from './src/screens/HomeScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.textPrimary,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '800',
            },
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Alarmes':
                  iconName = focused ? 'alarm' : 'alarm-outline';
                  break;
                case 'Config':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
                case 'Histórico':
                  iconName = focused ? 'list' : 'list-outline';
                  break;
                default:
                  iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
            },
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Home' }}
          />
          <Tab.Screen
            name="Alarmes"
            component={AlarmsScreen}
            options={{ title: 'Alarmes' }}
          />
          <Tab.Screen
            name="Histórico"
            component={HistoryScreen}
            options={{ title: 'Histórico' }}
          />
          <Tab.Screen
            name="Config"
            component={SettingsScreen}
            options={{ title: 'Config' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
