import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ClipboardList, BookOpen, Activity } from 'lucide-react-native';

import TasksScreen from './src/screens/TasksScreen';
import DiaryScreen from './src/screens/DiaryScreen';
import PlanScreen from './src/screens/PlanScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Today') {
              return <ClipboardList size={size} color={color} />;
            } else if (route.name === 'Diary') {
              return <BookOpen size={size} color={color} />;
            } else if (route.name === 'My Plan') {
              return <Activity size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#64748B',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 10,
            paddingTop: 10,
            height: 60,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
          }
        })}
      >
        <Tab.Screen name="Today" component={TasksScreen} />
        <Tab.Screen name="Diary" component={DiaryScreen} />
        <Tab.Screen name="My Plan" component={PlanScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
