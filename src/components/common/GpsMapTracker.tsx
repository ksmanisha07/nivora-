import React, { useState } from 'react';
import { DeliveryAssignment } from '../../types';
import { Navigation, MapPin, Store, ShieldCheck, PhoneCall, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import PrivacyCallModal from './PrivacyCallModal';

interface GpsMapTrackerProps {
  assignment: DeliveryAssignment;
  viewerRole: 'patient' | 'caretaker' | 'pharmacy' | 'delivery_partner';
}

export default function GpsMapTracker({ assignment, viewerRole }: GpsMapTrackerProps) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatNotice, setShowChatNotice] = useState(false);

  const {
    pickupCoordinates,
    deliveryCoordinates,
    currentCoordinates,
    assignmentStatus,
    estimatedMinutes,
    distanceKm,
    deliveryOtp,
    pickupAddress,
    deliveryAddress,
  } = assignment;

  // Status step index
  const statusSteps = ['Accepted', 'Arriving at Pharmacy', 'Picked Up', 'Out for Delivery', 'Delivered'];
  const currentStepIdx = statusSteps.indexOf(assignmentStatus);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Map Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Navigation className="w-4 h-4 text-emerald-700" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">Live GPS Delivery Tracking</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {assignmentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Trip #{assignment.id} · Order #{assignment.orderId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Estimated Arrival</div>
            <div className="text-sm font-mono font-bold text-slate-900 tabular-nums flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {assignmentStatus === 'Delivered' ? 'Delivered' : `${estimatedMinutes} mins (${distanceKm} km)`}
            </div>
          </div>
          <button
            onClick={() => setShowCallModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            title="Encrypted virtual proxy call without sharing personal phone number"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
            <span>Masked Call</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulated Vector Map */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-900 overflow-hidden select-none">
        {/* Stylized Dark GPS Grid & Roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="100" height="100" fill="#0f172a" />
          <rect width="100" height="100" fill="url(#grid)" />

          {/* City Arterial Road Networks */}
          <path d="M -10 20 L 110 40" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M -10 80 L 110 70" stroke="#1e293b" strokeWidth="3" />
          <path d="M 20 -10 L 40 110" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M 70 -10 L 80 110" stroke="#1e293b" strokeWidth="3" />
          <path d="M 0 50 Q 50 45 100 55" stroke="#334155" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* Actual Route Path (from pickup to drop-off) */}
          <path
            d={`M ${pickupCoordinates.x} ${pickupCoordinates.y} Q 40 60, ${deliveryCoordinates.x} ${deliveryCoordinates.y}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Trail of where driver moved */}
          <path
            d={`M ${pickupCoordinates.x} ${pickupCoordinates.y} Q 40 60, ${currentCoordinates.x} ${currentCoordinates.y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Pickup Point (Pharmacy) */}
          <circle cx={pickupCoordinates.x} cy={pickupCoordinates.y} r="3" fill="#10b981" />
          <circle cx={pickupCoordinates.x} cy={pickupCoordinates.y} r="5" fill="#10b981" opacity="0.3" />

          {/* Drop-off Point (Patient) */}
          <circle cx={deliveryCoordinates.x} cy={deliveryCoordinates.y} r="3.2" fill="#ef4444" />
          <circle cx={deliveryCoordinates.x} cy={deliveryCoordinates.y} r="7" fill="#ef4444" opacity="0.25" />

          {/* Moving Driver Marker */}
          <g transform={`translate(${currentCoordinates.x}, ${currentCoordinates.y})`}>
            <circle cx="0" cy="0" r="4.5" fill="#38bdf8" />
            <circle cx="0" cy="0" r="8" fill="#38bdf8" opacity="0.4" />
          </g>
        </svg>

        {/* Map Overlays & Badges */}
        {/* Pharmacy Marker Tag */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-500"
          style={{ left: `${pickupCoordinates.x}%`, top: `${pickupCoordinates.y - 4}%` }}
        >
          <div className="bg-slate-900/90 text-white text-[11px] font-medium px-2 py-1 rounded shadow-md border border-emerald-500/40 flex items-center gap-1.5 whitespace-nowrap">
            <Store className="w-3 h-3 text-emerald-400" />
            <span>Apollo MedZone</span>
          </div>
        </div>

        {/* Patient Dropoff Marker Tag */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-500"
          style={{ left: `${deliveryCoordinates.x}%`, top: `${deliveryCoordinates.y - 4}%` }}
        >
          <div className="bg-slate-900/90 text-white text-[11px] font-medium px-2 py-1 rounded shadow-md border border-rose-500/40 flex items-center gap-1.5 whitespace-nowrap">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Rahul S. (Indiranagar)</span>
          </div>
        </div>

        {/* Live Delivery Partner Icon Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear pointer-events-none"
          style={{ left: `${currentCoordinates.x}%`, top: `${currentCoordinates.y}%` }}
        >
          <div className="relative group">
            <div className="w-7 h-7 rounded-full bg-cyan-500 text-white shadow-lg flex items-center justify-center border-2 border-white ring-4 ring-cyan-500/30">
              <Navigation className="w-4 h-4 transform rotate-45" />
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-100 text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
              Arun Kumar · E-Scooter
            </div>
          </div>
        </div>

        {/* Map Watermark & Real-Time Coordinates HUD */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-slate-300 text-[11px] font-mono px-2.5 py-1.5 rounded border border-slate-700/60 shadow flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>GPS Fix: 12.9716° N, 77.5946° E</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">Indiranagar Sector 4</span>
        </div>

        {/* Privacy Guard Notice */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-slate-300 text-[11px] px-2.5 py-1.5 rounded border border-slate-700/60 shadow flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NIVORA Privacy Shield Active</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-5 py-4 border-b border-slate-100 bg-white">
        <div className="grid grid-cols-5 gap-2 text-center">
          {statusSteps.map((stepName, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={stepName} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent ? 'ring-2 ring-emerald-500/30 ring-offset-1' : ''}`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[11px] font-medium leading-tight ${
                    isCurrent
                      ? 'text-emerald-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trip Addresses & Security Details */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pickup Info */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pharmacy Pickup Point</span>
          </div>
          <div className="font-semibold text-slate-900">{assignment.pharmacyName}</div>
          <div className="text-slate-600 mt-0.5">{pickupAddress}</div>
          {assignment.pickedUpAt && (
            <div className="text-emerald-700 mt-1 font-mono text-[11px]">Picked up at: {assignment.pickedUpAt}</div>
          )}
        </div>

        {/* Drop-off & Security OTP */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Patient Drop-off Address</span>
          </div>
          <div className="font-semibold text-slate-900">{assignment.patientName}</div>
          <div className="text-slate-600 mt-0.5">{deliveryAddress}</div>

          {/* OTP Box (Shown to Patient & Caretaker; entered by Delivery Partner) */}
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Proof-of-Delivery OTP:</span>
              <span className="text-[10px] text-slate-400">Share with driver upon arrival</span>
            </div>
            <div className="px-3 py-1 bg-amber-50 border border-amber-300 rounded font-mono text-base font-extrabold text-amber-900 tracking-wider tabular-nums">
              {deliveryOtp}
            </div>
          </div>
        </div>
      </div>

      {/* Package Safe Handling Summary */}
      <div className="px-5 py-2.5 bg-slate-100/60 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignment.packageSummary}</span>
        </div>
        <span className="text-[11px] text-slate-400">Prescription-sealed · Driver blind to medical diagnosis</span>
      </div>

      {/* Masked Privacy Modal */}
      {showCallModal && (
        <PrivacyCallModal
          recipientName={viewerRole === 'delivery_partner' ? assignment.patientName : 'Arun Kumar (Delivery Partner)'}
          recipientRole={viewerRole === 'delivery_partner' ? 'Patient' : 'Delivery Partner'}
          maskedNumber="+91 80 4719 0042 (NIVORA IVR)"
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
}
