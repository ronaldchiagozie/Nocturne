import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createSoundscapeEngine } from '../lib/soundscape';

interface SoundscapeContextValue {
  isActive: boolean;

  isAudible: boolean;
  activate: () => Promise<void>;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
}

const SoundscapeContext = createContext<SoundscapeContextValue | null>(null);

export function SoundscapeProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef(createSoundscapeEngine());
  const [isActive, setIsActive] = useState(false);
  const [muted, setMuted] = useState(false);

  const activate = useCallback(async () => {
    await engineRef.current.start();
    setIsActive(true);
    setMuted(false);
    engineRef.current.setMuted(false);
  }, []);

  const mute = useCallback(() => {
    engineRef.current.setMuted(true);
    setMuted(true);
  }, []);

  const unmute = useCallback(() => {
    if (!engineRef.current.isRunning()) return;
    engineRef.current.setMuted(false);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!isActive) return;
    if (muted) unmute();
    else mute();
  }, [isActive, muted, mute, unmute]);

  const value = useMemo(
    () => ({
      isActive,
      isAudible: isActive && !muted,
      activate,
      mute,
      unmute,
      toggleMute,
    }),
    [isActive, muted, activate, mute, unmute, toggleMute],
  );

  return <SoundscapeContext.Provider value={value}>{children}</SoundscapeContext.Provider>;
}

export function useSoundscape() {
  const ctx = useContext(SoundscapeContext);
  if (!ctx) {
    throw new Error('useSoundscape must be used within SoundscapeProvider');
  }
  return ctx;
}
