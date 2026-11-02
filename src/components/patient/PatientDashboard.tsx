import React, { useState } from 'react';
import { useNivora } from '../../context/NivoraContext';
import {
  HeartPulse,
  Clock,
  PiggyBank,
  Package,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  PhoneCall,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import GpsMapTracker from '../common/GpsMapTracker';
import InviteCaretakerModal from '../caretaker/InviteCaretakerModal';
import { CaretakerPermissions, CaretakerConnection } from '../../types';

interface PatientDashboardProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function PatientDashboard({ currentTab, onTabChange }: PatientDashboardProps) {
  const {
    currentPatient,
    schedules,
    markDose,
    addMedicine,
    caretakerConnections,
    updateCaretakerPermissions,
    removeCaretaker,
    inviteCaretaker,
    orders,
    assignments,
    activeAssignment,
    placeOrder,
  } = useNivora();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCaretakerForEdit, setSelectedCaretakerForEdit] = useState<CaretakerConnection | null>(null);

  // New medicine form state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTiming, setNewMedTiming] = useState('8:00 AM');
  const [newMedSlot, setNewMedSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedDays, setNewMedDays] = useState(15);
  const [newMedCritical, setNewMedCritical] = useState(false);

  // Filter medicines for Rahul
  const rahulMeds = schedules.filter((s) => s.patientId === currentPatient.id);
  const todayTaken = rahulMeds.filter((s) => s.status === 'taken').length;
  const adherenceRate = Math.round((todayTaken / rahulMeds.length) * 100) || 0;

  // Active delivery assignment for Rahul
  const patientActiveDelivery = assignments.find(
    (a) => a.patientId === currentPatient.id && a.assignmentStatus !== 'Delivered'
  );

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;
    addMedicine({
      patientId: currentPatient.id,
      medicineName: newMedName,
      dosage: newMedDosage || '1 Tablet',
      timing: newMedTiming,
      slot: newMedSlot,
      instructions: newMedInstructions || 'Take with water',
      daysRemaining: Number(newMedDays),
      stockRemaining: Number(newMedDays) * 2,
      critical: newMedCritical,
    });
    setShowAddMedModal(false);
    setNewMedName('');
  };

  const medicineCatalog = [
    { name: 'Metformin SR 500mg (Strip of 15)', price: 145, dosage: '500mg' },
    { name: 'Budecort 200 Inhaler (200 MDIs)', price: 420, dosage: '200mcg' },
    { name: 'Montair LC (Strip of 10)', price: 210, dosage: '10mg' },
    { name: 'Accu-Chek Active Test Strips (50s)', price: 950, dosage: 'Diagnostic' },
    { name: 'Vitamin D3 60k IU (Pack of 4)', price: 180, dosage: '60000 IU' },
  ];

  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentPatient.avatarUrl}
              alt={currentPatient.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentPatient.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  {currentPatient.age} yrs · {currentPatient.gender}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Conditions: {currentPatient.medicalConditions.join(', ')} · Doctor: {currentPatient.primaryDoctor}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onTabChange('medicines')}
              className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer"
            >
              Today's Regimen ({rahulMeds.length} Meds)
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Connect Caretaker</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Today's Adherence</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {adherenceRate}%
              </div>
              <span className="text-[11px] text-teal-600 mt-1 inline-block">
                {todayTaken} of {rahulMeds.length} doses logged
              </span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Medical Savings Fund</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                ₹{currentPatient.monthlySavingsBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 inline-block">
                Goal: ₹{currentPatient.savingsGoal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Active Caretakers</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {caretakerConnections.filter((c) => c.patientId === currentPatient.id).length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Family & Nurses</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Live Delivery</span>
              <div className="text-base font-bold text-slate-900 mt-2 truncate">
                {patientActiveDelivery ? patientActiveDelivery.assignmentStatus : 'No active order'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">
                {patientActiveDelivery ? `ETA ~${patientActiveDelivery.estimatedMinutes}m` : 'Ready to order'}
              </span>
            </div>
          </div>

          {/* ACTIVE DELIVERY STATUS BANNER (with direct live GPS map) */}
          {patientActiveDelivery && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Doorstep Medicine Delivery (Order #{patientActiveDelivery.orderId})
                  </h3>
                </div>
                <div className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded font-mono font-bold border border-amber-200">
                  Proof-of-Delivery OTP: {patientActiveDelivery.deliveryOtp}
                </div>
              </div>
              <GpsMapTracker assignment={patientActiveDelivery} viewerRole="patient" />
            </div>
          )}

          {/* Daily Schedule Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Medication Schedule</h3>
                <p className="text-xs text-slate-500">Dose notifications synchronized with authorized caretakers</p>
              </div>
              <button
                onClick={() => setShowAddMedModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {rahulMeds.map((med) => (
                <div key={med.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{med.medicineName}</span>
                      <span className="text-xs text-slate-500 font-mono">({med.dosage})</span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {med.slot} · {med.timing}
                      </span>
                      {med.critical && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{med.instructions}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {med.stockRemaining} tablets remaining · {med.daysRemaining} days left
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {med.status === 'taken' ? (
                      <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Taken at {med.takenAt}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => markDose(med.id, 'taken')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs cursor-pointer"
                        >
                          Take Dose
                        </button>
                        <button
                          onClick={() => markDose(med.id, 'missed')}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                        >
                          Skip / Missed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MY MEDICINES TAB */}
      {currentTab === 'medicines' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Prescriptions & Regimen</h3>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 rounded-lg cursor-pointer"
            >
              + Add Medicine
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {rahulMeds.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{m.medicineName}</div>
                  <div className="text-xs text-slate-500">
                    {m.slot} ({m.timing}) · Dosage: {m.dosage}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{m.instructions}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-800">{m.stockRemaining} units in box</div>
                  <div className="text-[11px] text-slate-400">{m.daysRemaining} days remaining</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEDICAL SAVINGS TAB */}
      {currentTab === 'savings' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">NIVORA Medical Savings Wallet</h3>
                <p className="text-xs text-slate-500">
                  Daily recurring health savings to buffer against prescription refills and emergencies
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 font-mono text-xl font-bold">
                ₹{currentPatient.monthlySavingsBalance.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (currentPatient.monthlySavingsBalance / currentPatient.savingsGoal) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>Saved: ₹{currentPatient.monthlySavingsBalance}</span>
              <span>Goal: ₹{currentPatient.savingsGoal}</span>
            </div>
          </div>
        </div>
      )}

      {/* ORDER MEDICINES TAB */}
      {currentTab === 'order' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Order Prescribed Medicines</h3>
              <p className="text-xs text-slate-500">
                Orders are verified by certified Apollo MedZone pharmacists and dispatched via verified delivery partners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicineCatalog.map((item) => (
                <div
                  key={item.name}
                  className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">Dosage: {item.dosage}</p>
                    <div className="text-xs font-mono font-bold text-teal-800 mt-1">₹{item.price}</div>
                  </div>
                  <button
                    onClick={() => {
                      placeOrder(
                        [{ medicineName: item.name, quantity: 1, price: item.price, dosage: item.dosage }],
                        currentPatient.address
                      );
                      onTabChange('delivery');
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Order Doorstep Delivery
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRACK DELIVERY TAB */}
      {currentTab === 'delivery' && (
        <div className="space-y-6">
          {patientActiveDelivery ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Delivery Tracking · Order #{patientActiveDelivery.orderId}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Partner: Arun Kumar · Vehicle: KA-01-EQ-4492 (Electric Scooter)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Your Proof-of-Delivery OTP:</span>
                  <span className="text-xl font-mono font-extrabold text-amber-900 bg-amber-50 px-3 py-1 rounded border border-amber-300">
                    {patientActiveDelivery.deliveryOtp}
                  </span>
                </div>
              </div>
              <GpsMapTracker assignment={patientActiveDelivery} viewerRole="patient" />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
              No active delivery en route. Place an order to track the real-time GPS journey.
            </div>
          )}
        </div>
      )}

      {/* MY CARETAKERS TAB (Multiple Caretakers & Granular Permission Management) */}
      {currentTab === 'caretakers' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Authorized Caretakers</h3>
              <p className="text-xs text-slate-500">
                You can connect multiple family members & nurses, each with independent permission levels
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>+ Invite New Caretaker</span>
            </button>
          </div>

          {/* Caretakers list */}
          <div className="space-y-4">
            {caretakerConnections
              .filter((c) => c.patientId === currentPatient.id)
              .map((conn) => (
                <div
                  key={conn.id}
                  className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={conn.caretakerAvatar}
                        alt={conn.caretakerName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{conn.caretakerName}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                            {conn.caretakerRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {conn.caretakerPhone} · Connected on {conn.createdAt}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeCaretaker(conn.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Unlink Caretaker</span>
                    </button>
                  </div>

                  {/* Permission Toggle Grid for this connection */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-700 mb-2">Configured Permissions:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {(
                        [
                          { key: 'viewMedicationSchedules', label: 'View Schedules' },
                          { key: 'receiveMedicationReminders', label: 'Receive Reminders' },
                          { key: 'viewMissedDoseAlerts', label: 'Missed-Dose Alerts' },
                          { key: 'viewMedicineInventory', label: 'Medicine Inventory' },
                          { key: 'manageMedicineOrders', label: 'Manage Orders' },
                          { key: 'viewMedicalExpenseSummaries', label: 'Expense Summaries' },
                          { key: 'viewDeliveryStatus', label: 'Delivery Status' },
                        ] as const
                      ).map(({ key, label }) => {
                        const isGranted = conn.permissions[key];
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 hover:bg-slate-100/60 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {
                                updateCaretakerPermissions(conn.id, {
                                  ...conn.permissions,
                                  [key]: !isGranted,
                                });
                              }}
                              className="w-3.5 h-3.5 text-teal-600 rounded"
                            />
                            <span className="text-slate-800 text-[11px] font-medium">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {currentTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Patient Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Name</span>
              <span className="font-semibold text-slate-900">{currentPatient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Delivery Address</span>
              <span className="font-semibold text-slate-900">{currentPatient.address}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Primary Doctor</span>
              <span className="font-semibold text-slate-900">{currentPatient.primaryDoctor}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-900">{currentPatient.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Invite Caretaker Modal */}
      {showInviteModal && (
        <InviteCaretakerModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(data) => inviteCaretaker(data)}
        />
      )}

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Prescribed Medicine</h3>
            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telmisartan 40mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="1 Tablet"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Timing</label>
                  <input
                    type="text"
                    placeholder="8:00 AM"
                    value={newMedTiming}
                    onChange={(e) => setNewMedTiming(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Slot</label>
                <select
                  value={newMedSlot}
                  onChange={(e) => setNewMedSlot(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instructions</label>
                <input
                  type="text"
                  placeholder="Take after breakfast with water"
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="crit"
                  checked={newMedCritical}
                  onChange={(e) => setNewMedCritical(e.target.checked)}
                />
                <label htmlFor="crit" className="text-slate-800 font-semibold">
                  Critical medication (alerts caretakers if missed)
                </label>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-3 py-1.5 text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
