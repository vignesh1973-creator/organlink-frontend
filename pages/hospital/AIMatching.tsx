import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Heart,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Bell,
  MapPin,
  Phone,
} from "lucide-react";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";
import { formatToIST } from "@/utils/date";

interface Patient {
  patient_id: string;
  full_name: string;
  blood_type: string;
  organ_needed: string;
  urgency_level: string;
  age: number;
}

interface DonorMatch {
  donor_id: string;
  donor_name: string;
  blood_type: string;
  organs_available: string[];
  hospital_id: string;
  hospital_name: string;
  match_score: number;
  distance_score: number;
  compatibility_score: number;
  urgency_bonus: number;
  medical_risk_score: number;
  explanation?: string;
}

interface IncomingMatch {
  id: string;
  notification_id: string;
  title: string;
  message: string;
  patient_id?: string;
  organ_type?: string;
  blood_type?: string;
  urgency_level?: string;
  requesting_hospital_name?: string;
  created_at?: string;
  metadata?: Record<string, any> | null;
  is_read?: boolean;
}

export default function AIMatching() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [incomingMatches, setIncomingMatches] = useState<IncomingMatch[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [policyApplied, setPolicyApplied] = useState(false);
  const [policyTitle, setPolicyTitle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "incoming" | "outgoing" | "received">("search");
  const [focusedRequestId, setFocusedRequestId] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
    null,
  );
  const [requestingMatchFor, setRequestingMatchFor] = useState<string | null>(
    null,
  );

  const location = useLocation();
  const navigate = useNavigate();

  const { hospital } = useHospitalAuth();
  const {
    error: showError,
    success: showSuccess,
    warning: showWarning,
  } = useToast();

  useEffect(() => {
    fetchPatients();
    fetchIncomingMatches();
    fetchOutgoingRequests();
    fetchReceivedRequests();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "incoming" || tabParam === "search" || tabParam === "outgoing" || tabParam === "received") {
      setActiveTab(tabParam as "search" | "incoming" | "outgoing" | "received");
    } else {
      setActiveTab("search");
    }
    const requestParam = params.get("request");
    setFocusedRequestId(requestParam);
  }, [location.search]);

  const updateQueryParams = (updates: {
    tab?: "search" | "incoming" | "outgoing" | "received";
    request?: string | null;
  }) => {
    const params = new URLSearchParams(location.search);
    if (updates.tab) {
      params.set("tab", updates.tab);
    }
    if (updates.request !== undefined) {
      if (updates.request) {
        params.set("request", updates.request);
      } else {
        params.delete("request");
      }
    }

    const newSearch = params.toString();
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;

    if (newSearch === currentSearch) {
      return;
    }

    navigate(
      { pathname: location.pathname, search: newSearch },
      { replace: true },
    );
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Only show patients in 'Waiting' status for AI matching (include all urgency levels)
        setPatients(
          data.patients.filter((p: any) =>
            (!p.status || p.status === "Waiting")
          ),
        );
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const getRequestId = (match: IncomingMatch) => {
    const metadata =
      match.metadata && typeof match.metadata === "object"
        ? match.metadata
        : null;
    return (
      (metadata && (metadata.request_id || metadata.requestId)) ||
      (match as any).related_id ||
      match.notification_id ||
      match.id
    );
  };

  const fetchIncomingMatches = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/matching/incoming-matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = (data.incoming_matches || []).map(
          (match: IncomingMatch) => {
            let metadata = match.metadata ?? null;
            if (typeof metadata === "string" && metadata.trim()) {
              try {
                metadata = JSON.parse(metadata);
              } catch {
                metadata = null;
              }
            }
            return {
              ...match,
              metadata,
            };
          },
        );
        setIncomingMatches(normalized);
        if (
          focusedRequestId &&
          !normalized.some(
            (match: IncomingMatch) => getRequestId(match) === focusedRequestId,
          )
        ) {
          setFocusedRequestId(null);
          updateQueryParams({ request: null });
        }
      }
    } catch (error) {
      console.error("Failed to fetch incoming matches:", error);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/matching/outgoing-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOutgoingRequests(data.outgoing_requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch outgoing requests:", error);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/matching/received-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReceivedRequests(data.received_requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch received requests:", error);
    }
  };

  const searchMatches = async (patient: Patient) => {
    setSearchingMatches(true);
    setSelectedPatient(patient);
    setMatches([]);

    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/matching/enhanced-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.patient_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        setPolicyApplied(Boolean(data.policy_applied));
        setPolicyTitle(data.policy_title || null);
        if (data.total_matches === 0) {
          showWarning("No matches found for this patient");
        } else {
          showSuccess(
            `Found ${data.total_matches} potential matches using Enhanced AI Algorithm${data.policy_applied ? " with Policy Applied" : ""}!`,
          );
        }
      } else {
        showError(data.error || "Failed to search matches");
      }
    } catch (error) {
      console.error("Search matches error:", error);
      showError("Failed to search matches");
    } finally {
      setSearchingMatches(false);
    }
  };

  const createMatchingRequest = async (patient: Patient, match: DonorMatch) => {
    try {
      setRequestingMatchFor(match.donor_id); // Use donor_id to track specific request
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/matching/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          donor_id: match.donor_id,
          donor_hospital_id: match.hospital_id,
          notes: `Request for ${patient.organ_needed} for ${patient.urgency_level.toLowerCase()} priority patient ${patient.full_name}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSuccess(data.message || "Match request sent successfully! Patient status updated to 'In Progress'.");
        // Refresh all data
        await fetchPatients();
        await fetchOutgoingRequests();
        await fetchReceivedRequests();
        // Navigate to My Requests tab to show the sent request
        updateQueryParams({ tab: "outgoing" });
        setActiveTab("outgoing");
      } else {
        showError(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Create request error:", error);
      showError(error instanceof Error ? error.message : "Failed to send request");
    } finally {
      setRequestingMatchFor(null);
    }
  };

  const respondToMatch = async (
    match: IncomingMatch,
    response: "accept" | "reject",
    donorId?: string,
  ) => {
    const requestId = getRequestId(match);
    if (!requestId) {
      showError("Unable to identify the match request");
      return;
    }

    try {
      setRespondingRequestId(requestId);
      const token = localStorage.getItem("hospital_token");
      const res = await fetch(`/api/hospital/matching/requests/${requestId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: response === "accept" ? "accepted" : "rejected",
          response_notes: response === "accept"
            ? "Request accepted by donor hospital"
            : "Request declined by donor hospital",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(
          errBody?.error || `Response failed with status ${res.status}`,
        );
      }

      const data = await res.json();

      if (data.success) {
        if (response === "accept") {
          showSuccess("✅ Request accepted! Patient and donor statuses have been updated to 'Matched'.");
        } else {
          showSuccess("Request declined. Patient is now available for other matches.");
        }

        // Mark notification as read
        try {
          await fetch(`/api/hospital/notifications/${match.notification_id}/read`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error("Failed to mark notification as read:", err);
        }

        updateQueryParams({ request: null });
        setFocusedRequestId(null);
        await fetchIncomingMatches();
        await fetchReceivedRequests();
        await fetchOutgoingRequests();
      } else {
        showError(data.error || "Failed to respond");
      }
    } catch (error) {
      console.error("Respond to match error:", error);
      showError(
        error instanceof Error ? error.message : "Failed to respond to match",
      );
    } finally {
      setRespondingRequestId(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <HospitalLayout
      title="AI Organ Matching"
      subtitle="Advanced AI-powered organ matching system"
    >
      <div className="max-w-7xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={async (value) => {
            const next = (value === "incoming" || value === "outgoing" || value === "received") ? value : "search";
            setActiveTab(next as "search" | "incoming" | "outgoing" | "received");
            updateQueryParams({
              tab: next as "search" | "incoming" | "outgoing" | "received",
              request: next === "incoming" ? focusedRequestId : null,
            });

            // Mark all notifications as read when viewing incoming tab
            if (next === "incoming" && incomingMatches.length > 0) {
              const token = localStorage.getItem("hospital_token");
              const unreadNotifs = incomingMatches.filter(m => !m.is_read);
              for (const match of unreadNotifs) {
                try {
                  await fetch(`/api/hospital/notifications/${match.notification_id}/read`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (err) {
                  console.error("Failed to mark notification as read:", err);
                }
              }
              // Refresh incoming matches to update is_read status
              await fetchIncomingMatches();
            }

            // Mark all received requests as viewed when opening Received tab
            if (next === "received") {
              const token = localStorage.getItem("hospital_token");
              try {
                await fetch("/api/hospital/matching/mark-received-viewed", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                // Refresh received requests to update is_viewed status
                await fetchReceivedRequests();
              } catch (err) {
                console.error("Failed to mark received requests as viewed:", err);
              }
            }
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1">
            <TabsTrigger value="search" className="text-xs sm:text-sm py-2 sm:py-3 whitespace-normal h-full">Find Matches</TabsTrigger>
            <TabsTrigger value="incoming" className="relative text-xs sm:text-sm py-2 sm:py-3 whitespace-normal h-full">
              Incoming
              {incomingMatches.filter(m => !m.is_read).length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-red-100 text-red-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {incomingMatches.filter(m => !m.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="relative text-xs sm:text-sm py-2 sm:py-3 whitespace-normal h-full">
              <span className="hidden sm:inline">My Requests</span>
              <span className="sm:hidden">Requests</span>
              {outgoingRequests.filter((r: any) => r.status === 'pending').length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {outgoingRequests.filter((r: any) => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="received" className="relative text-xs sm:text-sm py-2 sm:py-3 whitespace-normal h-full">
              Received
              {receivedRequests.filter((r: any) => r.is_viewed === false).length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  {receivedRequests.filter((r: any) => r.is_viewed === false).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Find Matches Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Select Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <div
                        key={patient.patient_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPatient?.patient_id === patient.patient_id
                          ? "border-medical-600 bg-medical-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => searchMatches(patient)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                              {patient.full_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Age: {patient.age} • Blood: {patient.blood_type}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <Badge
                              className={`${getUrgencyColor(patient.urgency_level)} text-xs`}
                            >
                              {patient.urgency_level}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {patient.organ_needed}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No patients requiring organs found
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Match Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Match Results
                    {searchingMatches && (
                      <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-medical-600"></div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient ? (
                    <div className="space-y-4">
                      {/* Patient Info Card */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                              👤 {selectedPatient.organ_needed} • {selectedPatient.blood_type}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-700">
                              {selectedPatient.full_name} • Age: {selectedPatient.age} • {selectedPatient.urgency_level}
                            </p>
                          </div>
                          {policyApplied && (
                            <div>
                              <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-green-500 text-white text-[10px] sm:text-xs font-semibold shadow-md">
                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full animate-pulse mr-1.5 sm:mr-2"></div>
                                Active Policy
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Active Policies Information Panel */}
                      {policyApplied && policyTitle && (
                        <div className="border-2 border-green-200 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-200">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-green-500 rounded-lg">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-green-900">Active Allocation Policy Applied</h3>
                                <p className="text-xs text-green-700">Organization-approved criteria influencing match scoring</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4">
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Policy Name</p>
                              <p className="text-sm font-bold text-gray-900">{policyTitle}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div className="bg-gray-50 rounded p-2">
                                <p className="text-xs text-gray-500 mb-1">Organ Type</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedPatient.organ_needed}</p>
                              </div>
                              <div className="bg-gray-50 rounded p-2">
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <p className="text-sm font-semibold text-green-600">✓ Active & Applied</p>
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                              <p className="text-xs font-semibold text-green-900 mb-2">🎯 How This Policy Affects Matching:</p>
                              <ul className="text-xs text-green-800 space-y-1">
                                <li className="flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  <span>Adjusts weighting of blood compatibility, urgency, distance, and time factors</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  <span>Ensures fair allocation according to medical best practices</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  <span>Donor prioritization based on organization-voted criteria</span>
                                </li>
                              </ul>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                <span className="font-semibold">Note:</span> Multiple active policies for the same organ type are combined intelligently. The AI considers all applicable policies to ensure optimal donor-patient matching.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Policy Message */}
                      {!policyApplied && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-200 rounded-lg flex-shrink-0">
                              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 mb-1">Standard AI Matching</p>
                              <p className="text-xs text-gray-600">No specific allocation policy active for {selectedPatient.organ_needed}. Using default algorithm weights.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {matches.length > 0 ? (
                        <div className="space-y-3">
                          {matches.slice(0, 5).map((match, index) => (
                            <div
                              key={match.donor_id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {match.donor_name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {match.hospital_name} • {match.blood_type}
                                  </p>
                                </div>
                                <Badge
                                  className={getMatchScoreColor(
                                    match.match_score,
                                  )}
                                >
                                  {match.match_score}% Match
                                </Badge>
                              </div>

                              <div className="space-y-2 mb-3">
                                {/* Overall Score Breakdown */}
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Match Breakdown</span>
                                    <Badge className={getMatchScoreColor(match.match_score)}>
                                      Overall: {match.match_score}%
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="flex flex-col bg-white rounded p-2">
                                      <span className="text-gray-500 font-medium mb-1">🩸 Blood Compatibility</span>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{match.compatibility_score}%</span>
                                        <span className="text-[10px] text-gray-400">(40% weight)</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col bg-white rounded p-2">
                                      <span className="text-gray-500 font-medium mb-1">📍 Location Distance</span>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-medical-600">{match.distance_score}%</span>
                                        <span className="text-[10px] text-gray-400">(20% weight)</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col bg-white rounded p-2">
                                      <span className="text-gray-500 font-medium mb-1">🚨 Urgency Priority</span>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{match.urgency_bonus}%</span>
                                        <span className="text-[10px] text-gray-400">(30% weight)</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col bg-white rounded p-2">
                                      <span className="text-gray-500 font-medium mb-1">⏱️ Time Factor</span>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{match.medical_risk_score || '100'}%</span>
                                        <span className="text-[10px] text-gray-400">(10% weight)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Policy Influence Indicator */}
                                {policyApplied && (
                                  <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                      <p className="text-xs text-green-900 font-medium">
                                        ✅ Active Policy Applied: {policyTitle || "Custom Allocation Policy"}
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-green-700 mt-1 ml-4">
                                      Scoring adjusted according to organization-approved allocation criteria
                                    </p>
                                  </div>
                                )}

                                {match.explanation && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs text-blue-900 leading-relaxed">
                                      <strong>AI Analysis:</strong> {match.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {match.organs_available.map((organ) => (
                                  <Badge
                                    key={organ}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {organ}
                                  </Badge>
                                ))}
                              </div>

                              <Button
                                size="sm"
                                className="w-full bg-medical-600 hover:bg-medical-700"
                                onClick={() =>
                                  createMatchingRequest(selectedPatient, match)
                                }
                                disabled={requestingMatchFor === match.donor_id}
                              >
                                {requestingMatchFor === match.donor_id
                                  ? "Sending..."
                                  : "Send Match Request"}
                              </Button>
                            </div>
                          ))}

                          {matches.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              Showing top 5 of {matches.length} matches
                            </p>
                          )}
                        </div>
                      ) : (
                        !searchingMatches && (
                          <p className="text-gray-500 text-center py-8">
                            {selectedPatient
                              ? "No matches found"
                              : "Click on a patient to search for matches"}
                          </p>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Select a patient to search for matching donors
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incoming Requests Tab */}
          <TabsContent value="incoming" className="space-y-6">
            <div className="grid gap-6">
              {incomingMatches.length > 0 ? (
                incomingMatches.map((match) => {
                  const requestId = getRequestId(match);
                  const isFocused =
                    focusedRequestId && requestId === focusedRequestId;
                  const metadata =
                    match.metadata && typeof match.metadata === "object"
                      ? match.metadata
                      : {};
                  const donorMatches: any[] = Array.isArray(
                    (metadata as any).matches,
                  )
                    ? (metadata as any).matches
                    : [];
                  const primaryDonor = donorMatches[0];

                  // Extract organ needed from multiple sources
                  const organNeeded =
                    match.organ_type ||
                    metadata.organ_type ||
                    metadata.organType ||
                    metadata.organ_needed ||
                    (metadata.patient_name && metadata.matches?.[0]?.organs_available?.[0]) ||
                    (donorMatches[0]?.organs_available?.[0]) ||
                    "Not specified";

                  const bloodType =
                    match.blood_type ||
                    metadata.blood_type ||
                    metadata.bloodType ||
                    "Not specified";

                  const urgencyLevel =
                    match.urgency_level ||
                    metadata.urgency_level ||
                    metadata.urgencyLevel ||
                    metadata.urgency ||
                    "Medium";

                  const createdAt =
                    match.created_at ||
                    metadata.created_at ||
                    metadata.createdAt;

                  return (
                    <Card
                      key={requestId || match.notification_id || match.id}
                      className={
                        isFocused
                          ? "border-2 border-medical-500 shadow-lg"
                          : "border border-gray-200"
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <Bell className="h-5 w-5 text-medical-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {match.title || "Organ Match Found"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  From:{" "}
                                  {match.requesting_hospital_name ||
                                    metadata.requesting_hospital_name ||
                                    "Unknown hospital"}
                                </p>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4">
                              {match.message}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Organ Needed
                                </Label>
                                <p className="font-medium">{organNeeded}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Blood Type
                                </Label>
                                <p className="font-medium">{bloodType}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Urgency
                                </Label>
                                <Badge
                                  className={getUrgencyColor(
                                    String(urgencyLevel),
                                  )}
                                >
                                  {urgencyLevel}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Received
                                </Label>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatToIST(createdAt)}
                                </p>
                              </div>
                            </div>

                            {donorMatches.length > 0 && (
                              <div className="mb-4">
                                <Label className="text-sm font-medium text-gray-700">
                                  Your Matching Donors:
                                </Label>
                                <div className="mt-2 space-y-2">
                                  {donorMatches
                                    .slice(0, 3)
                                    .map((donor: any) => (
                                      <div
                                        key={`${donor.donor_id}-${donor.hospital_id}`}
                                        className="p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-medium">
                                              {donor.donor_name || "Donor"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {donor.blood_type || "Unknown"} •{" "}
                                              {Array.isArray(
                                                donor.organs_available,
                                              )
                                                ? donor.organs_available.join(
                                                  ", ",
                                                )
                                                : "Organs not listed"}
                                            </p>
                                          </div>
                                          {typeof donor.match_score ===
                                            "number" && (
                                              <Badge
                                                className={getMatchScoreColor(
                                                  donor.match_score,
                                                )}
                                              >
                                                {donor.match_score}% Match
                                              </Badge>
                                            )}
                                        </div>
                                        {donor.explanation && (
                                          <p className="mt-2 text-xs text-gray-500 italic">
                                            {donor.explanation}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2 ml-6 w-36">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={respondingRequestId === requestId}
                              onClick={() =>
                                respondToMatch(
                                  match,
                                  "accept",
                                  primaryDonor?.donor_id,
                                )
                              }
                            >
                              {respondingRequestId === requestId ? (
                                <span className="flex items-center justify-center gap-1 text-white">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                  Processing
                                </span>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={respondingRequestId === requestId}
                              onClick={() => respondToMatch(match, "reject")}
                            >
                              {respondingRequestId === requestId ? (
                                <span className="flex items-center justify-center gap-1">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                                  Processing
                                </span>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Incoming Requests
                    </h3>
                    <p className="text-gray-600">
                      No hospitals have requested organs from your donors yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Outgoing Requests Tab */}
          <TabsContent value="outgoing" className="space-y-6">
            <div className="grid gap-6">
              {outgoingRequests.length > 0 ? (
                outgoingRequests.map((request) => {
                  const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "accepted":
                        return "bg-green-100 text-green-800";
                      case "rejected":
                        return "bg-red-100 text-red-800";
                      case "pending":
                        return "bg-yellow-100 text-yellow-800";
                      case "completed":
                        return "bg-purple-100 text-purple-800";
                      default:
                        return "bg-gray-100 text-gray-800";
                    }
                  };

                  const getStatusIcon = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "accepted":
                        return "✅";
                      case "rejected":
                        return "❌";
                      case "pending":
                        return "⏳";
                      case "completed":
                        return "🎉";
                      default:
                        return "📋";
                    }
                  };

                  return (
                    <Card key={request.request_id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <Heart className="h-5 w-5 text-medical-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Request for {request.patient_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  To: {request.donor_hospital_name || "Unknown Hospital"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Organ Needed
                                </Label>
                                <p className="font-medium">{request.organ_needed || "Not specified"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Blood Type
                                </Label>
                                <p className="font-medium">{request.blood_type || "Not specified"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Urgency
                                </Label>
                                <Badge
                                  className={getUrgencyColor(
                                    request.urgency_level || "Unknown"
                                  )}
                                >
                                  {request.urgency_level || "Unknown"}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Status
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(request.status)}>
                                    {getStatusIcon(request.status)} {request.status || "Unknown"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">Sent</Label>
                                <p className="text-sm font-medium text-gray-900">
                                  {request.created_at_ist || formatToIST(request.created_at)}
                                </p>
                              </div>
                              {(request.updated_at_ist || (request.updated_at && request.updated_at !== request.created_at)) && (
                                <div>
                                  <Label className="text-xs text-gray-500">Last Updated</Label>
                                  <p className="text-sm font-medium text-gray-900">
                                    {request.updated_at_ist || formatToIST(request.updated_at)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {request.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <Label className="text-xs text-gray-500">Notes</Label>
                                <p className="text-sm text-gray-700 mt-1">{request.notes}</p>
                              </div>
                            )}

                            {request.response_notes && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Label className="text-xs text-blue-700 font-medium">Response from Hospital</Label>
                                <p className="text-sm text-blue-900 mt-1">{request.response_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Outgoing Requests
                    </h3>
                    <p className="text-gray-600">
                      You haven't sent any organ requests yet. Use the "Find Matches" tab to search for donors.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Received Requests Tab */}
          <TabsContent value="received" className="space-y-6">
            <div className="grid gap-6">
              {receivedRequests.length > 0 ? (
                receivedRequests.map((request) => {
                  const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "accepted":
                        return "bg-green-100 text-green-800";
                      case "rejected":
                        return "bg-red-100 text-red-800";
                      case "pending":
                        return "bg-yellow-100 text-yellow-800";
                      case "completed":
                        return "bg-purple-100 text-purple-800";
                      default:
                        return "bg-gray-100 text-gray-800";
                    }
                  };

                  const getStatusIcon = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "accepted":
                        return "✅";
                      case "rejected":
                        return "❌";
                      case "pending":
                        return "⏳";
                      case "completed":
                        return "🎉";
                      default:
                        return "📋";
                    }
                  };

                  return (
                    <Card key={request.request_id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <Bell className="h-5 w-5 text-medical-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Request from {request.requesting_hospital_name || "Unknown Hospital"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Patient: {request.patient_name} • Donor: {request.donor_name || "Not specified"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Organ Requested
                                </Label>
                                <p className="font-medium">{request.organ_needed || "Not specified"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Blood Type
                                </Label>
                                <p className="font-medium">{request.blood_type || "Not specified"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Urgency
                                </Label>
                                <Badge
                                  className={getUrgencyColor(
                                    request.urgency_level || "Unknown"
                                  )}
                                >
                                  {request.urgency_level || "Unknown"}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Status
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(request.status)}>
                                    {getStatusIcon(request.status)} {request.status || "Unknown"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">Received</Label>
                                <p className="text-sm">
                                  {request.created_at
                                    ? new Date(request.created_at).toLocaleString('en-IN', {
                                      timeZone: 'Asia/Kolkata',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                    : "Unknown"}
                                </p>
                              </div>
                              {request.updated_at && request.updated_at !== request.created_at && (
                                <div>
                                  <Label className="text-xs text-gray-500">Response Date</Label>
                                  <p className="text-sm">
                                    {new Date(request.updated_at).toLocaleString('en-IN', {
                                      timeZone: 'Asia/Kolkata',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>

                            {request.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <Label className="text-xs text-gray-500">Request Notes</Label>
                                <p className="text-sm text-gray-700 mt-1">{request.notes}</p>
                              </div>
                            )}

                            {request.response_notes && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Label className="text-xs text-green-700 font-medium">My Response</Label>
                                <p className="text-sm text-green-900 mt-1">{request.response_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Received Requests
                    </h3>
                    <p className="text-gray-600">
                      You haven't received any organ requests yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </HospitalLayout>
  );
}
