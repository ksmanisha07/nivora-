import React, { useState } from 'react';
import { useNivora } from '../../context/NivoraContext';
import {
  Store,
  FileCheck2,
  Package,
  Bike,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search,
} from 'lucide-react';
import GpsMapTracker from '../common/GpsMapTracker';

interface PharmacyDashboardProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function PharmacyDashboard({
  currentTab,
  onTabChange,
}: PharmacyDashboardProps) {
  const {
    orders,
    assignments,
    pharmacyVerifyOrder,
    pharmacyPrepareOrder,
    pharmacyRequestDelivery,
  } = useNivora();

  const [searchQuery, setSearchQuery] = useState('');

  const pendingVerificationOrders = orders.filter(
    (o) => o.prescriptionStatus === 'Pending Review' || o.pharmacyStatus === 'Pending Verification'
  );
  const preparingOrders = orders.filter((o) => o.pharmacyStatus === 'Preparing');
  const readyOrders = orders.filter((o) => o.pharmacyStatus === 'Ready for Pickup');
  const activeDeliveries = assignments.filter((a) => a.assignmentStatus !== 'Delivered');

  const pharmacyInventory = [
    { name: 'Metformin SR 500mg', batch: 'MET-2026-08', stock: 450, unit: 'strips', status: 'In Stock' },
    { name: 'Budecort 200 Inhaler', batch: 'BUD-2026-11', stock: 85, unit: 'canisters', status: 'In Stock' },
    { name: 'Montair LC', batch: 'MON-2026-04', stock: 120, unit: 'strips', status: 'In Stock' },
    { name: 'Accu-Chek Active Strips', batch: 'ACC-2026-09', stock: 32, unit: 'boxes', status: 'Low Stock' },
    { name: 'Telmisartan 40mg', batch: 'TEL-2026-12', stock: 380, unit: 'strips', status: 'In Stock' },
    { name: 'Thyronorm 50mcg', batch: 'THY-2026-07', stock: 210, unit: 'bottles', status: 'In Stock' },
  ];

  return (
    <div className="space-y-6">
      {/* Pharmacy Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/pharmacist_dr_kavita_avatar_1793633754400.jpg"
              alt="Pharmacist Dr. Kavita"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Apollo MedZone · Koramangala Hub</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Licensed Pharmacy #KA-BLR-08412
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chief Pharmacist: Dr. Kavita Rao, B.Pharm, M.S. · Connected to NIVORA Delivery Network
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-center">
              <span className="text-slate-400 block text-[10px]">Pending Verification</span>
              <span className="font-mono font-bold text-slate-900">{pendingVerificationOrders.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-center">
              <span className="text-slate-400 block text-[10px]">Active En Route</span>
              <span className="font-mono font-bold text-indigo-600">{activeDeliveries.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Pending Prescriptions</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
                {pendingVerificationOrders.length}
              </div>
              <span className="text-[11px] text-amber-600 mt-1 inline-block">Requires RPh signoff</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Preparing Batch</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{preparingOrders.length}</div>
              <span className="text-[11px] text-indigo-600 mt-1 inline-block">In packing area</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Ready for Dispatch</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{readyOrders.length}</div>
              <span className="text-[11px] text-emerald-600 mt-1 inline-block">Awaiting partner</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Total Orders Handled</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{orders.length}</div>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">100% Tamper Sealed</span>
            </div>
          </div>

          {/* ORDERS DISPATCH QUEUE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Order Verification & Delivery Dispatch Workflow</h3>
                <p className="text-xs text-slate-500">
                  Verify prescription &rarr; Prepare medical pouch &rarr; Request delivery partner
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const assignedTrip = assignments.find((a) => a.orderId === order.id);

                return (
                  <div key={order.id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">Order #{order.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            Patient: {order.patientName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">· {order.orderedAt}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Items: {order.items.map((i) => `${i.medicineName} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-slate-900">₹{order.totalAmount}</div>
                        <div className="text-xs text-slate-500">
                          Prescription: <strong className="text-slate-800">{order.prescriptionStatus}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action Step Bar based on order workflow */}
                    <div className="p-3 bg-slate-50 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-semibold text-slate-900">{order.pharmacyStatus}</span>
                        {assignedTrip && (
                          <span className="text-emerald-700 font-semibold">
                            (Delivery: {assignedTrip.assignmentStatus})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.prescriptionStatus === 'Pending Review' && (
                          <button
                            onClick={() => pharmacyVerifyOrder(order.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>1. Verify Prescription & Approve</span>
                          </button>
                        )}

                        {order.pharmacyStatus === 'Preparing' && (
                          <button
                            onClick={() => pharmacyPrepareOrder(order.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>2. Pack Pouch & Mark Ready</span>
                          </button>
                        )}

                        {order.pharmacyStatus === 'Ready for Pickup' && !assignedTrip && (
                          <button
                            onClick={() => pharmacyRequestDelivery(order.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>3. Find Delivery Partner</span>
                          </button>
                        )}

                        {assignedTrip && (
                          <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                            Trip #{assignedTrip.id} · Partner: Arun Kumar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {currentTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">All Pharmacy Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Order ID</th>
                  <th className="py-2.5 px-3 font-semibold">Patient</th>
                  <th className="py-2.5 px-3 font-semibold">Items</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Rx Status</th>
                  <th className="py-2.5 px-3 font-semibold">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{o.patientName}</td>
                    <td className="py-3 px-3 text-slate-600">{o.items.length} prescribed lines</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{o.totalAmount}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {o.prescriptionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{o.deliveryStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRESCRIPTION VERIFICATION TAB */}
      {currentTab === 'prescriptions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Prescription Verification Queue</h3>
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Rx Submission · Order #{o.id}</span>
                  <span className="text-xs px-2 py-0.5 bg-white border rounded font-mono text-slate-700">
                    Patient: {o.patientName}
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="text-slate-500 font-semibold">Prescribed Medications:</div>
                  {o.items.map((i) => (
                    <div key={i.medicineName} className="font-mono text-slate-800">
                      • {i.medicineName} - Qty {i.quantity}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => pharmacyVerifyOrder(o.id)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    Pharmacist Signoff & Authorize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {currentTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Pharmaceutical Drug Stock Levels</h3>
            <span className="text-xs text-slate-500">Live warehouse audit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="py-2 px-3 font-semibold font-sans">Medicine Name</th>
                  <th className="py-2 px-3 font-semibold">Batch No.</th>
                  <th className="py-2 px-3 font-semibold">Available Units</th>
                  <th className="py-2 px-3 font-semibold font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacyInventory.map((item) => (
                  <tr key={item.name}>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.batch}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          item.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELIVERY ASSIGNMENT TAB */}
      {currentTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Delivery Partner Assignments</h3>
            <div className="space-y-4">
              {assignments.map((a) => (
                <div key={a.id} className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Trip #{a.id}</span>
                      <span className="text-slate-500"> · Order #{a.orderId} · {a.patientName}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                      {a.assignmentStatus}
                    </span>
                  </div>
                  <GpsMapTracker assignment={a} viewerRole="pharmacy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORTS / PROFILE TAB */}
      {(currentTab === 'reports' || currentTab === 'profile') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-xl space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Apollo MedZone Koramangala</h3>
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block">Pharmacist License</span>
              <span className="font-semibold text-slate-900">KA-BLR-08412 (Valid thru 2029)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Hub Location</span>
              <span className="font-semibold text-slate-900">Shop 14, 80ft Road, 4th Block Koramangala, Bengaluru</span>
            </div>
            <div>
              <span className="text-slate-400 block">Cold-Chain Storage</span>
              <span className="font-semibold text-emerald-700">Active & Monitored (2°C - 8°C Verified)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
