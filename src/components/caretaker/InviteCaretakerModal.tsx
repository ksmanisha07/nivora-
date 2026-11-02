import React, { useState } from 'react';
import { CaretakerPermissions, CaretakerConnection } from '../../types';
import { X, UserPlus, Shield, Check, Info } from 'lucide-react';

interface InviteCaretakerModalProps {
  onClose: () => void;
  onInvite: (data: {
    name: string;
    phone: string;
    role: CaretakerConnection['caretakerRole'];
    permissions: CaretakerPermissions;
  }) => void;
}

export default function InviteCaretakerModal({ onClose, onInvite }: InviteCaretakerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CaretakerConnection['caretakerRole']>('Personal Nurse');
  const [inviteMethod, setInviteMethod] = useState<'phone' | 'code'>('phone');
  const [customInviteCode, setCustomInviteCode] = useState('NIV-CARE-7821');

  const [permissions, setPermissions] = useState<CaretakerPermissions>({
    viewMedicationSchedules: true,
    receiveMedicationReminders: true,
    viewMissedDoseAlerts: true,
    viewMedicineInventory: true,
    manageMedicineOrders: true,
    viewMedicalExpenseSummaries: false,
    viewDeliveryStatus: true,
  });

  const togglePermission = (key: keyof CaretakerPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const permissionList: Array<{
    key: keyof CaretakerPermissions;
    title: string;
    desc: string;
  }> = [
    {
      key: 'viewMedicationSchedules',
      title: 'View Medication Schedules',
      desc: 'Can see full daily regimen, timings, and dosage directions',
    },
    {
      key: 'receiveMedicationReminders',
      title: 'Receive Medication Reminders',
      desc: 'Receives alerts for scheduled intake timings',
    },
    {
      key: 'viewMissedDoseAlerts',
      title: 'View Missed-Dose Alerts',
      desc: 'Immediate notification if a critical dose is not logged',
    },
    {
      key: 'viewMedicineInventory',
      title: 'View Medicine Inventory',
      desc: 'Can monitor pill count and strip stock balances',
    },
    {
      key: 'manageMedicineOrders',
      title: 'Manage Medicine Orders',
      desc: 'Can place or approve medicine refill purchases on your behalf',
    },
    {
      key: 'viewMedicalExpenseSummaries',
      title: 'View Medical Expense Summaries',
      desc: 'Can view savings wallet and pharmacy bill receipts',
    },
    {
      key: 'viewDeliveryStatus',
      title: 'View Delivery Status',
      desc: 'Real-time GPS delivery tracking and delivery confirmations',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onInvite({
      name: name.trim(),
      phone: phone.trim() || '+91 98000 00000',
      role,
      permissions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect a New Caretaker</h3>
              <p className="text-xs text-slate-500">Configure fine-grained permissions for this individual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Method selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setInviteMethod('phone')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                inviteMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Direct Mobile Invite
            </button>
            <button
              type="button"
              onClick={() => setInviteMethod('code')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                inviteMethod === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Unique Invitation Code
            </button>
          </div>

          {inviteMethod === 'code' && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-900">Your Shareable Connection Code:</span>
                <span className="font-mono text-sm font-bold bg-white px-3 py-1 rounded border border-teal-300 text-teal-950">
                  {customInviteCode}
                </span>
              </div>
              <p className="text-teal-700">
                Share this secure code with your family member or nurse. Once entered, they will connect with the
                permissions designated below.
              </p>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Caretaker Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Anita Roy / Vijay Sharma"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Relationship / Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Relationship / Care Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CaretakerConnection['caretakerRole'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Personal Nurse">Personal Nurse</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Spouse">Spouse</option>
              <option value="Primary Guardian">Primary Guardian</option>
            </select>
          </div>

          {/* Granular Permissions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Granular Access Permissions</span>
              </div>
              <span className="text-[11px] text-slate-400">Can be updated anytime</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {permissionList.map((perm) => {
                const isEnabled = permissions[perm.key];
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{perm.title}</div>
                      <div className="text-[11px] text-slate-500">{perm.desc}</div>
                    </div>
                    <button
                      type="button"
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                        isEnabled ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Send Caretaker Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
