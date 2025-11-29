import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";
import EditPatientModal from "@/components/hospital/EditPatientModal";

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

  // ... existing code ...

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
          </div >
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
              // Always include for filtering, remove later if needed
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

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(rows);

            // Get worksheet range
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

            // Style header row with green background and white text
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_col(C) + "1";
              if (!ws[cellAddress]) continue;
              ws[cellAddress].s = {
                fill: { fgColor: { rgb: "16A34A" } },
                font: { bold: true, color: { rgb: "FFFFFF" } },
                alignment: { horizontal: "center", vertical: "center" }
              };
            }

            // Center align all data cells
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                  alignment: { horizontal: "center", vertical: "center" }
                };
              }
            }

            // Set column widths
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
        </DialogContent >
      </Dialog >
    </HospitalLayout >
  );
}
