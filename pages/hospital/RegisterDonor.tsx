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
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";

interface DonorFormData {
  full_name: string;
  age: number;
  gender: string;
  blood_type: string;
  organs_to_donate: string[];
  medical_history: string;
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

export default function RegisterDonor() {
  const [formData, setFormData] = useState<DonorFormData>({
    full_name: "",
    age: 0,
    gender: "",
    blood_type: "",
    organs_to_donate: [],
    medical_history: "",
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
  const [registeredDonorId, setRegisteredDonorId] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<'signature' | 'aadhaar'>('signature');
  const [aadhaarLast4, setAadhaarLast4] = useState('');

  const { hospital } = useHospitalAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (
    field: keyof DonorFormData,
    value: string | number | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrganToggle = (organ: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      organs_to_donate: checked
        ? [...prev.organs_to_donate, organ]
        : prev.organs_to_donate.filter((o) => o !== organ),
    }));
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
    const requiredFields = ['full_name', 'age', 'gender', 'blood_type', 'contact_phone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof DonorFormData]);
    
    if (missingFields.length > 0) {
      showError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (formData.age < 18 || formData.age > 80) {
      showError('Donor age must be between 18 and 80 years');
      return false;
    }
    
    if (formData.organs_to_donate.length === 0) {
      showError('Please select at least one organ to donate');
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

    if (!registeredDonorId) {
      showError("Please register donor details first");
      return;
    }

    setSignatureStatus((prev) => ({ ...prev, uploading: true }));

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append("signature", file);
      formDataForUpload.append("record_type", "donor");
      formDataForUpload.append("record_id", registeredDonorId);
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
      } catch {}
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

        // Update donor record with IPFS hash and verification flag
        await updateDonorSignature(
          registeredDonorId,
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

  const updateDonorSignature = async (
    donorId: string,
    ipfsHash: string,
    verified: boolean,
  ) => {
    try {
      const token = localStorage.getItem("hospital_token");
      await fetch(`/api/hospital/donors/${donorId}/signature`, {
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
      console.error("Failed to update donor signature:", error);
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
          record_type: "donor",
          record_id: registeredDonorId,
          ipfs_hash: signatureStatus.ipfsHash,
          doc_hash: signatureStatus.docHash,
          ocr_score_bps: signatureStatus.ocrScoreBps,
          verified: signatureStatus.ocrVerified,
        }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {}
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

        showSuccess("Donor registered on blockchain successfully!");
        setTimeout(() => {
          navigate("/hospital/donors");
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
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add calculated fields for backend compatibility
      const birthYear = new Date().getFullYear() - formData.age;
      formDataToSend.append('date_of_birth', `${birthYear}-01-01`); // Approximate DOB
      formDataToSend.append('national_id', `DON_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`); // Generated ID
      
      // Add signature file and verification type
      formDataToSend.append('signature', signatureFile);
      formDataToSend.append('verification_type', verificationType);
      
      // Add Aadhaar last 4 digits if Aadhaar verification
      if (verificationType === 'aadhaar') {
        formDataToSend.append('aadhaar_last4', aadhaarLast4);
      }
      
      console.log(`Submitting donor registration with ${verificationType}...`);
      
      const response = await fetch("/api/hospital/donors/register", {
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
        setRegisteredDonorId(result.donor.donor_id);
        setSignatureStatus(prev => ({
          ...prev,
          ipfsHash: result.verification.ipfsCID,
          blockchainTxHash: result.verification.blockchainHash,
          ocrVerified: result.verification.ocrVerified,
        }));
        showSuccess("Donor registered successfully with blockchain verification!");
        setCurrentStep(2); // Go directly to completion step
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showError(error.message || "Failed to register donor");
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
    "Skin",
    "Bone",
  ];

  return (
    <HospitalLayout
      title="Register Donor"
      subtitle="Complete donor registration with blockchain verification"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Register New Donor</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Complete donor information and signature verification</p>
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
              <span className="text-xs sm:text-sm font-medium">Donor Details & Signature</span>
            </div>
            <div className="hidden sm:flex flex-1 h-0.5 bg-gray-200 max-w-32"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200"
              }`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Registration Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Donor Details Form */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Donor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                        placeholder="Enter donor's full name"
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
                          min="18"
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
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

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
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    <div>
                      <Label>Organs to Donate *</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {organTypes.map((organ) => (
                          <div
                            key={organ}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={organ}
                              checked={formData.organs_to_donate.includes(
                                organ,
                              )}
                              onCheckedChange={(checked) =>
                                handleOrganToggle(organ, checked as boolean)
                              }
                            />
                            <Label htmlFor={organ} className="text-sm">
                              {organ}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medical_history">Medical History</Label>
                      <Textarea
                        id="medical_history"
                        value={formData.medical_history}
                        onChange={(e) =>
                          handleInputChange("medical_history", e.target.value)
                        }
                        placeholder="Any relevant medical history or conditions"
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
                        placeholder="donor@example.com"
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
                        placeholder="Guardian full name"
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

                    {/* Document Upload with Type Selection */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="signature">Upload Document *</Label>
                        <div className="flex gap-4 mt-2 mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="verificationType"
                              value="signature"
                              checked={verificationType === 'signature'}
                              onChange={(e) => {
                                setVerificationType(e.target.value as 'signature' | 'aadhaar');
                                setAadhaarLast4(''); // Clear Aadhaar field
                              }}
                              className="w-4 h-4 text-medical-600"
                            />
                            <span className="text-sm font-medium">Signature</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="verificationType"
                              value="aadhaar"
                              checked={verificationType === 'aadhaar'}
                              onChange={(e) => setVerificationType(e.target.value as 'signature' | 'aadhaar')}
                              className="w-4 h-4 text-medical-600"
                            />
                            <span className="text-sm font-medium">Aadhaar Card</span>
                          </label>
                        </div>

                        {/* Aadhaar Last 4 Digits (only show when Aadhaar selected) */}
                        {verificationType === 'aadhaar' && (
                          <div className="mb-3">
                            <Label htmlFor="aadhaar_last4">Last 4 Digits of Aadhaar *</Label>
                            <Input
                              id="aadhaar_last4"
                              type="text"
                              maxLength={4}
                              pattern="[0-9]{4}"
                              value={aadhaarLast4}
                              onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter last 4 digits (e.g., 7481)"
                              required={verificationType === 'aadhaar'}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              We'll verify this matches your Aadhaar card
                            </p>
                          </div>
                        )}

                        <Input
                          id="signature"
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          required
                          className="mt-1"
                        />
                        {signaturePreview && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Preview:</p>
                            <img
                              src={signaturePreview}
                              alt={verificationType === 'signature' ? 'Signature preview' : 'Aadhaar preview'}
                              className="max-w-xs max-h-32 object-contain border border-gray-300 rounded"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {verificationType === 'signature'
                            ? '📝 Upload a clear signature image (for demo/testing)'
                            : '🪪 Upload Aadhaar card (front side) for verification'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || formData.organs_to_donate.length === 0
                    }
                    className="bg-medical-600 hover:bg-medical-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register Donor with Blockchain Verification"
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
                    Donor Successfully Registered!
                  </h3>
                  <p className="text-gray-600">
                    {formData.full_name} has been successfully registered with complete blockchain verification.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Verification Summary</h4>
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
                    Donor ID: {registeredDonorId}
                  </Badge>
                  {signatureStatus.blockchainTxHash && (
                    <div>
                      <Badge variant="outline" className="text-xs">
                        Blockchain TX: {signatureStatus.blockchainTxHash.substring(0, 20)}...
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {formData.organs_to_donate.map((organ, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                        {organ}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => navigate("/hospital/donors")}
                    className="bg-medical-600 hover:bg-medical-700"
                    size="lg"
                  >
                    View All Donors
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="lg"
                  >
                    Register Another Donor
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
