import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importação das telas
import HomeScreen from './src/screens/HomeScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// Cores do tema escuro
const COLORS = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#BB86FC',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: COLORS.primary,
            background: COLORS.background,
            card: COLORS.card,
            text: COLORS.textPrimary,
            border: COLORS.card,
            notification: COLORS.primary,
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
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              backgroundColor: COLORS.card,
              borderTopColor: COLORS.background,
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
            },
            headerStyle: {
              backgroundColor: COLORS.card,
            },
            headerTintColor: COLORS.textPrimary,
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
            name="Config"
            component={SettingsScreen}
            options={{ title: 'Config' }}
          />
          <Tab.Screen
            name="Histórico"
            component={HistoryScreen}
            options={{ title: 'Histórico' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
