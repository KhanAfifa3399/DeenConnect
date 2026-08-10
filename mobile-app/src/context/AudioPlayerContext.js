import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const soundRef = useRef(null);
  const positionsRef = useRef({});

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }, []);

  const onStatusUpdate = useCallback((status, trackId) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    positionsRef.current[trackId] = status.positionMillis || 0;
    if (status.didJustFinish) {
      positionsRef.current[trackId] = 0;
    }
  }, []);

  async function playTrack(track) {
    if (currentTrack?.id === track.id && soundRef.current) {
      await soundRef.current.playAsync();
      return;
    }

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setIsLoading(true);
    setCurrentTrack(track);

    try {
      const resumeFrom = positionsRef.current[track.id] || 0;
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true, positionMillis: resumeFrom },
        (status) => onStatusUpdate(status, track.id)
      );
      soundRef.current = sound;
    } catch (err) {
      console.error('Failed to play audio:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePlayPause() {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  async function closePlayer() {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }

  return (
    <AudioPlayerContext.Provider
      value={{ currentTrack, isPlaying, isLoading, position, duration, playTrack, togglePlayPause, closePlayer }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}