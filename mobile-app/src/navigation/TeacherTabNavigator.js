import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import CoursesStackNavigator from './CoursesStackNavigator';
// ...

const Tab = createBottomTabNavigator();

function PlaceholderTab({ route }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{route.name}</Text>
    </View>
  );
}

function TeacherTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={PlaceholderTab} />
      <Tab.Screen name="Students" component={PlaceholderTab} />
      <Tab.Screen name="Profile" component={PlaceholderTab} />
      <Tab.Screen name="My Courses" component={CoursesStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});

export default TeacherTabNavigator;