import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { AudioPlayerProvider } from './src/context/AudioPlayerContext';

export default function App() {
  const [fontsLoaded] = useFonts({ Amiri_400Regular, Amiri_700Bold });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <AudioPlayerProvider>
      <RootNavigator />
    </AudioPlayerProvider>
  );
}