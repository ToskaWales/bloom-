import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './lib/AppContext';
import { Layout } from './components/Layout';
import { Greenhouse } from './pages/Greenhouse';
import { MorningSeed } from './pages/MorningSeed';
import { ActiveSession } from './pages/ActiveSession';
import { Lumina } from './pages/Lumina';
import { Grove } from './pages/Grove';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { user, firebaseUser, isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {!user.onboarded ? (
            <Route path="*" element={<Onboarding />} />
          ) : (
            <>
              <Route path="/" element={<Greenhouse />} />
              <Route path="/checkin" element={<MorningSeed />} />
              <Route path="/workout" element={<ActiveSession />} />
              <Route path="/active" element={<ActiveSession />} />
              <Route path="/chat" element={<Lumina />} />
              <Route path="/growth" element={<Grove />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </>
          )}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
