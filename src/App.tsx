/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ScreenType } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { JerarquiaModal } from './components/JerarquiaModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { LobbyScreen } from './screens/LobbyScreen';
import { MesaEnVivoScreen } from './screens/MesaEnVivoScreen';
import { TorneosScreen } from './screens/TorneosScreen';
import { AnotadorScreen } from './screens/AnotadorScreen';
import { auth, syncUserProfile, loginWithGoogle, logoutFirebase, UserProfile } from './firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('lobby-de-salas');
  const [isJerarquiaModalOpen, setIsJerarquiaModalOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Monitor Firebase Auth changes and sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const profile = await loginWithGoogle();
      if (profile) {
        setUserProfile(profile);
      }
    } catch {
      // Ignored - cancellations and popup closures handled cleanly in loginWithGoogle
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      setUserProfile(null);
    } catch (err) {
      console.warn('Logout notice:', err);
    }
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`${
        currentScreen === 'mesa-en-vivo'
          ? 'h-screen max-h-screen overflow-hidden'
          : 'min-h-screen'
      } flex flex-col bg-surface-container-lowest text-on-surface font-body-md antialiased selection:bg-secondary/30 selection:text-secondary`}
    >
      {/* Persistent Navigation Header with XPath attributes */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onToggleJerarquiaModal={() => setIsJerarquiaModalOpen(true)}
        userProfile={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Main Dynamic Viewport Area */}
      <main
        className={`flex-1 w-full bg-surface-container-lowest ${
          currentScreen === 'mesa-en-vivo'
            ? 'pt-14 sm:pt-16 h-screen max-h-screen overflow-hidden flex flex-col'
            : 'pt-20 min-h-screen'
        }`}
      >
        {currentScreen === 'lobby-de-salas' && (
          <LobbyScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'mesa-en-vivo' && (
          <MesaEnVivoScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'torneos-y-copas' && (
          <TorneosScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'anotador-digital' && (
          <AnotadorScreen onNavigate={handleNavigate} />
        )}
      </main>

      {/* Shared Footer (hidden during live table to prevent vertical scrolling) */}
      {currentScreen !== 'mesa-en-vivo' && <Footer />}

      {/* Rules Hierarchy Modal */}
      <JerarquiaModal
        isOpen={isJerarquiaModalOpen}
        onClose={() => setIsJerarquiaModalOpen(false)}
      />

      {/* Live Voice Conversation Modal (gemini-3.8-live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </div>
  );
}
