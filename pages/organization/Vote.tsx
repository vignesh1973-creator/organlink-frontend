import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import OrganizationLayout from "@/components/organization/OrganizationLayout";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, FileText, BarChart } from "lucide-react";
import { VoteSkeleton } from "@/components/ui/skeletons";

export default function Vote() {
  const [proposalId, setProposalId] = useState<string>("");
  const [tx, setTx] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(1); // First policy expanded by default
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock policies data
  const policies = [
    {
      id: 1,
      title: "Pediatric Priority Policy",
      description: "Prioritize organ allocation for patients under 18 years old",
      organization: "Global Transplant Alliance",
      policyId: "POL001",
      status: "ACTIVE",
      organ: "KIDNEY",
      approval: 63,
      votesFor: 6,
      votesAgainst: 2,
      totalVotes: 10,
      deadline: "3 days left",
      problemSolved: "Current allocation system does not prioritize pediatric patients, leading to longer wait times for children.",
      expectedImpact: "Reduced waiting times for pediatric patients, improved outcomes for children, better alignment with medical ethics.",
      technicalParams: '{"age":"< 18", "urgency_weight": "0.4", "compatibility_weight": "0.5"}'
    },
    {
      id: 2,
      title: "Geographic Proximity Rule",
      description: "Prioritize local patients within 500km radius",
      organization: "EuroTransplant International",
      policyId: "POL002",
      status: "PENDING",
      organ: "LIVER",
      approval: 75,
      votesFor: 9,
      votesAgainst: 3,
      totalVotes: 12,
      deadline: "5 days left",
      problemSolved: "Current system doesn't consider geographic proximity, leading to unnecessary transport costs and delays.",
      expectedImpact: "Reduced transport time and costs, faster organ delivery, improved organ viability.",
      technicalParams: '{"distance_weight": "0.6", "urgency_weight": "0.4"}',
      votedFor: true
    },
    {
      id: 3,
      title: "AI Matching Enhancement",
      description: "Implementation of advanced AI algorithms for better organ-recipient matching",
      organization: "Medical AI Consortium",
      policyId: "POL003",
      status: "VOTING",
      organ: "HEART",
      approval: 88,
      votesFor: 15,
      votesAgainst: 2,
      totalVotes: 17,
      deadline: "7 days left",
      problemSolved: "Current matching algorithms are not optimal, leading to suboptimal organ-recipient pairings.",
      expectedImpact: "Improved matching accuracy, better patient outcomes, reduced organ waste.",
      technicalParams: '{"ai_model_version": "2.1", "compatibility_threshold": "0.85"}'
    }
  ];

  const togglePolicyDetails = (policyId: number) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
  };

  async function vote(v: 1 | 2 | 3) {
    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch("/api/organization/policies/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposal_id: Number(proposalId), vote: v }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setTx(data.txHash);
    } catch (e: any) {
      alert(e.message || "Failed");
    }
  }

  return (
    <OrganizationLayout>
      {isLoading ? (
        <VoteSkeleton />
      ) : (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl px-8 py-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Vote on Policies</h1>
          <p className="text-blue-100">Review and vote on active policy proposals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Voting Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Cards */}
            {policies.map((policy) => (
              <Card key={policy.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          className={`${
                            policy.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : policy.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          }`}
                        >
                          {policy.status}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{policy.organ}</Badge>
                        {policy.votedFor && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Voted For</Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{policy.title}</h2>
                      <p className="text-gray-600 mb-2">{policy.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>🏢 {policy.organization}</span>
                        <span>📋 ID: {policy.policyId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Rating */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Approval Rating</span>
                      <span className="text-sm text-gray-600">{policy.totalVotes}/20 votes ({policy.approval}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${policy.approval}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{policy.votesFor} for</span>
                      <span>{policy.votesAgainst} against</span>
                    </div>
                  </div>

                  {/* Voting Deadline */}
                  <div className="flex items-center text-sm text-gray-600 mb-6">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Voting deadline: </span>
                    <span className="ml-1 font-medium">{policy.deadline}</span>
                  </div>

                  {/* Voting Actions */}
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => vote(1)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={policy.votedFor}
                      >
                        ✅ Vote For
                      </Button>
                      <Button 
                        onClick={() => vote(2)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        disabled={policy.votedFor}
                      >
                        ❌ Against
                      </Button>
                    </div>
                    <Button 
                      onClick={() => togglePolicyDetails(policy.id)}
                      variant="outline" 
                      className="w-full"
                    >
                      {expandedPolicy === policy.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>

                  {/* Expandable Policy Details */}
                  {expandedPolicy === policy.id && (
                    <div className="mt-6 space-y-4">
                      <div className="border-t pt-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Problem Solved</h3>
                        <p className="text-sm text-gray-600">{policy.problemSolved}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Expected Impact</h3>
                        <p className="text-sm text-gray-600">{policy.expectedImpact}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Technical Parameters</h3>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800">
                          {policy.technicalParams}
                        </div>
                      </div>

                      {/* Voting Comment - Only show for active/expanded policy */}
                      {policy.id === 1 && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Voting Comment (Optional)
                          </label>
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment about your vote..."
                            className="min-h-20"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {tx && policy.id === 1 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="text-sm text-green-700 break-all">
                        <span className="font-medium">Transaction Hash: </span>
                        <a
                          className="underline hover:text-green-800"
                          target="_blank"
                          href={`https://sepolia.etherscan.io/tx/${tx}`}
                        >
                          {tx}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Guidelines */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Voting Guidelines</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">How Voting Works</p>
                      <ul className="text-gray-600 space-y-1 mt-1">
                        <li>• Policies need ≥ 50% approval to become active</li>
                        <li>• Your vote is recorded on blockchain</li>
                        <li>• Active policies influence AI algorithms</li>
                        <li>• Voting closes at the deadline</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consider When Voting */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Consider When Voting:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Patient safety and outcomes</li>
                  <li>• Implementation feasibility</li>
                  <li>• Impact on your region</li>
                  <li>• Scientific evidence provided</li>
                  <li>• Alignment with medical ethics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Voting Statistics */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Voting Statistics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Active Policies</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending Your Vote</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Your Votes Cast</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Participation Rate</span>
                    <span className="font-semibold">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}
    </OrganizationLayout>
  );
}
