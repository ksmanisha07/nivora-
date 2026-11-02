/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NivoraProvider, useNivora } from './context/NivoraContext';
import Navbar from './components/layout/Navbar';
import PatientDashboard from './components/patient/PatientDashboard';
import PharmacyDashboard from './components/pharmacy/PharmacyDashboard';
import CaretakerDashboard from './components/caretaker/CaretakerDashboard';
import DeliveryPartnerDashboard from './components/delivery/DeliveryPartnerDashboard';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

function AppContent() {
  const { role } = useNivora();
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar with Role Switcher & Notifications */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Role Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'patient' && (
          <PatientDashboard currentTab={currentTab} onTabChange={setCurrentTab} />
        )}

        {role === 'pharmacy' && (
          <PharmacyDashboard currentTab={currentTab} onTabChange={setCurrentTab} />
        )}

        {role === 'caretaker' && (
          <CaretakerDashboard currentTab={currentTab} onTabChange={setCurrentTab} />
        )}

        {role === 'delivery_partner' && (
          <DeliveryPartnerDashboard currentTab={currentTab} onTabChange={setCurrentTab} />
        )}
      </main>

      {/* Brand Footer adhering to PRD Vision */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight">NIVORA</span>
            <span>—</span>
            <span className="font-medium text-teal-800">Saving for Health · Delivering Care · Connecting Lives</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HIPAA & DPDP Compliant Delivery Privacy
            </span>
            <span>·</span>
            <span>Multi-Caretaker Granular RBAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <NivoraProvider>
      <AppContent />
    </NivoraProvider>
  );
}
