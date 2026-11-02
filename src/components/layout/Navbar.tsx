import React, { useState } from 'react';
import { useNivora } from '../../context/NivoraContext';
import { UserRole } from '../../types';
import {
  Bell,
  HeartPulse,
  Store,
  Users,
  Bike,
  CheckCircle,
  AlertTriangle,
  Package,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const {
    role,
    setRole,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentPatient,
    deliveryPartner,
    resetDemoData,
  } = useNivora();

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Filter notifications relevant to current role
  const unreadNotifs = notifications.filter(
    (n) => !n.read && n.recipientRoles.includes(role)
  );

  const roleConfig: Record<
    UserRole,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    patient: { label: 'Patient', icon: HeartPulse, color: 'text-teal-600' },
    pharmacy: { label: 'Pharmacy', icon: Store, color: 'text-indigo-600' },
    caretaker: { label: 'Caretaker', icon: Users, color: 'text-amber-600' },
    delivery_partner: { label: 'Delivery Partner', icon: Bike, color: 'text-emerald-600' },
  };

  // Nav links per role
  const navTabsByRole: Record<UserRole, Array<{ id: string; label: string }>> = {
    patient: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'medicines', label: 'My Medicines' },
      { id: 'savings', label: 'Medical Savings' },
      { id: 'order', label: 'Order Medicines' },
      { id: 'delivery', label: 'Track Delivery' },
      { id: 'caretakers', label: 'My Caretakers' },
      { id: 'profile', label: 'Profile' },
    ],
    pharmacy: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'orders', label: 'Orders' },
      { id: 'prescriptions', label: 'Prescription Verification' },
      { id: 'inventory', label: 'Inventory' },
      { id: 'assignments', label: 'Delivery Assignment' },
      { id: 'reports', label: 'Reports' },
    ],
    caretaker: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'patients', label: 'My Patients' },
      { id: 'schedules', label: 'Medicine Schedules' },
      { id: 'missed', label: 'Missed Reminders' },
      { id: 'refills', label: 'Refill Alerts' },
      { id: 'profile', label: 'Profile' },
    ],
    delivery_partner: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'available', label: 'Available Deliveries' },
      { id: 'active', label: 'Active Delivery' },
      { id: 'history', label: 'Delivery History' },
      { id: 'earnings', label: 'Earnings' },
      { id: 'profile', label: 'Profile & KYC' },
    ],
  };

  const currentRoleNav = navTabsByRole[role] || [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Primary Top Bar: Brand, Navigation links, and Primary Action (Role Switcher & Notifications) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('dashboard');
              }}
              className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                N
              </div>
              <span>NIVORA</span>
            </a>
          </div>

          {/* Role Switcher Pill Bar (Clearly switches ecosystem viewpoint) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            {(Object.keys(roleConfig) as UserRole[]).map((r) => {
              const config = roleConfig[r];
              const Icon = config.icon;
              const isActive = role === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    onTabChange('dashboard');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? config.color : 'text-slate-400'}`} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Zone 3: Notification, Reset, Profile Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Reset Demo button */}
            <button
              onClick={resetDemoData}
              title="Reset simulation to default seed state"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-slate-900">Notifications ({unreadNotifs.length} new)</span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                            !n.read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                          {n.patientName && (
                            <div className="mt-1 text-[10px] text-teal-700 font-medium">
                              Patient: {n.patientName}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Role Profile Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={
                  role === 'patient'
                    ? currentPatient.avatarUrl
                    : role === 'caretaker'
                    ? '/src/assets/images/caretaker_priya_avatar_1793633752323.jpg'
                    : role === 'pharmacy'
                    ? '/src/assets/images/pharmacist_dr_kavita_avatar_1793633754400.jpg'
                    : deliveryPartner.avatarUrl
                }
                alt="User avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {role === 'patient'
                    ? currentPatient.name
                    : role === 'caretaker'
                    ? 'Nurse Priya Nair'
                    : role === 'pharmacy'
                    ? 'Apollo MedZone'
                    : deliveryPartner.fullName}
                </div>
                <div className="text-[10px] text-slate-500 leading-none">
                  {roleConfig[role].label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Navigation for the Active Role (Single-line horizontal tabs) */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {currentRoleNav.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
