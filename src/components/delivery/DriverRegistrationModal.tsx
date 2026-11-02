import React, { useState } from 'react';
import { DeliveryPartner } from '../../types';
import { X, ShieldCheck, CheckCircle2, Upload, FileText, Bike, CreditCard } from 'lucide-react';

interface DriverRegistrationModalProps {
  partner: DeliveryPartner;
  onClose: () => void;
  onSave: (updated: Partial<DeliveryPartner>) => void;
}

export default function DriverRegistrationModal({
  partner,
  onClose,
  onSave,
}: DriverRegistrationModalProps) {
  const [fullName, setFullName] = useState(partner.fullName);
  const [phone, setPhone] = useState(partner.phone);
  const [email, setEmail] = useState(partner.email);
  const [governmentIdType, setGovernmentIdType] = useState(partner.governmentIdType);
  const [governmentIdNumber, setGovernmentIdNumber] = useState(partner.governmentIdNumber);
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(partner.drivingLicenseNumber);
  const [vehicleType, setVehicleType] = useState(partner.vehicleType);
  const [vehicleNumber, setVehicleNumber] = useState(partner.vehicleNumber);
  const [serviceArea, setServiceArea] = useState(partner.serviceArea);
  const [verificationStatus, setVerificationStatus] = useState(partner.verificationStatus);
  const [accountHolder, setAccountHolder] = useState(partner.bankDetails.accountHolder);
  const [accountNumber, setAccountNumber] = useState(partner.bankDetails.accountNumber);
  const [ifscCode, setIfscCode] = useState(partner.bankDetails.ifscCode);
  const [upiId, setUpiId] = useState(partner.bankDetails.upiId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      phone,
      email,
      governmentIdType,
      governmentIdNumber,
      drivingLicenseNumber,
      vehicleType,
      vehicleNumber,
      serviceArea,
      verificationStatus,
      bankDetails: {
        accountHolder,
        accountNumber,
        ifscCode,
        upiId,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delivery Partner KYC & Profile</h3>
              <p className="text-xs text-slate-500">
                Official registration credentials & vehicle onboarding for medicine deliveries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Verification Status Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-950">Verification Status: {verificationStatus}</span>
                <p className="text-[11px] text-emerald-700">
                  {verificationStatus === 'Verified'
                    ? 'Authorized to accept prescription & emergency medicine deliveries'
                    : 'Pending background check & driving license inspection'}
                </p>
              </div>
            </div>

            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as any)}
              className="text-xs font-bold border border-emerald-300 bg-white rounded-lg px-2.5 py-1 text-slate-800"
            >
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Personal Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ID & Driving License */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Government Identity & Driving License</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Govt ID Type</label>
                <select
                  value={governmentIdType}
                  onChange={(e) => setGovernmentIdType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Number</label>
                <input
                  type="text"
                  required
                  value={governmentIdNumber}
                  onChange={(e) => setGovernmentIdNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driving License No.</label>
                <input
                  type="text"
                  required
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle & Service Area */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-slate-500" />
              <span>Vehicle Specifications & Delivery Zone</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Electric Scooter">Electric Scooter (Eco-Delivery)</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Plate No.</label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Area Zone</label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Indiranagar, Domlur & Koramangala"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details for Earnings */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Bank & UPI Payout Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID for Instant Payouts</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="partner@okhdfcbank"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Verification & Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
