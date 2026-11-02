import React, { useState } from 'react';
import { useNivora } from '../../context/NivoraContext';
import {
  Bike,
  Power,
  ShieldCheck,
  CheckCircle,
  Clock,
  MapPin,
  Store,
  DollarSign,
  AlertTriangle,
  KeyRound,
  FileCheck2,
  PhoneCall,
  UserCheck,
  TrendingUp,
  XCircle,
  EyeOff,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import GpsMapTracker from '../common/GpsMapTracker';
import DriverRegistrationModal from './DriverRegistrationModal';
import PrivacyCallModal from '../common/PrivacyCallModal';

interface DeliveryPartnerDashboardProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function DeliveryPartnerDashboard({
  currentTab,
  onTabChange,
}: DeliveryPartnerDashboardProps) {
  const {
    deliveryPartner,
    toggleDeliveryPartnerOnline,
    updatePartnerProfile,
    assignments,
    acceptDelivery,
    rejectDelivery,
    advanceDeliveryStatus,
    verifyAndCompleteDeliveryOtp,
    reportFailedDelivery,
  } = useNivora();

  const [showKycModal, setShowKycModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [failReasonInput, setFailReasonInput] = useState('');
  const [showFailDialog, setShowFailDialog] = useState(false);

  // Filter assignments
  const availableAssignments = assignments.filter((a) => a.assignmentStatus === 'Available');
  const activeAssignment = assignments.find(
    (a) =>
      a.deliveryPartnerId === deliveryPartner.id &&
      ['Accepted', 'Arriving at Pharmacy', 'Picked Up', 'Out for Delivery'].includes(a.assignmentStatus)
  );
  const completedAssignments = assignments.filter((a) => a.assignmentStatus === 'Delivered');
  const failedAssignments = assignments.filter((a) => a.assignmentStatus === 'Failed');

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setOtpError('');
    setOtpSuccess('');

    const res = verifyAndCompleteDeliveryOtp(activeAssignment.id, otpInput);
    if (res.success) {
      setOtpSuccess(res.message);
      setOtpInput('');
    } else {
      setOtpError(res.message);
    }
  };

  const handleFailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !failReasonInput.trim()) return;
    reportFailedDelivery(activeAssignment.id, failReasonInput.trim());
    setShowFailDialog(false);
    setFailReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Earnings Hero Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={deliveryPartner.avatarUrl}
                alt={deliveryPartner.fullName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  deliveryPartner.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{deliveryPartner.fullName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {deliveryPartner.verificationStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{deliveryPartner.vehicleType}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{deliveryPartner.vehicleNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{deliveryPartner.serviceArea}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Daily stats */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
              <span className="text-[11px] text-slate-500 block">Today's Earnings</span>
              <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                ₹{deliveryPartner.todayEarnings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
              <span className="text-[11px] text-slate-500 block">Trips Completed</span>
              <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                {deliveryPartner.totalDeliveries}
              </span>
            </div>

            {/* Online / Offline Toggle */}
            <button
              onClick={toggleDeliveryPartnerOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                deliveryPartner.isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{deliveryPartner.isOnline ? 'Online (Accepting Orders)' : 'Go Online'}</span>
            </button>

            <button
              onClick={() => setShowKycModal(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              KYC & Vehicle Info
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Available Requests</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {availableAssignments.length}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 inline-block">Ready to claim</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Active Deliveries</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {activeAssignment ? 1 : 0}
              </div>
              <span className="text-[11px] text-teal-600 mt-1 inline-block">
                {activeAssignment ? activeAssignment.assignmentStatus : 'None in progress'}
              </span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Completed Today</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {completedAssignments.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">All OTP verified</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Customer Rating</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {deliveryPartner.rating} ★
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 inline-block">Top Tier Partner</span>
            </div>
          </div>

          {/* ACTIVE DELIVERY PANEL (if in progress) */}
          {activeAssignment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h3 className="text-sm font-bold text-slate-900">Current Assigned Trip (#{activeAssignment.id})</h3>
                </div>
                <div className="text-xs text-slate-500">Payout: ₹{activeAssignment.payoutAmount}</div>
              </div>

              {/* Live GPS Map */}
              <GpsMapTracker assignment={activeAssignment} viewerRole="delivery_partner" />

              {/* Action Stepper for Delivery Partner */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Partner Delivery Action Workflow
                  </h4>
                  <span className="text-xs text-slate-500">
                    Step: <strong className="text-emerald-700">{activeAssignment.assignmentStatus}</strong>
                  </span>
                </div>

                {/* Privacy Warning for Delivery Partner */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                  <EyeOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Privacy Guard:</span> For HIPAA & Indian Digital Health Data compliance,
                    patient medical diagnosis and prescription details are strictly shielded. You only see delivery
                    addresses, packaged item count, and contact via masked proxy.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {activeAssignment.assignmentStatus === 'Accepted' && (
                    <button
                      onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Arriving at Pharmacy')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      1. Mark Arriving at Pharmacy
                    </button>
                  )}

                  {activeAssignment.assignmentStatus === 'Arriving at Pharmacy' && (
                    <button
                      onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Picked Up')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      2. Confirm Package Inspection & Picked Up
                    </button>
                  )}

                  {activeAssignment.assignmentStatus === 'Picked Up' && (
                    <button
                      onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Out for Delivery')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      3. Start Navigation (Out for Delivery)
                    </button>
                  )}

                  {activeAssignment.assignmentStatus === 'Out for Delivery' && (
                    <div className="w-full space-y-3 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-800">
                        Step 4: Complete Delivery with Recipient OTP
                      </div>
                      <form onSubmit={handleOtpSubmit} className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 4-Digit OTP"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            className="px-3 py-2 text-sm font-mono font-bold tracking-widest text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-48 text-center"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Verify OTP & Complete Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFailDialog(true)}
                          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                        >
                          Report Delivery Issue / Failure
                        </button>
                      </form>

                      {otpError && (
                        <div className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{otpError}</span>
                        </div>
                      )}
                      {otpSuccess && (
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{otpSuccess}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* AVAILABLE DELIVERIES LIST */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Available Delivery Requests Nearby</h3>
                  <p className="text-xs text-slate-500">Pickups from verified pharmacies in your service area</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {availableAssignments.length} available
                </span>
              </div>

              {availableAssignments.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No pending delivery orders currently in your service zone. New requests will appear here as pharmacies
                  prepare packages.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-slate-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Order #{assignment.orderId}</span>
                            <span className="text-xs text-slate-400">({assignment.id})</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{assignment.packageSummary}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-mono font-bold text-emerald-600 tabular-nums">
                            ₹{assignment.payoutAmount}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {assignment.distanceKm} km · Est. {assignment.estimatedMinutes} mins
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Pickup:</strong> {assignment.pharmacyName}
                            <div className="text-slate-500 text-[11px]">{assignment.pickupAddress}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Drop-off:</strong> {assignment.patientName}
                            <div className="text-slate-500 text-[11px]">{assignment.deliveryAddress}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => rejectDelivery(assignment.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => acceptDelivery(assignment.id)}
                          disabled={!deliveryPartner.isOnline}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs ${
                            deliveryPartner.isOnline
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {deliveryPartner.isOnline ? 'Accept Delivery Order' : 'Go Online to Accept'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AVAILABLE DELIVERIES TAB */}
      {currentTab === 'available' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Available Delivery Queue</h3>
              <p className="text-xs text-slate-500">Nearby requests filtered by your service zone</p>
            </div>
            <button
              onClick={toggleDeliveryPartnerOnline}
              className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                deliveryPartner.isOnline ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'text-slate-500'
              }`}
            >
              Status: {deliveryPartner.isOnline ? 'Online' : 'Offline'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {availableAssignments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No open requests at this moment.</div>
            ) : (
              availableAssignments.map((a) => (
                <div key={a.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Order #{a.orderId}</span>
                      <span className="text-xs text-emerald-700 font-semibold font-mono">₹{a.payoutAmount}</span>
                      <span className="text-xs text-slate-400">· {a.distanceKm} km</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Pickup:</strong> {a.pickupAddress}
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Drop-off:</strong> {a.deliveryAddress}
                    </div>
                  </div>
                  <button
                    onClick={() => acceptDelivery(a.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 cursor-pointer"
                  >
                    Accept Trip (₹{a.payoutAmount})
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ACTIVE DELIVERY TAB */}
      {currentTab === 'active' && (
        <div className="space-y-4">
          {activeAssignment ? (
            <>
              <GpsMapTracker assignment={activeAssignment} viewerRole="delivery_partner" />
              {/* Step controller */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Trip Actions</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Arriving at Pharmacy')}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Arriving at Pharmacy
                  </button>
                  <button
                    onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Picked Up')}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Mark Picked Up
                  </button>
                  <button
                    onClick={() => advanceDeliveryStatus(activeAssignment.id, 'Out for Delivery')}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Out for Delivery
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter recipient OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    onClick={handleOtpSubmit}
                    className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Complete with OTP
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
              No active trip right now. Accept an order from Available Deliveries.
            </div>
          )}
        </div>
      )}

      {/* DELIVERY HISTORY TAB */}
      {currentTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Completed Deliveries Log</h3>
            <span className="text-xs text-slate-500">{completedAssignments.length} deliveries recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Trip ID</th>
                  <th className="py-2.5 px-3 font-semibold">Order</th>
                  <th className="py-2.5 px-3 font-semibold">Recipient</th>
                  <th className="py-2.5 px-3 font-semibold">Drop-off Address</th>
                  <th className="py-2.5 px-3 font-semibold">Proof of Delivery</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {completedAssignments.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">{c.id}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.orderId}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800">{c.patientName}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 max-w-xs truncate">{c.deliveryAddress}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        OTP Verified ({c.deliveryOtp})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 tabular-nums">
                      +₹{c.payoutAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {currentTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Today's Payout Balance</span>
              <div className="text-3xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                ₹{deliveryPartner.todayEarnings}
              </div>
              <span className="text-xs text-emerald-600 mt-2 block font-medium">Auto-transfers nightly to HDFC</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Weekly Cumulative</span>
              <div className="text-3xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                ₹4,820
              </div>
              <span className="text-xs text-slate-500 mt-2 block">58 deliveries this week</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Linked Bank Account</span>
              <div className="text-sm font-mono font-semibold text-slate-800 mt-1">
                {deliveryPartner.bankDetails.accountHolder}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {deliveryPartner.bankDetails.accountNumber} ({deliveryPartner.bankDetails.ifscCode})
              </div>
              <span className="text-[11px] text-teal-700 mt-1 block">UPI: {deliveryPartner.bankDetails.upiId}</span>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE / KYC TAB */}
      {currentTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Driver Credentials & Vehicle Profile</h3>
            <button
              onClick={() => setShowKycModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Full Legal Name</span>
              <span className="font-semibold text-slate-900">{deliveryPartner.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-900">{deliveryPartner.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Vehicle Specification</span>
              <span className="font-semibold text-slate-900">
                {deliveryPartner.vehicleType} ({deliveryPartner.vehicleNumber})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Driving License</span>
              <span className="font-mono font-semibold text-slate-900">{deliveryPartner.drivingLicenseNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Govt ID Verification</span>
              <span className="font-semibold text-slate-900">
                {deliveryPartner.governmentIdType}: {deliveryPartner.governmentIdNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Service Area</span>
              <span className="font-semibold text-slate-900">{deliveryPartner.serviceArea}</span>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {showKycModal && (
        <DriverRegistrationModal
          partner={deliveryPartner}
          onClose={() => setShowKycModal(false)}
          onSave={(data) => updatePartnerProfile(data)}
        />
      )}

      {/* Failed Delivery Dialog */}
      {showFailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Delivery Failure</span>
            </div>
            <p className="text-xs text-slate-600">
              Select the primary cause of delivery failure. Both the pharmacy and patient will be alerted.
            </p>
            <form onSubmit={handleFailSubmit} className="space-y-3">
              <select
                value={failReasonInput}
                onChange={(e) => setFailReasonInput(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Select reason...</option>
                <option value="Customer unavailable at address after 3 phone attempts">
                  Customer unavailable at address
                </option>
                <option value="Wrong delivery address or gated entry denied">Wrong address / gated entry denied</option>
                <option value="Customer refused package / incorrect OTP given">Incorrect OTP / Customer refused</option>
                <option value="Severe weather / waterlogging roadblock">Roadblock or adverse conditions</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFailDialog(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg cursor-pointer"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
