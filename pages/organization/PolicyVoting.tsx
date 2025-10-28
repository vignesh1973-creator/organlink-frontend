import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Vote,
  Plus,
  FileText,
  AlertTriangle,
  TrendingUp,
  Shield,
  Globe,
} from "lucide-react";
import { useOrganizationAuth } from "@/contexts/OrganizationAuthContext";
import { useToast } from "@/contexts/ToastContext";
import OrganizationLayout from "@/components/organization/OrganizationLayout";

interface Policy {
  id: number;
  title: string;
  description: string;
  proposer: string;
  yesVotes: number;
  noVotes: number;
  isActive: boolean;
  isApproved: boolean;
  totalVotes: number;
  user_vote?: {
    vote: boolean;
    voted_at: string;
  };
  can_vote: boolean;
  voting_progress: {
    total_votes: number;
    yes_percentage: number;
    no_percentage: number;
  };
}

export default function PolicyVoting() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "approved" | "propose">("active");
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
  });
  const [voting, setVoting] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);

  const { organization } = useOrganizationAuth();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("organization_token");
      const response = await fetch("/api/organization/policies/blockchain/policies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
        if (data.blockchain_connected) {
          showInfo("Connected to blockchain policy system");
        }
      } else {
        showError("Failed to load policies");
      }
    } catch (error) {
      console.error("Policy fetch error:", error);
      showError("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  const proposePolicy = async () => {
    if (!proposalForm.title.trim() || !proposalForm.description.trim()) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setProposing(true);
      const token = localStorage.getItem("organization_token");
      const response = await fetch("/api/organization/policies/blockchain/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(proposalForm),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(`Policy proposed successfully! Policy ID: ${data.policy_id}`);
        setProposalForm({ title: "", description: "" });
        setActiveTab("active");
        await fetchPolicies();
      } else {
        showError(data.error || "Failed to propose policy");
      }
    } catch (error) {
      console.error("Propose policy error:", error);
      showError("Failed to propose policy");
    } finally {
      setProposing(false);
    }
  };

  const voteOnPolicy = async (policyId: number, vote: boolean) => {
    try {
      setVoting(policyId.toString());
      const token = localStorage.getItem("organization_token");
      const response = await fetch(`/api/organization/policies/blockchain/${policyId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(`Vote ${vote ? 'Yes' : 'No'} submitted successfully!`);
        await fetchPolicies();
      } else {
        showError(data.error || "Failed to submit vote");
      }
    } catch (error) {
      console.error("Vote error:", error);
      showError("Failed to submit vote");
    } finally {
      setVoting(null);
    }
  };

  const getStatusBadge = (policy: Policy) => {
    if (policy.isApproved) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (policy.isActive) {
      return <Badge className="bg-blue-100 text-blue-800">Voting Active</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>;
  };

  const getVoteBadge = (policy: Policy) => {
    if (!policy.user_vote) return null;
    
    return policy.user_vote.vote ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        You Voted Yes
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        You Voted No
      </Badge>
    );
  };

  const activePolicies = policies.filter(p => p.isActive);
  const approvedPolicies = policies.filter(p => p.isApproved);

  if (loading) {
    return (
      <OrganizationLayout title="Policy Voting" subtitle="Blockchain-powered global policy collaboration">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Policy Voting" subtitle="Global collaboration on organ donation policies">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Vote className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{activePolicies.length}</p>
                  <p className="text-sm text-gray-600">Active Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{approvedPolicies.length}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{policies.length}</p>
                  <p className="text-sm text-gray-600">Total Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {policies.filter(p => p.user_vote).length}
                  </p>
                  <p className="text-sm text-gray-600">Your Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active Voting ({activePolicies.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Policies ({approvedPolicies.length})
            </TabsTrigger>
            <TabsTrigger value="propose">
              Propose Policy
            </TabsTrigger>
          </TabsList>

          {/* Active Voting Tab */}
          <TabsContent value="active" className="space-y-4">
            {activePolicies.length > 0 ? (
              activePolicies.map((policy) => (
                <Card key={policy.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{policy.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Policy ID: {policy.id} • Proposed by blockchain system
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(policy)}
                        {getVoteBadge(policy)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{policy.description}</p>
                    
                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Yes: {policy.yesVotes}</span>
                        <span>No: {policy.noVotes}</span>
                        <span>Total: {policy.totalVotes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-l-full"
                          style={{ width: `${policy.voting_progress.yes_percentage}%` }}
                        ></div>
                        <div
                          className="bg-red-500 h-2 rounded-r-full -mt-2 ml-auto"
                          style={{ width: `${policy.voting_progress.no_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Vote Buttons */}
                    {policy.can_vote ? (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => voteOnPolicy(policy.id, true)}
                          disabled={voting === policy.id.toString()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {voting === policy.id.toString() ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Vote Yes
                        </Button>
                        <Button
                          onClick={() => voteOnPolicy(policy.id, false)}
                          disabled={voting === policy.id.toString()}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          {voting === policy.id.toString() ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Vote No
                        </Button>
                      </div>
                    ) : policy.user_vote ? (
                      <p className="text-sm text-gray-500">
                        You voted {policy.user_vote.vote ? 'Yes' : 'No'} on{' '}
                        {new Date(policy.user_vote.voted_at).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Voting is closed</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Votes</h3>
                  <p className="text-gray-600">There are currently no policies open for voting.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Approved Policies Tab */}
          <TabsContent value="approved" className="space-y-4">
            {approvedPolicies.length > 0 ? (
              approvedPolicies.map((policy) => (
                <Card key={policy.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          {policy.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Policy ID: {policy.id} • Approved with {policy.voting_progress.yes_percentage}% support
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Active in AI System
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{policy.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✅ This policy is now active and being applied to hospital AI matching systems worldwide.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Policies</h3>
                  <p className="text-gray-600">No policies have been approved yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Propose Policy Tab */}
          <TabsContent value="propose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Propose New Policy
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Submit a new policy for global voting by all registered organizations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Policy Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Same-State Kidney Donation Priority Policy"
                    value={proposalForm.title}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, title: e.target.value })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Policy Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the policy, its purpose, and how it should be implemented..."
                    rows={6}
                    value={proposalForm.description}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Policy Impact</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Approved policies will be automatically applied to hospital AI matching systems worldwide,
                        affecting organ allocation decisions across all participating hospitals.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={proposePolicy}
                  disabled={proposing || !proposalForm.title.trim() || !proposalForm.description.trim()}
                  className="w-full"
                >
                  {proposing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting to Blockchain...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Propose Policy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {/* Example Policy Card */}
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="text-base text-gray-700">💡 Example Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> Same-State Kidney Donation Priority Policy</p>
                  <p><strong>Description:</strong> To reduce organ transportation delays and improve organ viability, all kidney donation matches should prioritize donors and patients within the same state. Cross-state matches will only be considered if no suitable donor is available locally.</p>
                  <p className="text-gray-600 italic">This policy would boost match scores for same-state kidney donors by +10 points in the AI matching algorithm.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}