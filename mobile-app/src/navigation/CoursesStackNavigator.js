import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyCoursesScreen from '../screens/student/MyCoursesScreen';
import CourseDetailsScreen from '../screens/student/CourseDetailsScreen';
import LecturePlayerScreen from '../screens/student/LecturePlayerScreen';

const Stack = createNativeStackNavigator();

function CoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyCoursesList" component={MyCoursesScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <Stack.Screen name="LecturePlayer" component={LecturePlayerScreen} />
    </Stack.Navigator>
  );
}

export default CoursesStackNavigator;