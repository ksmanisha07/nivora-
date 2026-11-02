import React, { useState } from 'react';
import { useNivora } from '../../context/NivoraContext';
import {
  Users,
  HeartPulse,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShoppingCart,
  PhoneCall,
  Search,
  ChevronRight,
  UserCheck,
  Package,
} from 'lucide-react';
import GpsMapTracker from '../common/GpsMapTracker';

interface CaretakerDashboardProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function CaretakerDashboard({
  currentTab,
  onTabChange,
}: CaretakerDashboardProps) {
  const {
    allPatients,
    activePatientIdForCaretaker,
    setActivePatientIdForCaretaker,
    schedules,
    markDose,
    caretakerConnections,
    orders,
    assignments,
    placeOrder,
  } = useNivora();

  const [orderConfirmMsg, setOrderConfirmMsg] = useState('');

  // The active selected patient for detailed view
  const selectedPatient =
    allPatients.find((p) => p.id === activePatientIdForCaretaker) || allPatients[0];

  // Connection settings & permissions for the selected patient
  const connection = caretakerConnections.find((c) => c.patientId === selectedPatient.id);
  const permissions = connection?.permissions || {
    viewMedicationSchedules: true,
    receiveMedicationReminders: true,
    viewMissedDoseAlerts: true,
    viewMedicineInventory: true,
    manageMedicineOrders: true,
    viewMedicalExpenseSummaries: true,
    viewDeliveryStatus: true,
  };

  // Filter medicines STRICTLY for the selected patient (PRD rule: Do not mix medication schedules between patients!)
  const patientSchedules = schedules.filter((s) => s.patientId === selectedPatient.id);

  // Active delivery for this patient
  const patientActiveAssignment = assignments.find(
    (a) => a.patientId === selectedPatient.id && a.assignmentStatus !== 'Delivered'
  );

  // Helper to reorder medicine on behalf of patient (if authorized)
  const handleCaretakerReorder = (medicineName: string, dosage: string) => {
    if (!permissions.manageMedicineOrders) {
      alert('You do not have permission to place medicine orders for this patient.');
      return;
    }

    placeOrder(
      [{ medicineName: `${medicineName} (Emergency Refill)`, quantity: 1, price: 280, dosage }],
      selectedPatient.address
    );
    setOrderConfirmMsg(`Refill order successfully placed for ${selectedPatient.name}: ${medicineName}`);
    setTimeout(() => setOrderConfirmMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Multiple Patient Management Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Caretaker Portal · Nurse Priya Nair
              </h2>
              <p className="text-xs text-slate-500">
                Managing {allPatients.length} connected family members & assigned patients with individual permissions
              </p>
            </div>
          </div>

          {/* Quick patient switcher pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {allPatients.map((patient) => {
              const isSelected = patient.id === activePatientIdForCaretaker;
              const patientMeds = schedules.filter((s) => s.patientId === patient.id);
              const missedCount = patientMeds.filter((s) => s.status === 'missed').length;

              return (
                <button
                  key={patient.id}
                  onClick={() => setActivePatientIdForCaretaker(patient.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{patient.name}</span>
                  {missedCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title="Missed dose alert" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {orderConfirmMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{orderConfirmMsg}</span>
        </div>
      )}

      {/* DASHBOARD TAB: ALL PATIENTS AT A GLANCE */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">All Connected Patients</h3>
            <p className="text-xs text-slate-500">
              Select a patient card to examine their daily schedule and perform authorized interventions
            </p>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allPatients.map((patient) => {
              const patientMeds = schedules.filter((s) => s.patientId === patient.id);
              const upcomingMeds = patientMeds.filter((s) => s.status === 'pending');
              const missedMeds = patientMeds.filter((s) => s.status === 'missed');
              const refillMeds = patientMeds.filter((s) => s.daysRemaining <= 5);
              const isSelected = patient.id === activePatientIdForCaretaker;

              return (
                <div
                  key={patient.id}
                  onClick={() => setActivePatientIdForCaretaker(patient.id)}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer relative shadow-2xs hover:border-slate-400 ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={patient.avatarUrl}
                      alt={patient.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                      <p className="text-xs text-slate-500">
                        {patient.age} yrs · {patient.medicalConditions.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Summary Items on Card */}
                  <div className="space-y-2.5 text-xs">
                    {/* Upcoming */}
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Today's Upcoming
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {upcomingMeds.length} doses
                      </span>
                    </div>

                    {/* Missed dose alert */}
                    <div
                      className={`p-2.5 rounded-lg flex items-center justify-between ${
                        missedMeds.length > 0
                          ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${missedMeds.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                        Missed Alerts
                      </span>
                      <span className="font-mono">{missedMeds.length}</span>
                    </div>

                    {/* Refill reminder */}
                    <div
                      className={`p-2.5 rounded-lg flex items-center justify-between ${
                        refillMeds.length > 0
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${refillMeds.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                        Refill Needed
                      </span>
                      <span className="font-mono">{refillMeds.length} meds</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-semibold">
                    <span>{isSelected ? 'Currently Viewing Schedule' : 'Click to View Schedule'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE PATIENT DETAIL SECTION */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Medication Schedule for {selectedPatient.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    Strict Separation Enforced
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doctor: {selectedPatient.primaryDoctor} · Address: {selectedPatient.address}
                </p>
              </div>

              {/* Permissions Indicator */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Your Granted Permissions:</span>
                {permissions.viewMedicationSchedules && <span>Schedules ·</span>}
                {permissions.receiveMedicationReminders && <span>Reminders ·</span>}
                {permissions.manageMedicineOrders && <span className="text-teal-700 font-semibold">Refill Orders ·</span>}
                {permissions.viewDeliveryStatus && <span>GPS Delivery</span>}
              </div>
            </div>

            {/* If Permission granted to view schedules */}
            {permissions.viewMedicationSchedules ? (
              <div className="divide-y divide-slate-100">
                {patientSchedules.map((med) => (
                  <div key={med.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{med.medicineName}</span>
                        <span className="text-xs text-slate-500">({med.dosage})</span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded font-medium text-slate-700">
                          {med.slot} · {med.timing}
                        </span>
                        {med.critical && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Critical Dose
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{med.instructions}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Stock Remaining: <strong className="text-slate-700 font-mono">{med.stockRemaining} units</strong> ({med.daysRemaining} days left)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {med.status === 'taken' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Taken ({med.takenAt})
                        </span>
                      ) : med.status === 'missed' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Missed Dose
                          </span>
                          <button
                            onClick={() => markDose(med.id, 'taken')}
                            className="px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            Mark Retaken
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markDose(med.id, 'taken')}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Mark Taken for Patient
                          </button>
                          <button
                            onClick={() => markDose(med.id, 'missed')}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Mark Missed
                          </button>
                        </div>
                      )}

                      {/* Authorized Reorder button */}
                      {permissions.manageMedicineOrders && med.daysRemaining <= 5 && (
                        <button
                          onClick={() => handleCaretakerReorder(med.medicineName, med.dosage)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Order Refill</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                You do not have permission to view medication schedules for {selectedPatient.name}. Please contact the patient to adjust access settings.
              </div>
            )}

            {/* Live Delivery Tracker for this patient if active */}
            {permissions.viewDeliveryStatus && patientActiveAssignment && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-600" />
                    <span>Real-Time Delivery Tracker for {selectedPatient.name}</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    OTP: <strong className="text-slate-900">{patientActiveAssignment.deliveryOtp}</strong>
                  </span>
                </div>
                <GpsMapTracker assignment={patientActiveAssignment} viewerRole="caretaker" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY PATIENTS TAB */}
      {currentTab === 'patients' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Connected Patient Directory</h3>
            <span className="text-xs text-slate-500">{allPatients.length} active relationships</span>
          </div>
          <div className="divide-y divide-slate-100">
            {allPatients.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500">
                      {p.gender}, {p.age} yrs · {p.phone}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{p.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActivePatientIdForCaretaker(p.id);
                    onTabChange('dashboard');
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                >
                  Manage Patient
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULES TAB */}
      {currentTab === 'schedules' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Complete Dosage Schedule for {selectedPatient.name}
            </h3>
            <span className="text-xs text-slate-500">Separated by patient profile</span>
          </div>

          <div className="divide-y divide-slate-100">
            {patientSchedules.map((med) => (
              <div key={med.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{med.medicineName}</div>
                  <div className="text-xs text-slate-500">
                    {med.slot} · {med.timing} · {med.dosage}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{med.instructions}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {med.stockRemaining} pills remaining
                  </span>
                  <div className="text-[11px] text-slate-400">{med.daysRemaining} days left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MISSED DOSES TAB */}
      {currentTab === 'missed' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Missed Reminders & Escalations</h3>
          {schedules.filter((s) => s.status === 'missed').length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No missed doses recorded across any connected patients. Great adherence!
            </div>
          ) : (
            <div className="space-y-3">
              {schedules
                .filter((s) => s.status === 'missed')
                .map((med) => {
                  const pat = allPatients.find((p) => p.id === med.patientId);
                  return (
                    <div
                      key={med.id}
                      className="p-4 border border-rose-200 bg-rose-50/50 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-800">
                            Patient: {pat?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-slate-500">· Scheduled for {med.timing}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{med.medicineName}</div>
                        <p className="text-xs text-slate-600">{med.instructions}</p>
                      </div>
                      <button
                        onClick={() => markDose(med.id, 'taken')}
                        className="px-3 py-1.5 text-xs font-bold bg-white border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                      >
                        Acknowledge & Mark Taken
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* REFILL ALERTS TAB */}
      {currentTab === 'refills' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Prescription Refill Watchlist</h3>
            <span className="text-xs text-slate-500">Medicines with &lt;= 5 days stock</span>
          </div>

          <div className="divide-y divide-slate-100">
            {schedules
              .filter((s) => s.daysRemaining <= 5)
              .map((med) => {
                const pat = allPatients.find((p) => p.id === med.patientId);
                return (
                  <div key={med.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-amber-800">Patient: {pat?.name}</div>
                      <div className="text-sm font-bold text-slate-900">{med.medicineName}</div>
                      <div className="text-xs text-slate-500">
                        {med.stockRemaining} units left · Approx {med.daysRemaining} days remaining
                      </div>
                    </div>
                    {permissions.manageMedicineOrders ? (
                      <button
                        onClick={() => handleCaretakerReorder(med.medicineName, med.dosage)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        Order Refill for {pat?.name}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Order permission not granted</span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {currentTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Caretaker Account Details</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Name</span>
              <span className="font-semibold text-slate-900">Nurse Priya Nair, RN</span>
            </div>
            <div>
              <span className="text-slate-400 block">Role</span>
              <span className="font-semibold text-slate-900">Licensed Personal Care Nurse</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-900">+91 98451 22334</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assigned Patients</span>
              <span className="font-semibold text-slate-900">
                Rahul Sharma (Diabetes & Asthma), Priya Sen (Hypertension)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
