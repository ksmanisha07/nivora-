import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  DeliveryPartner,
  DeliveryAssignment,
  CaretakerConnection,
  MedicineScheduleItem,
  PatientProfile,
  MedicineOrder,
  NivoraNotification,
  CaretakerPermissions,
  DeliveryStatus,
} from '../types';

interface NivoraContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  // Patient info
  currentPatient: PatientProfile;
  allPatients: PatientProfile[];
  activePatientIdForCaretaker: string;
  setActivePatientIdForCaretaker: (id: string) => void;
  // Caretaker connections
  caretakerConnections: CaretakerConnection[];
  inviteCaretaker: (data: {
    name: string;
    phone: string;
    role: CaretakerConnection['caretakerRole'];
    permissions: CaretakerPermissions;
  }) => void;
  updateCaretakerPermissions: (connectionId: string, permissions: CaretakerPermissions) => void;
  removeCaretaker: (connectionId: string) => void;
  // Medicine schedule
  schedules: MedicineScheduleItem[];
  markDose: (medicineId: string, status: 'taken' | 'missed') => void;
  addMedicine: (medicine: Omit<MedicineScheduleItem, 'id' | 'status'>) => void;
  // Orders & Deliveries
  orders: MedicineOrder[];
  assignments: DeliveryAssignment[];
  activeAssignment: DeliveryAssignment | undefined;
  placeOrder: (items: MedicineOrder['items'], address: string) => void;
  pharmacyVerifyOrder: (orderId: string) => void;
  pharmacyPrepareOrder: (orderId: string) => void;
  pharmacyRequestDelivery: (orderId: string) => void;
  // Delivery partner actions
  deliveryPartner: DeliveryPartner;
  toggleDeliveryPartnerOnline: () => void;
  updatePartnerProfile: (data: Partial<DeliveryPartner>) => void;
  acceptDelivery: (assignmentId: string) => void;
  rejectDelivery: (assignmentId: string) => void;
  advanceDeliveryStatus: (assignmentId: string, nextStatus: DeliveryStatus) => void;
  verifyAndCompleteDeliveryOtp: (assignmentId: string, otp: string) => { success: boolean; message: string };
  reportFailedDelivery: (assignmentId: string, reason: string) => void;
  // Notifications
  notifications: NivoraNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  // Quick demo actions
  resetDemoData: () => void;
}

const NivoraContext = createContext<NivoraContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_PREFIX = 'nivora_health_v2_';

const initialPatients: PatientProfile[] = [
  {
    id: 'patient_rahul',
    name: 'Rahul Sharma',
    age: 29,
    gender: 'Male',
    phone: '+91 98765 43210',
    address: 'Flat 402, Skyline Heights, 12th Main, Indiranagar, Bengaluru',
    avatarUrl: '/src/assets/images/patient_rahul_avatar_1793633751330.jpg',
    medicalConditions: ['Type 2 Diabetes', 'Mild Asthma'],
    primaryDoctor: 'Dr. Arvind Swaminathan (Endocrinology)',
    monthlySavingsBalance: 4650,
    savingsGoal: 6000,
  },
  {
    id: 'patient_priya',
    name: 'Priya Sen',
    age: 54,
    gender: 'Female',
    phone: '+91 98112 34567',
    address: 'B-14 Palm Meadows, Whitefield, Bengaluru',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    medicalConditions: ['Hypertension', 'Thyroid Disorder'],
    primaryDoctor: 'Dr. Meera Nambiar (Cardiology)',
    monthlySavingsBalance: 3200,
    savingsGoal: 5000,
  },
  {
    id: 'patient_ramesh',
    name: 'Grandpa Ramesh Sharma',
    age: 78,
    gender: 'Male',
    phone: '+91 98450 11223',
    address: '104 Green Glen Layout, Bellandur, Bengaluru',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    medicalConditions: ['Post-CABG Cardiac Care', 'Osteoarthritis'],
    primaryDoctor: 'Dr. K. S. Reddy (Cardiothoracic)',
    monthlySavingsBalance: 5800,
    savingsGoal: 7000,
  },
];

const initialDeliveryPartner: DeliveryPartner = {
  id: 'dp_arun',
  userId: 'user_dp_arun_88',
  fullName: 'Arun Kumar',
  phone: '+91 97412 88990',
  email: 'arun.partner@nivora.delivery',
  avatarUrl: '/src/assets/images/delivery_partner_arun_avatar_1793633754006.jpg',
  verificationStatus: 'Verified',
  governmentIdType: 'Aadhaar Card',
  governmentIdNumber: 'XXXX-XXXX-4982',
  drivingLicenseNumber: 'KA-05-2022-0049182',
  vehicleType: 'Electric Scooter',
  vehicleNumber: 'KA-01-EQ-4492',
  serviceArea: 'Indiranagar, Koramangala & Domlur',
  isOnline: true,
  bankDetails: {
    accountHolder: 'Arun Kumar',
    accountNumber: '92102003884109',
    ifscCode: 'HDFC0001824',
    upiId: 'arunkumar@okhdfcbank',
  },
  totalDeliveries: 142,
  todayEarnings: 680,
  rating: 4.9,
  createdAt: '2026-03-15',
};

const defaultCaretakerPermissions: CaretakerPermissions = {
  viewMedicationSchedules: true,
  receiveMedicationReminders: true,
  viewMissedDoseAlerts: true,
  viewMedicineInventory: true,
  manageMedicineOrders: true,
  viewMedicalExpenseSummaries: true,
  viewDeliveryStatus: true,
};

const initialCaretakerConnections: CaretakerConnection[] = [
  {
    id: 'conn_priya_nurse',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    caretakerId: 'ct_nurse_priya',
    caretakerName: 'Nurse Priya Nair',
    caretakerPhone: '+91 98451 22334',
    caretakerRole: 'Personal Nurse',
    caretakerAvatar: '/src/assets/images/caretaker_priya_avatar_1793633752323.jpg',
    connectionStatus: 'active',
    inviteCode: 'NIV-CARE-8821',
    permissions: {
      ...defaultCaretakerPermissions,
      manageMedicineOrders: true,
      viewMedicalExpenseSummaries: true,
    },
    createdAt: '2026-08-10',
  },
  {
    id: 'conn_mother_sunita',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    caretakerId: 'ct_sunita_sharma',
    caretakerName: 'Sunita Sharma (Mother)',
    caretakerPhone: '+91 99002 33445',
    caretakerRole: 'Mother',
    caretakerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    connectionStatus: 'active',
    inviteCode: 'NIV-CARE-4412',
    permissions: {
      ...defaultCaretakerPermissions,
      manageMedicineOrders: true,
      viewMedicalExpenseSummaries: false,
    },
    createdAt: '2026-08-12',
  },
  {
    id: 'conn_brother_rohan',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    caretakerId: 'ct_rohan_sharma',
    caretakerName: 'Rohan Sharma (Brother)',
    caretakerPhone: '+91 98860 55667',
    caretakerRole: 'Brother',
    caretakerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    connectionStatus: 'active',
    inviteCode: 'NIV-CARE-9931',
    permissions: {
      viewMedicationSchedules: true,
      receiveMedicationReminders: true,
      viewMissedDoseAlerts: true,
      viewMedicineInventory: false,
      manageMedicineOrders: false,
      viewMedicalExpenseSummaries: false,
      viewDeliveryStatus: true,
    },
    createdAt: '2026-09-01',
  },
  {
    id: 'conn_priya_sen_nurse',
    patientId: 'patient_priya',
    patientName: 'Priya Sen',
    caretakerId: 'ct_nurse_priya',
    caretakerName: 'Nurse Priya Nair',
    caretakerPhone: '+91 98451 22334',
    caretakerRole: 'Personal Nurse',
    caretakerAvatar: '/src/assets/images/caretaker_priya_avatar_1793633752323.jpg',
    connectionStatus: 'active',
    inviteCode: 'NIV-CARE-1102',
    permissions: defaultCaretakerPermissions,
    createdAt: '2026-09-15',
  },
];

const initialSchedules: MedicineScheduleItem[] = [
  {
    id: 'med_rahul_1',
    patientId: 'patient_rahul',
    medicineName: 'Metformin SR 500mg',
    dosage: '1 Tablet',
    timing: '8:00 AM',
    slot: 'Morning',
    instructions: 'Take with or immediately after breakfast with water',
    status: 'pending',
    daysRemaining: 4,
    stockRemaining: 8,
    critical: true,
  },
  {
    id: 'med_rahul_2',
    patientId: 'patient_rahul',
    medicineName: 'Budecort 200 Inhaler',
    dosage: '2 Puffs',
    timing: '9:00 AM',
    slot: 'Morning',
    instructions: 'Rinse mouth thoroughly with water after inhalation',
    status: 'taken',
    takenAt: '9:05 AM',
    daysRemaining: 18,
    stockRemaining: 36,
    critical: false,
  },
  {
    id: 'med_rahul_3',
    patientId: 'patient_rahul',
    medicineName: 'Glimepiride 1mg',
    dosage: '1 Tablet',
    timing: '1:30 PM',
    slot: 'Afternoon',
    instructions: 'Take 15 minutes before lunch',
    status: 'pending',
    daysRemaining: 12,
    stockRemaining: 12,
    critical: true,
  },
  {
    id: 'med_rahul_4',
    patientId: 'patient_rahul',
    medicineName: 'Montair LC',
    dosage: '1 Tablet',
    timing: '9:30 PM',
    slot: 'Night',
    instructions: 'Take before sleeping',
    status: 'pending',
    daysRemaining: 3,
    stockRemaining: 3,
    critical: false,
  },
  // Priya Sen's medicines (strictly separated)
  {
    id: 'med_priya_1',
    patientId: 'patient_priya',
    medicineName: 'Thyronorm 50 mcg',
    dosage: '1 Tablet',
    timing: '7:00 AM',
    slot: 'Morning',
    instructions: 'Empty stomach, 30 min before tea/coffee',
    status: 'taken',
    takenAt: '7:15 AM',
    daysRemaining: 22,
    stockRemaining: 22,
    critical: true,
  },
  {
    id: 'med_priya_2',
    patientId: 'patient_priya',
    medicineName: 'Telmisartan 40mg',
    dosage: '1 Tablet',
    timing: '9:00 AM',
    slot: 'Morning',
    instructions: 'Take with morning meal for BP management',
    status: 'pending',
    daysRemaining: 15,
    stockRemaining: 15,
    critical: true,
  },
];

const initialOrders: MedicineOrder[] = [
  {
    id: 'ORD-9821',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    items: [
      { medicineName: 'Metformin SR 500mg (Strip of 15)', quantity: 2, price: 145, dosage: '500mg' },
      { medicineName: 'Budecort 200 Inhaler (200 MDIs)', quantity: 1, price: 420, dosage: '200mcg' },
      { medicineName: 'Montair LC (Strip of 10)', quantity: 2, price: 210, dosage: '10mg' },
    ],
    totalAmount: 1130,
    prescriptionRequired: true,
    prescriptionStatus: 'Approved',
    pharmacyStatus: 'Ready for Pickup',
    deliveryStatus: 'Out for Delivery',
    deliveryAssignmentId: 'DEL-4418',
    deliveryOtp: '4921',
    orderedAt: 'Today, 10:15 AM',
    deliveryAddress: 'Flat 402, Skyline Heights, 12th Main, Indiranagar, Bengaluru',
  },
  {
    id: 'ORD-9750',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    items: [
      { medicineName: 'Accu-Chek Active Test Strips (50s)', quantity: 1, price: 950, dosage: 'Diagnostic' },
    ],
    totalAmount: 950,
    prescriptionRequired: false,
    prescriptionStatus: 'Not Required',
    pharmacyStatus: 'Completed',
    deliveryStatus: 'Delivered',
    deliveryAssignmentId: 'DEL-3810',
    deliveryOtp: '7108',
    orderedAt: 'Yesterday, 3:30 PM',
    deliveryAddress: 'Flat 402, Skyline Heights, 12th Main, Indiranagar, Bengaluru',
  },
];

const initialAssignments: DeliveryAssignment[] = [
  {
    id: 'DEL-4418',
    orderId: 'ORD-9821',
    deliveryPartnerId: 'dp_arun',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    patientPhoneMasked: '+91 98*** **210 (Masked Proxy)',
    pharmacyId: 'pharma_apollo_koramangala',
    pharmacyName: 'Apollo MedZone - 80ft Road Koramangala',
    pickupAddress: 'Shop 14, 80ft Main Road, 4th Block, Koramangala, Bengaluru',
    pickupCoordinates: { x: 22, y: 78 },
    deliveryAddress: 'Flat 402, Skyline Heights, 12th Main, Indiranagar, Bengaluru',
    deliveryCoordinates: { x: 74, y: 32 },
    currentCoordinates: { x: 58, y: 46 }, // En route between pharmacy and patient
    assignmentStatus: 'Out for Delivery',
    deliveryOtp: '4921',
    deliveryOtpVerified: false,
    estimatedMinutes: 8,
    distanceKm: 3.4,
    payoutAmount: 75,
    acceptedAt: '10:45 AM',
    pickedUpAt: '11:02 AM',
    packageSummary: 'Sealed Tamper-Proof NIVORA Medical Pouch #772 (Temp: Room Ambient 22°C)',
  },
];

const initialNotifications: NivoraNotification[] = [
  {
    id: 'notif_1',
    recipientRoles: ['patient', 'caretaker'],
    title: 'Morning Medicine Reminder',
    message: 'Rahul: Metformin SR 500mg is scheduled for 8:00 AM (Take after breakfast).',
    type: 'reminder',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    timestamp: '15 mins ago',
    read: false,
  },
  {
    id: 'notif_2',
    recipientRoles: ['delivery_partner', 'patient', 'pharmacy', 'caretaker'],
    title: 'Medicine Package Out for Delivery',
    message: 'Arun Kumar picked up package from Apollo MedZone. Estimated arrival in 8 mins. Share OTP 4921 upon arrival.',
    type: 'delivery',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    timestamp: '5 mins ago',
    read: false,
  },
  {
    id: 'notif_3',
    recipientRoles: ['caretaker'],
    title: 'Refill Alert for Rahul Sharma',
    message: 'Montair LC has only 3 days of stock remaining. Order placed in dispatch queue.',
    type: 'refill',
    patientId: 'patient_rahul',
    patientName: 'Rahul Sharma',
    timestamp: '1 hour ago',
    read: true,
  },
];

export const NivoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_PREFIX + 'role') as UserRole) || 'patient';
  });

  const [allPatients] = useState<PatientProfile[]>(initialPatients);
  const [currentPatient] = useState<PatientProfile>(initialPatients[0]); // Rahul Sharma
  const [activePatientIdForCaretaker, setActivePatientIdForCaretaker] = useState<string>('patient_rahul');

  const [caretakerConnections, setCaretakerConnections] = useState<CaretakerConnection[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'connections');
    return saved ? JSON.parse(saved) : initialCaretakerConnections;
  });

  const [schedules, setSchedules] = useState<MedicineScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'schedules');
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  const [orders, setOrders] = useState<MedicineOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [assignments, setAssignments] = useState<DeliveryAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'partner');
    return saved ? JSON.parse(saved) : initialDeliveryPartner;
  });

  const [notifications, setNotifications] = useState<NivoraNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'connections', JSON.stringify(caretakerConnections));
  }, [caretakerConnections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'partner', JSON.stringify(deliveryPartner));
  }, [deliveryPartner]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Live GPS simulation when delivery is Out for Delivery
  useEffect(() => {
    const activeDelivery = assignments.find((a) => a.assignmentStatus === 'Out for Delivery');
    if (!activeDelivery) return;

    const interval = setInterval(() => {
      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id !== activeDelivery.id || item.assignmentStatus !== 'Out for Delivery') {
            return item;
          }
          const targetX = item.deliveryCoordinates.x;
          const targetY = item.deliveryCoordinates.y;
          const currentX = item.currentCoordinates.x;
          const currentY = item.currentCoordinates.y;

          // Step slightly closer toward target
          const dx = targetX - currentX;
          const dy = targetY - currentY;
          const distance = Math.hypot(dx, dy);

          if (distance < 2) {
            // Very close
            return {
              ...item,
              estimatedMinutes: Math.max(1, item.estimatedMinutes - 1),
            };
          }

          const step = 0.8;
          const newX = currentX + (dx / distance) * step;
          const newY = currentY + (dy / distance) * step;
          const newMins = Math.max(1, Math.round((distance / 2) * 0.8));

          return {
            ...item,
            currentCoordinates: { x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) },
            estimatedMinutes: newMins,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [assignments]);

  // Push notification helper
  const addNotification = (notif: Omit<NivoraNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NivoraNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Medicine Schedule actions
  const markDose = (medicineId: string, status: 'taken' | 'missed') => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === medicineId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...item,
            status,
            takenAt: status === 'taken' ? nowStr : undefined,
          };
        }
        return item;
      })
    );

    const targetMed = schedules.find((s) => s.id === medicineId);
    if (!targetMed) return;

    const patient = allPatients.find((p) => p.id === targetMed.patientId) || currentPatient;

    if (status === 'missed') {
      // Notify authorized caretakers!
      addNotification({
        recipientRoles: ['caretaker', 'patient'],
        title: `Missed Dose Alert: ${patient.name}`,
        message: `${patient.name} did not log dose for ${targetMed.medicineName} (${targetMed.timing}). Please check in.`,
        type: 'missed_dose',
        patientId: patient.id,
        patientName: patient.name,
      });
    } else {
      addNotification({
        recipientRoles: ['caretaker', 'patient'],
        title: `Dose Logged: ${patient.name}`,
        message: `${patient.name} took ${targetMed.medicineName} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'reminder',
        patientId: patient.id,
        patientName: patient.name,
      });
    }
  };

  const addMedicine = (medicine: Omit<MedicineScheduleItem, 'id' | 'status'>) => {
    const newItem: MedicineScheduleItem = {
      ...medicine,
      id: 'med_' + Date.now(),
      status: 'pending',
    };
    setSchedules((prev) => [...prev, newItem]);
  };

  // Caretaker connections
  const inviteCaretaker = (data: {
    name: string;
    phone: string;
    role: CaretakerConnection['caretakerRole'];
    permissions: CaretakerPermissions;
  }) => {
    const randomCode = 'NIV-CARE-' + Math.floor(1000 + Math.random() * 9000);
    const newConnection: CaretakerConnection = {
      id: 'conn_' + Date.now(),
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      caretakerId: 'ct_custom_' + Date.now(),
      caretakerName: data.name,
      caretakerPhone: data.phone,
      caretakerRole: data.role,
      caretakerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      connectionStatus: 'active',
      inviteCode: randomCode,
      permissions: data.permissions,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCaretakerConnections((prev) => [...prev, newConnection]);

    addNotification({
      recipientRoles: ['patient', 'caretaker'],
      title: 'Caretaker Connected',
      message: `${data.name} (${data.role}) is now connected with customized access permissions.`,
      type: 'caretaker',
      patientId: currentPatient.id,
      patientName: currentPatient.name,
    });
  };

  const updateCaretakerPermissions = (connectionId: string, permissions: CaretakerPermissions) => {
    setCaretakerConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, permissions } : c))
    );
  };

  const removeCaretaker = (connectionId: string) => {
    const target = caretakerConnections.find((c) => c.id === connectionId);
    setCaretakerConnections((prev) => prev.filter((c) => c.id !== connectionId));
    if (target) {
      addNotification({
        recipientRoles: ['patient'],
        title: 'Caretaker Removed',
        message: `${target.caretakerName} has been unlinked from your medication access.`,
        type: 'caretaker',
      });
    }
  };

  // Orders and Pharmacy workflow
  const placeOrder = (items: MedicineOrder['items'], address: string) => {
    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: MedicineOrder = {
      id: orderId,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      items,
      totalAmount: total,
      prescriptionRequired: true,
      prescriptionStatus: 'Pending Review',
      pharmacyStatus: 'Pending Verification',
      deliveryStatus: 'Available',
      deliveryOtp: generatedOtp,
      orderedAt: 'Just now',
      deliveryAddress: address || currentPatient.address,
    };

    setOrders((prev) => [newOrder, ...prev]);

    addNotification({
      recipientRoles: ['pharmacy', 'patient'],
      title: 'New Medicine Order Placed',
      message: `${currentPatient.name} submitted Order ${orderId} (₹${total}). Awaiting pharmacist verification.`,
      type: 'order',
      patientId: currentPatient.id,
      patientName: currentPatient.name,
    });
  };

  const pharmacyVerifyOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              prescriptionStatus: 'Approved',
              pharmacyStatus: 'Preparing',
            }
          : o
      )
    );

    addNotification({
      recipientRoles: ['patient', 'caretaker'],
      title: `Prescription Verified for ${orderId}`,
      message: 'Apollo Pharmacist Dr. Kavita approved your prescription. Medicine batch is being dispensed.',
      type: 'order',
    });
  };

  const pharmacyPrepareOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              pharmacyStatus: 'Ready for Pickup',
            }
          : o
      )
    );
  };

  const pharmacyRequestDelivery = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const assignmentId = 'DEL-' + Math.floor(1000 + Math.random() * 9000);
    const newAssignment: DeliveryAssignment = {
      id: assignmentId,
      orderId: order.id,
      patientId: order.patientId,
      patientName: order.patientName,
      patientPhoneMasked: '+91 98*** **210 (Masked Proxy)',
      pharmacyId: 'pharma_apollo_koramangala',
      pharmacyName: 'Apollo MedZone - 80ft Road Koramangala',
      pickupAddress: 'Shop 14, 80ft Main Road, 4th Block, Koramangala, Bengaluru',
      pickupCoordinates: { x: 22, y: 78 },
      deliveryAddress: order.deliveryAddress,
      deliveryCoordinates: { x: 74, y: 32 },
      currentCoordinates: { x: 22, y: 78 },
      assignmentStatus: 'Available', // Broadcast to available partners
      deliveryOtp: order.deliveryOtp,
      deliveryOtpVerified: false,
      estimatedMinutes: 20,
      distanceKm: 4.2,
      payoutAmount: 85,
      packageSummary: `Sealed Tamper-Proof NIVORA Medical Pouch (${order.items.length} items)`,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryAssignmentId: assignmentId,
              deliveryStatus: 'Available',
            }
          : o
      )
    );

    addNotification({
      recipientRoles: ['delivery_partner'],
      title: 'New Delivery Request Available',
      message: `Pickup at Apollo MedZone Koramangala → Indiranagar (4.2 km). Payout: ₹85.`,
      type: 'delivery',
    });
  };

  // Delivery Partner Actions
  const toggleDeliveryPartnerOnline = () => {
    setDeliveryPartner((prev) => {
      const nextOnline = !prev.isOnline;
      addNotification({
        recipientRoles: ['delivery_partner'],
        title: nextOnline ? 'Partner Status: Online' : 'Partner Status: Offline',
        message: nextOnline
          ? 'You are now visible to nearby pharmacies for medicine delivery orders.'
          : 'You are now offline. No new delivery assignments will be routed.',
        type: 'delivery',
      });
      return { ...prev, isOnline: nextOnline };
    });
  };

  const updatePartnerProfile = (data: Partial<DeliveryPartner>) => {
    setDeliveryPartner((prev) => ({ ...prev, ...data }));
  };

  const acceptDelivery = (assignmentId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              deliveryPartnerId: deliveryPartner.id,
              assignmentStatus: 'Accepted',
              acceptedAt: nowTime,
            }
          : a
      )
    );

    const assign = assignments.find((a) => a.id === assignmentId);
    if (assign) {
      setOrders((prev) =>
        prev.map((o) => (o.id === assign.orderId ? { ...o, deliveryStatus: 'Accepted' } : o))
      );
      addNotification({
        recipientRoles: ['patient', 'pharmacy', 'caretaker'],
        title: 'Delivery Partner Assigned',
        message: `${deliveryPartner.fullName} (${deliveryPartner.vehicleType} - ${deliveryPartner.vehicleNumber}) accepted delivery for ${assign.orderId}.`,
        type: 'delivery',
        patientId: assign.patientId,
        patientName: assign.patientName,
      });
    }
  };

  const rejectDelivery = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              assignmentStatus: 'Available',
              deliveryPartnerId: undefined,
            }
          : a
      )
    );
  };

  const advanceDeliveryStatus = (assignmentId: string, nextStatus: DeliveryStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const updated = { ...a, assignmentStatus: nextStatus };
        if (nextStatus === 'Picked Up') {
          updated.pickedUpAt = nowTime;
        } else if (nextStatus === 'Out for Delivery') {
          updated.estimatedMinutes = 12;
        }
        return updated;
      })
    );

    const targetAssignment = assignments.find((a) => a.id === assignmentId);
    if (targetAssignment) {
      setOrders((prev) =>
        prev.map((o) => (o.id === targetAssignment.orderId ? { ...o, deliveryStatus: nextStatus } : o))
      );

      let msg = '';
      if (nextStatus === 'Arriving at Pharmacy') {
        msg = `${deliveryPartner.fullName} is arriving at Apollo MedZone to collect the sealed package.`;
      } else if (nextStatus === 'Picked Up') {
        msg = `Medicines picked up from pharmacy. Preparing dispatch route.`;
      } else if (nextStatus === 'Out for Delivery') {
        msg = `${deliveryPartner.fullName} is out for delivery with your medicine. ETA: ~12 mins. Keep OTP ${targetAssignment.deliveryOtp} ready.`;
      }

      if (msg) {
        addNotification({
          recipientRoles: ['patient', 'pharmacy', 'caretaker'],
          title: `Delivery Update: ${nextStatus}`,
          message: msg,
          type: 'delivery',
          patientId: targetAssignment.patientId,
          patientName: targetAssignment.patientName,
        });
      }
    }
  };

  const verifyAndCompleteDeliveryOtp = (
    assignmentId: string,
    enteredOtp: string
  ): { success: boolean; message: string } => {
    const targetAssignment = assignments.find((a) => a.id === assignmentId);
    if (!targetAssignment) {
      return { success: false, message: 'Assignment not found.' };
    }

    if (enteredOtp.trim() !== targetAssignment.deliveryOtp) {
      return {
        success: false,
        message: 'Invalid OTP! Please request the recipient for the 4-digit security OTP shown in their NIVORA app.',
      };
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Mark as delivered
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              assignmentStatus: 'Delivered',
              deliveryOtpVerified: true,
              deliveredAt: nowTime,
              estimatedMinutes: 0,
            }
          : a
      )
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetAssignment.orderId
          ? {
              ...o,
              deliveryStatus: 'Delivered',
              pharmacyStatus: 'Completed',
            }
          : o
      )
    );

    // Update partner earnings
    setDeliveryPartner((prev) => ({
      ...prev,
      totalDeliveries: prev.totalDeliveries + 1,
      todayEarnings: prev.todayEarnings + targetAssignment.payoutAmount,
    }));

    // Notify all parties
    addNotification({
      recipientRoles: ['patient', 'pharmacy', 'caretaker', 'delivery_partner'],
      title: 'Medicine Delivered Successfully!',
      message: `Order ${targetAssignment.orderId} securely handed over to ${targetAssignment.patientName} via verified OTP.`,
      type: 'delivery',
      patientId: targetAssignment.patientId,
      patientName: targetAssignment.patientName,
    });

    return { success: true, message: 'Delivery completed successfully with verified OTP.' };
  };

  const reportFailedDelivery = (assignmentId: string, reason: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              assignmentStatus: 'Failed',
              failureReason: reason,
            }
          : a
      )
    );

    const assign = assignments.find((a) => a.id === assignmentId);
    if (assign) {
      setOrders((prev) =>
        prev.map((o) => (o.id === assign.orderId ? { ...o, deliveryStatus: 'Failed' } : o))
      );

      addNotification({
        recipientRoles: ['patient', 'pharmacy', 'caretaker'],
        title: 'Delivery Attempt Failed',
        message: `Delivery attempt for ${assign.orderId} failed: ${reason}. Support is rescheduling.`,
        type: 'delivery',
        patientId: assign.patientId,
        patientName: assign.patientName,
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetDemoData = () => {
    localStorage.clear();
    setRole('patient');
    setCaretakerConnections(initialCaretakerConnections);
    setSchedules(initialSchedules);
    setOrders(initialOrders);
    setAssignments(initialAssignments);
    setDeliveryPartner(initialDeliveryPartner);
    setNotifications(initialNotifications);
  };

  const activeAssignment = assignments.find(
    (a) =>
      a.assignmentStatus === 'Out for Delivery' ||
      a.assignmentStatus === 'Accepted' ||
      a.assignmentStatus === 'Arriving at Pharmacy' ||
      a.assignmentStatus === 'Picked Up'
  );

  return (
    <NivoraContext.Provider
      value={{
        role,
        setRole,
        currentPatient,
        allPatients,
        activePatientIdForCaretaker,
        setActivePatientIdForCaretaker,
        caretakerConnections,
        inviteCaretaker,
        updateCaretakerPermissions,
        removeCaretaker,
        schedules,
        markDose,
        addMedicine,
        orders,
        assignments,
        activeAssignment,
        placeOrder,
        pharmacyVerifyOrder,
        pharmacyPrepareOrder,
        pharmacyRequestDelivery,
        deliveryPartner,
        toggleDeliveryPartnerOnline,
        updatePartnerProfile,
        acceptDelivery,
        rejectDelivery,
        advanceDeliveryStatus,
        verifyAndCompleteDeliveryOtp,
        reportFailedDelivery,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        resetDemoData,
      }}
    >
      {children}
    </NivoraContext.Provider>
  );
};

export const useNivora = () => {
  const context = useContext(NivoraContext);
  if (!context) {
    throw new Error('useNivora must be used within a NivoraProvider');
  }
  return context;
};
