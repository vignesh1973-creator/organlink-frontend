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
  Plus,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Eye,
  ExternalLink,
  UserCheck,
  Trash2,
  Download,
  Pencil,
} from "lucide-react";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";
import EditDonorModal from "@/components/hospital/EditDonorModal";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Donor {
  id: number;
  donor_id: string;
  hospital_id: string;
  full_name: string;
  age: number;
  gender: string;
  blood_type: string;
  organs_to_donate: string[];
  medical_history: string;
  contact_phone: string;
  contact_email: string;
  emergency_contact: string;
  emergency_phone: string;
  signature_file_path?: string;
  signature_ipfs_hash?: string;
  blockchain_hash?: string;
  signature_verified: boolean;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hospital_display_id?: number;
}

export default function ViewDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrgan, setFilterOrgan] = useState("all");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewDonor, setViewDonor] = useState<Donor | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<string | null>(null);
  const [confirmDeleteDonor, setConfirmDeleteDonor] = useState<Donor | null>(
    null,
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exportFields, setExportFields] = useState({
    donorId: true,
    name: true,
    age: true,
    gender: true,
    bloodType: true,
    organs: true,
    contact: true,
    status: true,
    registrationDate: true,
    verified: true,
    txHash: true
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
                    checked={exportFields.donorId}
                    onChange={() => toggleExportField('donorId')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Donor ID</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.name}
                    onChange={() => toggleExportField('name')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Name</span>
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
                    checked={exportFields.organs}
                    onChange={() => toggleExportField('organs')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Organs</span>
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
                 <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportFields.txHash}
                    onChange={() => toggleExportField('txHash')}
                    className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                  />
                  <span>Tx Hash</span>
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
          const rows = filteredDonors
            .map((d) => {
              const row: any = {};
              if (exportFields.donorId) row.DonorID = d.donor_id;
              if (exportFields.name) row.Name = d.full_name;
              if (exportFields.age) row.Age = d.age;
              if (exportFields.gender) row.Gender = d.gender;
              if (exportFields.bloodType) row.BloodType = d.blood_type;
              if (exportFields.organs) row.Organs = d.organs_to_donate.join(", ");
              if (exportFields.contact) {
                row.Phone = d.contact_phone;
                row.Email = d.contact_email;
              }
              if (exportFields.status) row.Status = d.is_active ? "ACTIVE" : "INACTIVE";
              if (exportFields.verified) row.Verified = d.signature_verified ? "Yes" : "No";
              if (exportFields.registrationDate) {
                row.Registered = new Date(d.registration_date)
                  .toISOString()
                  .slice(0, 10);
              }
              if (exportFields.txHash) row.TxHash = d.blockchain_hash || "";

              // Always include for filtering
              row._regDate = new Date(d.registration_date);
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
            doc.text("Donor Report", 14, 14);
            autoTable(doc, {
              head: [cols],
              body: rows.map((r) => cols.map((c) => (r as any)[c])),
              styles: { fontSize: 8 },
              headStyles: { fillColor: [22, 163, 74] },
              startY: 20,
              theme: "grid",
            });
            doc.save(`donors_${Date.now()}.pdf`);
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
            XLSX.utils.book_append_sheet(wb, ws, "Donors");
            XLSX.writeFile(wb, `donors_${Date.now()}.xlsx`);
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
