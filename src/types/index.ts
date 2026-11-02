export type UserRole = 'patient' | 'pharmacy' | 'caretaker' | 'delivery_partner';

export type DeliveryStatus =
  | 'Available'
  | 'Assigned'
  | 'Accepted'
  | 'Arriving at Pharmacy'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed'
  | 'Cancelled';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface DeliveryPartner {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  verificationStatus: VerificationStatus;
  governmentIdType: string;
  governmentIdNumber: string;
  drivingLicenseNumber: string;
  vehicleType: 'Electric Scooter' | 'Motorcycle' | 'Bicycle' | 'Car';
  vehicleNumber: string;
  serviceArea: string;
  isOnline: boolean;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  totalDeliveries: number;
  todayEarnings: number;
  rating: number;
  createdAt: string;
}

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId?: string;
  patientId: string;
  patientName: string;
  patientPhoneMasked: string;
  pharmacyId: string;
  pharmacyName: string;
  pickupAddress: string;
  pickupCoordinates: { x: number; y: number };
  deliveryAddress: string;
  deliveryCoordinates: { x: number; y: number };
  currentCoordinates: { x: number; y: number };
  assignmentStatus: DeliveryStatus;
  deliveryOtp: string;
  deliveryOtpVerified: boolean;
  estimatedMinutes: number;
  distanceKm: number;
  payoutAmount: number;
  failureReason?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  packageSummary: string; // Partner sees ONLY package description, NOT patient medical history
}

export interface CaretakerPermissions {
  viewMedicationSchedules: boolean;
  receiveMedicationReminders: boolean;
  viewMissedDoseAlerts: boolean;
  viewMedicineInventory: boolean;
  manageMedicineOrders: boolean;
  viewMedicalExpenseSummaries: boolean;
  viewDeliveryStatus: boolean;
}

export interface CaretakerConnection {
  id: string;
  patientId: string;
  patientName: string;
  caretakerId: string;
  caretakerName: string;
  caretakerPhone: string;
  caretakerRole: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Personal Nurse' | 'Primary Guardian';
  caretakerAvatar: string;
  connectionStatus: 'active' | 'pending' | 'rejected';
  inviteCode?: string;
  permissions: CaretakerPermissions;
  createdAt: string;
}

export interface MedicineScheduleItem {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  timing: string; // e.g. "8:00 AM"
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  instructions: string; // e.g. "Take after breakfast"
  status: 'pending' | 'taken' | 'missed';
  takenAt?: string;
  daysRemaining: number;
  stockRemaining: number;
  critical: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  avatarUrl: string;
  medicalConditions: string[];
  primaryDoctor: string;
  monthlySavingsBalance: number;
  savingsGoal: number;
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  patientName: string;
  items: Array<{
    medicineName: string;
    quantity: number;
    price: number;
    dosage: string;
  }>;
  totalAmount: number;
  prescriptionRequired: boolean;
  prescriptionStatus: 'Approved' | 'Pending Review' | 'Not Required';
  pharmacyStatus: 'Pending Verification' | 'Preparing' | 'Ready for Pickup' | 'Handed to Delivery' | 'Completed';
  deliveryStatus: DeliveryStatus;
  deliveryAssignmentId?: string;
  deliveryOtp: string;
  orderedAt: string;
  deliveryAddress: string;
}

export interface NivoraNotification {
  id: string;
  recipientRoles: UserRole[];
  recipientId?: string;
  title: string;
  message: string;
  type: 'reminder' | 'missed_dose' | 'refill' | 'delivery' | 'order' | 'caretaker';
  patientId?: string;
  patientName?: string;
  timestamp: string;
  read: boolean;
}
