import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Eye,
  ExternalLink,
  Trash2,
  Download,
  Pencil,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";
import EditPatientModal from "@/components/hospital/EditPatientModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Patient {
  id: number;
  patient_id: string;
  hospital_id: string;
  full_name: string;
  age: number;
  gender: string;
  blood_type: string;
  organ_needed: string;
  urgency_level: string;
  medical_condition: string;
  contact_phone: string;
  contact_email: string;
  guardian_name: string;
  guardian_phone: string;
  signature_file_path?: string;
  signature_ipfs_hash?: string;
  blockchain_hash?: string;
  signature_verified: boolean;
  profile_photo?: string | null;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status?: string;
  matched_donor_id?: string;
  matched_hospital_id?: string;
  hospital_display_id?: number;
}

export default function ViewPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrgan, setFilterOrgan] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<string | null>(null);
  const [confirmDeletePatient, setConfirmDeletePatient] = useState<Patient | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportFields, setExportFields] = useState({
    name: true,
    age: true,
    gender: true,
    bloodType: true,
    organNeeded: true,
    urgency: true,
    contact: true,
    registrationDate: true,
    status: true,
    verified: true
  });

  const toggleExportField = (field: keyof typeof exportFields) => {
    setExportFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const { hospital } = useHospitalAuth();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterOrgan, filterUrgency, filterBloodType]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      } else {
        showError("Failed to load patients");
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      showError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.contact_email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Organ filter
    if (filterOrgan && filterOrgan !== "all") {
      filtered = filtered.filter((patient) =>
        patient.organ_needed === filterOrgan,
      );
    }

    // Urgency filter
    if (filterUrgency && filterUrgency !== "all") {
      filtered = filtered.filter((patient) =>
        patient.urgency_level === filterUrgency,
      );
    }

    // Blood type filter
    if (filterBloodType && filterBloodType !== "all") {
      filtered = filtered.filter(
        (patient) => patient.blood_type === filterBloodType,
      );
    }

    setFilteredPatients(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const organTypes = [
    "Kidney",
    "Liver",
    "Heart",
    "Lung",
    "Pancreas",
    "Cornea",
    "Bone Marrow",
    "Skin",
    "Bone",
  ];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["Low", "Medium", "High", "Critical"];

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditModalOpen(true);
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.patient_id === updatedPatient.patient_id ? updatedPatient : p,
      ),
    );
    setFilteredPatients((prev) =>
      prev.map((p) =>
        p.patient_id === updatedPatient.patient_id ? updatedPatient : p,
      ),
    );
  };

  const openDeleteConfirm = (patient: Patient) => {
    setConfirmDeletePatient(patient);
  };

  const confirmDelete = async () => {
    if (!confirmDeletePatient) return;
    await handleDeletePatient(confirmDeletePatient.patient_id);
    setConfirmDeletePatient(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (patientId: string) => {
    setDeletingPatient(patientId);
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(`/api/hospital/patients/${patientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        showSuccess("Patient deleted successfully!");
        setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
        setFilteredPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete patient");
    } finally {
      setDeletingPatient(null);
    }
  };

  if (loading) {
    return (
      <HospitalLayout title="Patient Management" subtitle="Manage and track patients waiting for transplants">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </HospitalLayout>
    );
  }

  return (
    <HospitalLayout
      title="Patient Management"
      subtitle="Manage and track patients waiting for transplants"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-4"></div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setExportOpen(true)}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Link to="/hospital/patients/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-medical-600 hover:bg-medical-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Patient
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Status</p>
                  <p className="text-2xl font-bold">
                    {patients.filter((p) => p.urgency_level === "Critical").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold">
                    {patients.filter((p) => p.signature_verified).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Matched</p>
                  <p className="text-2xl font-bold">
                    {patients.filter((p) => p.status === "Matched").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterOrgan} onValueChange={setFilterOrgan}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by organ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organs</SelectItem>
                  {organTypes.map((organ) => (
                    <SelectItem key={organ} value={organ}>
                      {organ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterOrgan("all");
                  setFilterUrgency("all");
                  setFilterBloodType("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card
                key={patient.patient_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {patient.hospital_display_id ? `#${patient.hospital_display_id}` : patient.patient_id} • Age: {patient.age} •{" "}
                            {patient.gender}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{patient.blood_type}</Badge>
                          <Badge
                            className={
                              patient.urgency_level === "Critical"
                                ? "bg-red-100 text-red-800"
                                : patient.urgency_level === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                            }
                          >
                            {patient.urgency_level} Priority
                          </Badge>
                          {patient.signature_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Organ Needed:
                        </p>
                        <Badge className="bg-red-100 text-red-800">
                          <Heart className="h-3 w-3 mr-1" />
                          {patient.organ_needed}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {patient.contact_phone}
                        </div>
                        {patient.contact_email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {patient.contact_email}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Registered: {formatDate(patient.registration_date)}
                        </div>
                      </div>

                      {patient.medical_condition && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <strong>Medical Condition:</strong>{" "}
                            {patient.medical_condition}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2 md:space-y-2 md:ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewPatient(patient)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                        title="Edit patient"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteConfirm(patient)}
                        disabled={deletingPatient === patient.patient_id}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        title="Delete patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {patient.blockchain_hash && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !(
                              patient.blockchain_hash.startsWith("0x") &&
                              patient.blockchain_hash.length === 66
                            )
                          }
                          onClick={() => {
                            if (
                              patient.blockchain_hash.startsWith("0x") &&
                              patient.blockchain_hash.length === 66
                            ) {
                              window.open(
                                `https://sepolia.etherscan.io/tx/${patient.blockchain_hash}`,
                                "_blank",
                              );
                            }
                          }}
                          title={
                            patient.blockchain_hash.startsWith("0x")
                              ? "View on Etherscan"
                              : "Demo TX (not on-chain)"
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Patients Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {patients.length === 0
                    ? "No patients have been registered yet."
                    : "No patients match your current filter criteria."}
                </p>
                <Link to="/hospital/patients/register">
                  <Button className="bg-medical-600 hover:bg-medical-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Patient
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <EditPatientModal
        patient={editingPatient}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handlePatientUpdate}
      />

      {viewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Patient Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewPatient(null)}
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">
                  Personal Information
                </p>
                <p className="text-gray-600 mt-1">{viewPatient.full_name}</p>
                <p className="text-gray-600">
                  {viewPatient.age} years • {viewPatient.gender}
                </p>
                <p className="text-gray-600">
                  Blood Type: {viewPatient.blood_type}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Contact</p>
                <p className="text-gray-600 mt-1">{viewPatient.contact_phone}</p>
                {viewPatient.contact_email && (
                  <p className="text-gray-600">{viewPatient.contact_email}</p>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-700">Medical Info</p>
                <p className="text-gray-600 mt-1">
                  Needed: {viewPatient.organ_needed}
                </p>
                <p className="text-gray-600">
                  Urgency: {viewPatient.urgency_level}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Blockchain</p>
                {viewPatient.blockchain_hash &&
                  viewPatient.blockchain_hash.startsWith("0x") ? (
                  <a
                    className="text-medical-600 underline"
                    target="_blank"
                    href={`https://sepolia.etherscan.io/tx/${viewPatient.blockchain_hash}`}
                  >
                    View on Etherscan
                  </a>
                ) : (
                  <p className="text-gray-600">
                    {viewPatient.blockchain_hash
                      ? "Demo TX (not on-chain)"
                      : "Not registered"}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {viewPatient.signature_ipfs_hash && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://gateway.pinata.cloud/ipfs/${viewPatient.signature_ipfs_hash}`,
                      "_blank",
                    )
                  }
                >
                  View Document
                </Button>
              )}
              <Button
                onClick={() => {
                  setViewPatient(null);
                  handleEditPatient(viewPatient);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!confirmDeletePatient}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The patient record "
              {confirmDeletePatient?.full_name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeletePatient(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Export Patient Data</DialogTitle>
            <DialogDescription>
              Choose your export format and customize the data to include
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Export Format</p>
              <div className="inline-flex rounded-md border overflow-hidden">
                <button
                  className={`px-4 py-2 text-sm ${exportFormat === "pdf" ? "bg-medical-600 text-white" : "bg-white"} `}
                  onClick={() => setExportFormat("pdf")}
                >
                  PDF
                </button>
                <button
                  className={`px-4 py-2 text-sm border-l ${exportFormat === "excel" ? "bg-medical-600 text-white" : "bg-white"} `}
                  onClick={() => setExportFormat("excel")}
                >
                  Excel/CSV
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Select Fields</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.name}
                    onChange={() => toggleExportField('name')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Name & ID</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.age}
                    onChange={() => toggleExportField('age')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Age</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.gender}
                    onChange={() => toggleExportField('gender')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Gender</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.bloodType}
                    onChange={() => toggleExportField('bloodType')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Blood Type</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.organNeeded}
                    onChange={() => toggleExportField('organNeeded')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Organ Needed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.urgency}
                    onChange={() => toggleExportField('urgency')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Urgency</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.contact}
                    onChange={() => toggleExportField('contact')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Contact Info</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.status}
                    onChange={() => toggleExportField('status')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Status</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.verified}
                    onChange={() => toggleExportField('verified')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Verification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.registrationDate}
                    onChange={() => toggleExportField('registrationDate')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Reg. Date</span>
                </label>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Date Range (Optional)</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                />
                <Input
                  type="date"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const rows = filteredPatients
                  .map((p) => {
                    const row: any = {};
                    if (exportFields.name) {
                      row.PatientID = p.patient_id;
                      row.Name = p.full_name;
                    }
                    if (exportFields.age) row.Age = p.age;
                    if (exportFields.gender) row.Gender = p.gender;
                    if (exportFields.bloodType) row.BloodType = p.blood_type;
                    if (exportFields.organNeeded) row.NeededOrgan = p.organ_needed;
                    if (exportFields.urgency) row.Urgency = p.urgency_level;
                    if (exportFields.contact) {
                      row.Phone = p.contact_phone;
                      row.Email = p.contact_email;
                    }
                    if (exportFields.status) row.Status = p.status || 'Waiting';
                    if (exportFields.verified) row.Verified = p.signature_verified ? "Yes" : "No";
                    if (exportFields.registrationDate) {
                      row.Registered = new Date(p.registration_date)
                        .toISOString()
                        .slice(0, 10);
                    }
                    // Always include for filtering
                    row._regDate = new Date(p.registration_date);
                    return row;
                  })
                  .filter((r) => {
                    if (
                      exportFrom &&
                      r._regDate < new Date(exportFrom)
                    )
                      return false;
                    if (exportTo && r._regDate > new Date(exportTo))
                      return false;

                    delete r._regDate; // Remove helper field
                    return true;
                  });

                if (!rows.length) {
                  setExportOpen(false);
                  return;
                }

                if (exportFormat === "pdf") {
                  const jsPDF = (await import("jspdf")).default;
                  const autoTable = (await import("jspdf-autotable"))
                    .default as any;
                  const doc = new jsPDF({ orientation: "landscape" });
                  const cols = Object.keys(rows[0]);
                  doc.text("Patient Report", 14, 14);
                  autoTable(doc, {
                    head: [cols],
                    body: rows.map((r) => cols.map((c) => (r as any)[c])),
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [22, 163, 74] },
                    startY: 20,
                    theme: "grid",
                  });
                  doc.save(`patients_${Date.now()}.pdf`);
                } else {
                  const XLSX = (await import("xlsx")).default as any;
                  const ws = XLSX.utils.json_to_sheet(rows);
                  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

                  for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_col(C) + "1";
                    if (!ws[cellAddress]) continue;
                    ws[cellAddress].s = {
                      fill: { fgColor: { rgb: "16A34A" } },
                      font: { bold: true, color: { rgb: "FFFFFF" } },
                      alignment: { horizontal: "center", vertical: "center" }
                    };
                  }

                  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                      if (!ws[cellAddress]) continue;
                      ws[cellAddress].s = {
                        alignment: { horizontal: "center", vertical: "center" }
                      };
                    }
                  }

                  const cols = Object.keys(rows[0]);
                  ws['!cols'] = cols.map(() => ({ wch: 15 }));

                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Patients");
                  XLSX.writeFile(wb, `patients_${Date.now()}.xlsx`);
                }
                setExportOpen(false);
              }}
            >
              Export {exportFormat === "pdf" ? "PDF" : "Excel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HospitalLayout>
  );
}
