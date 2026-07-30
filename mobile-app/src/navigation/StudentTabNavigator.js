import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import CoursesStackNavigator from './CoursesStackNavigator';
import QuranScreen from '../screens/student/QuranScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
// import ProfileStackNavigator from './ProfileStackNavigator';
// ...

const Tab = createBottomTabNavigator();

function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Courses') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Quran') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <Tab.Screen name="My Courses" component={CoursesStackNavigator} />
      <Tab.Screen name="Quran" component={QuranScreen} />
      
    <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
}

export default StudentTabNavigator;