/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PrivacyBanner } from './components/PrivacyBanner';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { RiskAnalyzer } from './components/RiskAnalyzer';
import { BudgetAnalyzer } from './components/BudgetAnalyzer';
import { FinancialExplainer } from './components/FinancialExplainer';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sync tab with pathname or hash on load and back/forward navigation
  useEffect(() => {
    const resolveRoute = (): ActiveTab => {
      const path = window.location.pathname.toLowerCase().replace(/^\/+/, '');
      const hash = window.location.hash.toLowerCase().replace('#', '');

      const routeCandidate = hash || path;

      if (routeCandidate === 'dashboard') return 'dashboard';
      if (routeCandidate === 'risk-analyzer' || routeCandidate === 'risk') return 'risk-analyzer';
      if (routeCandidate === 'budget') return 'budget';
      if (routeCandidate === 'explain' || routeCandidate === 'explainer') return 'explainer';
      if (routeCandidate === 'landing' || routeCandidate === '' || routeCandidate === '/') return 'landing';

      return 'dashboard';
    };

    setActiveTab(resolveRoute());

    const handleLocationChange = () => {
      setActiveTab(resolveRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    const path = tab === 'landing' ? '/' : tab === 'explainer' ? '/explain' : `/${tab}`;
    try {
      window.history.pushState({ tab }, '', path);
    } catch {
      window.location.hash = tab === 'explainer' ? 'explain' : tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
        {/* Sleek Desktop Sidebar with Auth */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={handleSelectTab} 
          onOpenAuth={handleOpenAuth} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Navigation Header */}
          <Navbar 
            activeTab={activeTab} 
            onSelectTab={handleSelectTab} 
            onOpenAuth={handleOpenAuth} 
          />

          {/* Privacy Notice Banner */}
          <PrivacyBanner />

          {/* Dynamic Route View */}
          <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto flex flex-col justify-between">
            <div className="flex-1">
              {activeTab === 'landing' && (
                <LandingPage onSelectTab={handleSelectTab} onOpenAuth={handleOpenAuth} />
              )}
              {activeTab === 'dashboard' && (
                <Dashboard onSelectTab={handleSelectTab} onOpenAuth={handleOpenAuth} />
              )}
              {activeTab === 'risk-analyzer' && (
                <RiskAnalyzer onOpenAuth={handleOpenAuth} />
              )}
              {activeTab === 'budget' && <BudgetAnalyzer />}
              {activeTab === 'explainer' && <FinancialExplainer />}
            </div>

            {/* Sleek Footer */}
            <Footer onSelectTab={handleSelectTab} />
          </main>
        </div>

        {/* Firebase Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </AuthProvider>
  );
}
