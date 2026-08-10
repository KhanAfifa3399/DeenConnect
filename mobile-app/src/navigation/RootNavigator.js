import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentTabNavigator from './StudentTabNavigator';
import TeacherTabNavigator from './TeacherTabNavigator';
import CourseDetailsScreen from '../screens/student/CourseDetailsScreen';
import LecturePlayerScreen from '../screens/student/LecturePlayerScreen';
import EditProfileScreen from '../screens/student/EditProfileScreen';
import ChangePasswordScreen from '../screens/student/ChangePasswordScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import TeacherCourseDetailsScreen from '../screens/teacher/TeacherCourseDetailsScreen';
import CreateAnnouncementScreen from '../screens/teacher/CreateAnnouncementScreen';
import MyAnnouncementsScreen from '../screens/teacher/MyAnnouncementsScreen';
import SurahReaderScreen from '../screens/student/SurahReaderScreen';
import MiniPlayer from '../components/MiniPlayer';
// ...
// ...
// ...

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StudentApp" component={StudentTabNavigator} />
        <Stack.Screen name="TeacherApp" component={TeacherTabNavigator} />

        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="LecturePlayer" component={LecturePlayerScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="TeacherCourseDetails" component={TeacherCourseDetailsScreen} />
        <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
<Stack.Screen name="MyAnnouncements" component={MyAnnouncementsScreen} />
        <Stack.Screen name="SurahReader" component={SurahReaderScreen} />



      </Stack.Navigator>
      <MiniPlayer />
    </NavigationContainer>
  );
}

export default RootNavigator;