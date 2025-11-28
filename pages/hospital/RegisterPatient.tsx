import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Heart,
  Phone,
  Mail,
  UserPlus,
  Info,
} from "lucide-react";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";

interface PatientFormData {
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
}

interface SignatureUploadStatus {
  uploading: boolean;
  uploaded: boolean;
  ipfsHash: string;
  ocrVerified: boolean;
  blockchainTxHash: string;
  fileName: string;
  docHash?: string;
  ocrScoreBps?: number;
}

export default function RegisterPatient() {
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: "",
    age: 0,
    gender: "",
    blood_type: "",
    organ_needed: "",
    urgency_level: "medium",
    medical_condition: "",
    contact_phone: "",
    contact_email: "",
    guardian_name: "",
    guardian_phone: "",
  });

  const [signatureStatus, setSignatureStatus] = useState<SignatureUploadStatus>(
    {
      uploading: false,
      uploaded: false,
      ipfsHash: "",
      ocrVerified: false,
      blockchainTxHash: "",
      fileName: "",
    },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registeredPatientId, setRegisteredPatientId] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<'signature' | 'aadhaar'>('signature');
  const [aadhaarLast4, setAadhaarLast4] = useState('');

  const { hospital } = useHospitalAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (
    field: keyof PatientFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignaturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = ['full_name', 'age', 'gender', 'blood_type', 'organ_needed', 'urgency_level', 'contact_phone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PatientFormData]);

    if (missingFields.length > 0) {
      showError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.age < 1 || formData.age > 120) {
      showError('Patient age must be between 1 and 120 years');
      return false;
    }

    if (!signatureFile) {
      showError('Please upload a signature image');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!registeredPatientId) {
      showError("Please register patient details first");
      return;
    }

    setSignatureStatus((prev) => ({ ...prev, uploading: true }));

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append("signature", file);
      formDataForUpload.append("record_type", "patient");
      formDataForUpload.append("record_id", registeredPatientId);
      formDataForUpload.append("patient_name", formData.full_name);

      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/upload/signature", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataForUpload,
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch { }
      if (!response.ok) {
        const serverMsg =
          result?.error || `Upload failed with status ${response.status}`;
        throw new Error(serverMsg);
      }

      if (result && result.success) {
        const verified = Boolean(result.ocrVerification?.isValid);
        const confidence = Number(result.ocrVerification?.confidence ?? 0);
        const bps = Math.max(
          0,
          Math.min(
            10000,
            Math.round(
              (confidence > 1 ? confidence / 100 : confidence) * 10000,
            ),
          ),
        );
        const buf = new Uint8Array(await file.arrayBuffer());
        const { keccak256 } = await import("ethers");
        const docHash = keccak256(buf);
        setSignatureStatus((prev) => ({
          ...prev,
          uploading: false,
          uploaded: true,
          ipfsHash: result.ipfsHash,
          fileName: result.fileName,
          ocrVerified: verified,
          docHash,
          ocrScoreBps: bps,
        }));

        // Update patient record with IPFS hash and verification flag
        await updatePatientSignature(
          registeredPatientId,
          result.ipfsHash,
          verified,
        );

        showSuccess("Signature uploaded successfully!");
        setCurrentStep(3);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showError(error?.message || "Failed to upload signature");
    } finally {
      setSignatureStatus((prev) => ({ ...prev, uploading: false }));
    }
  };

  const updatePatientSignature = async (
    patientId: string,
    ipfsHash: string,
    verified: boolean,
  ) => {
    try {
      const token = localStorage.getItem("hospital_token");
      await fetch(`/api/hospital/patients/${patientId}/signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          signature_ipfs_hash: ipfsHash,
          signature_verified: verified,
        }),
      });
    } catch (error) {
      console.error("Failed to update patient signature:", error);
    }
  };

  const registerToBlockchain = async () => {
    if (!signatureStatus.ipfsHash) {
      showError("Please upload signature first");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/upload/blockchain-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          record_type: "patient",
          record_id: registeredPatientId,
          ipfs_hash: signatureStatus.ipfsHash,
          doc_hash: signatureStatus.docHash,
          ocr_score_bps: signatureStatus.ocrScoreBps,
          verified: signatureStatus.ocrVerified,
        }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch { }
      if (!response.ok) {
        const serverMsg =
          result?.error ||
          `Blockchain registration failed with status ${response.status}`;
        throw new Error(serverMsg);
      }

      if (result.success) {
        setSignatureStatus((prev) => ({
          ...prev,
          blockchainTxHash: result.blockchainTxHash,
        }));

        // Update patient record (ensures verified remains true)
        await updatePatientSignature(
          registeredPatientId,
          signatureStatus.ipfsHash,
          true,
        );

        showSuccess("Patient registered on blockchain successfully!");
        setTimeout(() => {
          navigate("/hospital/patients");
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Blockchain registration error:", error);
      showError(error?.message || "Failed to register on blockchain");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Process full registration with signature
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("hospital_token");

      // Create FormData to include file upload
      const formDataToSend = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add calculated fields for backend compatibility
      const birthYear = new Date().getFullYear() - formData.age;
      formDataToSend.append('date_of_birth', `${birthYear}-01-01`); // Approximate DOB
      formDataToSend.append('national_id', `PAT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`); // Generated ID

      // Add signature file and verification type
      formDataToSend.append('signature', signatureFile!);
      formDataToSend.append('verification_type', verificationType);

      // Add Aadhaar last 4 digits if Aadhaar verification
      if (verificationType === 'aadhaar') {
        formDataToSend.append('aadhaar_last4', aadhaarLast4);
      }

      console.log(`Submitting patient registration with ${verificationType}...`);

      const response = await fetch("/api/hospital/patients/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          console.log('OCR verification details:', result.details);
          showError(`${result.error}. Extracted: "${result.details.extractedName}" (${result.details.confidence}% confidence)`);
        } else {
          showError(result.error || `Registration failed with status ${response.status}`);
        }
        return;
      }

      if (result.success) {
        setRegisteredPatientId(result.patient.patient_id);
        setSignatureStatus(prev => ({
          ...prev,
          ipfsHash: result.verification.ipfsCID,
          blockchainTxHash: result.verification.blockchainHash,
          ocrVerified: result.verification.ocrVerified,
        }));
        showSuccess("Patient registered successfully with blockchain verification!");
        setCurrentStep(2); // Go directly to completion step
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showError(error.message || "Failed to register patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const organTypes = [
    "Kidney",
    "Liver",
    "Heart",
    "Lung",
    "Pancreas",
    "Cornea",
    "Bone Marrow",
  ];
  const urgencyLevels = ["Low", "Medium", "High", "Critical"];

  return (
    <HospitalLayout
      title="Register Patient"
      subtitle="Complete patient registration with blockchain verification"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Register New Patient</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Complete patient information and signature verification</p>
            </div>
            <Badge variant="outline" className="text-medical-600 text-xs sm:text-sm whitespace-nowrap">
              {currentStep === 1 ? 'Registration Form' : currentStep === 2 ? 'Processing...' : 'Complete'}
            </Badge>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center space-x-2 text-medical-600">
              <div className="w-8 h-8 rounded-full bg-medical-600 text-white flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Patient Details & Signature</span>
            </div>
            <div className="hidden sm:flex flex-1 h-0.5 bg-gray-200 max-w-32"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200"
                }`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Registration Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Patient Details Form */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0 md:pb-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h3>

                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        placeholder="Enter patient's full name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age || ""}
                          onChange={(e) =>
                            handleInputChange("age", parseInt(e.target.value))
                          }
                          placeholder="Age"
                          required
                          min="1"
                          max="120"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            handleInputChange("gender", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent side="bottom">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="blood_type">Blood Type *</Label>
                        <Select
                          value={formData.blood_type}
                          onValueChange={(value) =>
                            handleInputChange("blood_type", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent side="bottom">
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="organ_needed">Organ Needed *</Label>
                        <Select
                          value={formData.organ_needed}
                          onValueChange={(value) =>
                            handleInputChange("organ_needed", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select organ" />
                          </SelectTrigger>
                          <SelectContent side="bottom">
                            {organTypes.map((organ) => (
                              <SelectItem key={organ} value={organ}>
                                {organ}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="urgency_level">Urgency Level *</Label>
                      <Select
                        value={formData.urgency_level}
                        onValueChange={(value) =>
                          handleInputChange("urgency_level", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent side="bottom">
                          {urgencyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="medical_condition">
                        Medical Condition
                      </Label>
                      <Textarea
                        id="medical_condition"
                        value={formData.medical_condition}
                        onChange={(e) =>
                          handleInputChange("medical_condition", e.target.value)
                        }
                        placeholder="Describe the patient's medical condition"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Contact Information
                    </h3>

                    <div>
                      <Label htmlFor="contact_phone">Phone Number *</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) =>
                          handleInputChange("contact_phone", e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_email">Email Address</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          handleInputChange("contact_email", e.target.value)
                        }
                        placeholder="patient@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="guardian_name">
                        Guardian Name
                      </Label>
                      <Input
                        id="guardian_name"
                        value={formData.guardian_name}
                        onChange={(e) =>
                          handleInputChange("guardian_name", e.target.value)
                        }
                        placeholder="Guardian/Emergency contact name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="guardian_phone">
                        Guardian Phone
                      </Label>
                      <Input
                        id="guardian_phone"
                        value={formData.guardian_phone}
                        onChange={(e) =>
                          handleInputChange("guardian_phone", e.target.value)
                        }
                        placeholder="+1 (555) 987-6543"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Document Upload *
                  </h3>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="radio"
                        name="verificationType"
                        value="signature"
                        checked={verificationType === 'signature'}
                        onChange={(e) => setVerificationType(e.target.value as 'signature' | 'aadhaar')}
                        className="w-4 h-4 text-medical-600 focus:ring-medical-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Signature</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="radio"
                        name="verificationType"
                        value="aadhaar"
                        checked={verificationType === 'aadhaar'}
                        onChange={(e) => setVerificationType(e.target.value as 'signature' | 'aadhaar')}
                        className="w-4 h-4 text-medical-600 focus:ring-medical-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Aadhaar Card</span>
                    </label>
                  </div>

                  {/* Aadhaar Last 4 Digits (only show when Aadhaar selected) */}
                  {verificationType === 'aadhaar' && (
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <Label htmlFor="aadhaar_last4" className="text-blue-900">Last 4 Digits of Aadhaar *</Label>
                      <Input
                        id="aadhaar_last4"
                        type="text"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        value={aadhaarLast4}
                        onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter last 4 digits (e.g., 7481)"
                        required={verificationType === 'aadhaar'}
                        className="mt-2 bg-white"
                      />
                      <p className="text-xs text-blue-700 mt-2 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        We'll verify this matches your Aadhaar card
                      </p>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all hover:border-medical-400 hover:bg-blue-50/30 group">
                    {!signaturePreview ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {verificationType === 'signature'
                              ? 'Upload Patient Consent Document'
                              : 'Upload Aadhaar Card'}
                          </h4>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                            {verificationType === 'signature'
                              ? 'Upload a signed consent form, signature document, or authorization letter'
                              : 'Upload a clear scan or photo of patient\'s Aadhaar card (front side only). Supports both color and black & white.'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label htmlFor="signature-upload">
                          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-medical-600 text-primary-foreground hover:bg-medical-700 h-10 px-4 py-2 cursor-pointer shadow-md hover:shadow-lg transform active:scale-95 duration-200">
                            <Upload className="h-4 w-4 mr-2" />
                            {verificationType === 'signature' ? 'Choose Signature File' : 'Choose Aadhaar Card'}
                          </div>
                        </label>
                        <p className="text-xs text-gray-400 mt-3">
                          Supported formats: JPEG, PNG (Max 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {verificationType === 'signature' ? 'Signature' : 'Aadhaar'} Uploaded Successfully
                          </h4>
                          <p className="text-gray-500 mb-4 text-sm truncate max-w-xs mx-auto">
                            {signatureFile?.name}
                          </p>
                        </div>
                        <div className="mb-6 relative inline-block group-hover:shadow-md transition-shadow rounded-lg overflow-hidden">
                          <img
                            src={signaturePreview}
                            alt={verificationType === 'signature' ? 'Signature preview' : 'Aadhaar preview'}
                            className="max-w-xs max-h-48 object-contain bg-white"
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSignatureFile(null);
                              setSignaturePreview(null);
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Change File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-6 border-t border-gray-100 mb-4 md:mb-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-medical-600 hover:bg-medical-700 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all whitespace-normal h-auto py-3"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Register Patient with Blockchain Verification</span>
                        <span className="sm:hidden">Register & Verify</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}


        {/* Step 2: Registration Complete */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-center justify-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                Registration Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-6">
                <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Patient Successfully Registered!
                  </h3>
                  <p className="text-gray-600">
                    {formData.full_name} has been successfully registered with complete blockchain verification.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Verification Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">OCR Verified</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700">IPFS Stored</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-700">Blockchain Verified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                    Patient ID: {registeredPatientId}
                  </Badge>
                  {signatureStatus.blockchainTxHash && (
                    <div>
                      <Badge variant="outline" className="text-xs">
                        Blockchain TX: {signatureStatus.blockchainTxHash.substring(0, 20)}...
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Organ Needed: {formData.organ_needed}
                    </Badge>
                    <Badge className={`text-xs ${formData.urgency_level === 'critical' ? 'bg-red-500 text-white' :
                      formData.urgency_level === 'high' ? 'bg-orange-500 text-white' :
                        formData.urgency_level === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-blue-500 text-white'
                      }`}>
                      {formData.urgency_level.toUpperCase()} Priority
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => navigate("/hospital/patients")}
                    className="bg-medical-600 hover:bg-medical-700"
                    size="lg"
                  >
                    View All Patients
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="lg"
                  >
                    Register Another Patient
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HospitalLayout>
  );
}
