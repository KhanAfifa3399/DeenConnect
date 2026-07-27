import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

function PlaceholderScreen({ route }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{route.name} Screen</Text>
    </View>
  );
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={PlaceholderScreen} />
        <Stack.Screen name="Login" component={PlaceholderScreen} />
        <Stack.Screen name="Dashboard" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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

export default RootNavigator;