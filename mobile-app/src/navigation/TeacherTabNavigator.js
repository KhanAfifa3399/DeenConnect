import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import MyClassesScreen from '../screens/teacher/MyClassesScreen';
import StudentsScreen from '../screens/teacher/StudentsScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';
import TeacherQuranScreen from '../screens/teacher/TeacherQuranScreen';

const Tab = createBottomTabNavigator();

function TeacherTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        
        // Dynamic Icon assignment based on route name
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'My Classes') {
            iconName = focused ? 'google-classroom' : 'google-classroom'; // or 'book-open-page-variant'
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Quran') {
            iconName = focused ? 'book-open-variant' : 'book-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
      <Tab.Screen name="My Classes" component={MyClassesScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Quran" component={TeacherQuranScreen} />
      <Tab.Screen name="Profile" component={TeacherProfileScreen} />
    </Tab.Navigator>
  );
}

export default TeacherTabNavigator;