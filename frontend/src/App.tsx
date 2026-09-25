import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { AICopilotDrawer } from './components/layout/AICopilotDrawer';
import { InitialSplashLoader } from './components/layout/InitialSplashLoader';

import { Overview } from './pages/Overview';
import { Incidents } from './pages/Incidents';
import { IncidentDetails } from './pages/IncidentDetails';
import { Services } from './pages/Services';
import { Metrics } from './pages/Metrics';
import { Logs } from './pages/Logs';
import { Traces } from './pages/Traces';
import { Agents } from './pages/Agents';
import { Runbooks } from './pages/Runbooks';
import { Simulator } from './pages/Simulator';
import { Replay } from './pages/Replay';
import { Postmortems } from './pages/Postmortems';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [loadingSplash, setLoadingSplash] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <>
      {loadingSplash && (
        <InitialSplashLoader onComplete={() => setLoadingSplash(false)} />
      )}

      <BrowserRouter>
        <div className="flex h-screen bg-[#0B0F14] text-slate-100 overflow-hidden font-sans">
          {/* Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
              copilotOpen={copilotOpen}
            />

            <main className="flex-1 overflow-y-auto bg-[#0B0F14]">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/incidents/:id" element={<IncidentDetails />} />
                <Route path="/services" element={<Services />} />
                <Route path="/metrics" element={<Metrics />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/traces" element={<Traces />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/runbooks" element={<Runbooks />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/replay" element={<Replay />} />
                <Route path="/postmortems" element={<Postmortems />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>

          {/* Floating Modals and Drawers */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
          <AICopilotDrawer
            isOpen={copilotOpen}
            onClose={() => setCopilotOpen(false)}
          />
        </div>
      </BrowserRouter>
    </>
  );
};
