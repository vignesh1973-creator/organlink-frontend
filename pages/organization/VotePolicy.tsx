import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import OrganizationLayout from "@/components/organization/OrganizationLayout";
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ArrowLeft, FileText, Trash2, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

interface Policy {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  status: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  eligibleVoters?: number;
  voteProgress?: string;
  approval: number;
  createdAt: string;
  isMyProposal?: boolean;
  hasVoted?: boolean;
  myVote?: string;
  paused_for_matching?: boolean;
}

export default function VotePolicy() {
  const { policyId } = useParams<{ policyId: string }>();
  const { toast } = useToast();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingYes, setVotingYes] = useState(false);
  const [votingNo, setVotingNo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);

  useEffect(() => {
    fetchPolicyDetails();
  }, [policyId]);

  const fetchPolicyDetails = async () => {
    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch("/api/organization/policies/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        const allPolicies = [...data.myPolicies, ...data.otherPolicies];
        const foundPolicy = allPolicies.find((p: any) => p.id === Number(policyId));
        
        if (foundPolicy) {
          setPolicy(foundPolicy);
        } else {
          toast({
            title: "❌ Policy Not Found",
            description: "The requested policy could not be found.",
            variant: "destructive",
          });
          setTimeout(() => window.location.href = "/organization/policies", 2000);
        }
      }
    } catch (error) {
      console.error("Failed to fetch policy:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load policy details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteValue: boolean) => {
    if (voteValue) {
      setVotingYes(true);
    } else {
      setVotingNo(true);
    }
    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch("/api/organization/policies/vote-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          policy_id: policyId,
          vote: voteValue,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to vote");
      }

      toast({
        title: "✅ Vote Submitted Successfully!",
        description: `You voted ${voteValue ? "YES" : "NO"} on "${policy?.title}". Your vote has been recorded on the blockchain.`,
        variant: "default",
      });

      // Redirect to policies page after 2 seconds
      setTimeout(() => {
        window.location.href = "/organization/policies";
      }, 2000);
    } catch (error: any) {
      toast({
        title: "❌ Vote Failed",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setVotingYes(false);
      setVotingNo(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch(`/api/organization/policies/policies/${policyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete policy");
      }

      toast({
        title: "✅ Policy Deleted Successfully!",
        description: `"${policy?.title}" has been removed.`,
        variant: "default",
      });

      // Redirect to policies page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/organization/policies";
      }, 1500);
    } catch (error: any) {
      toast({
        title: "❌ Delete Failed",
        description: error.message || "Failed to delete policy",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </OrganizationLayout>
    );
  }

  if (!policy) {
    return (
      <OrganizationLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Policy not found</p>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl px-8 py-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
              onClick={() => window.location.href = "/organization/policies"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
            </Button>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {policy?.isMyProposal ? "Policy Status" : "Vote on Policy"}
          </h1>
          <p className="text-blue-100">
            {policy?.isMyProposal 
              ? "Track voting progress and status of your proposal" 
              : "Review and cast your vote on this policy proposal"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Policy Details Card */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge 
                      className={`${
                        policy.status === 'active' || policy.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : policy.status === 'voting'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }`}
                    >
                      {policy.status.toUpperCase()}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      {policy.category || 'General'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{policy.title}</CardTitle>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mt-2">
                    <span>🏢 Proposed by: {policy.proposer}</span>
                    <span>📅 {new Date(policy.createdAt).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Policy Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{policy.content || policy.description}</p>
              </div>

              {/* Current Voting Results */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Voting Results</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Votes</span>
                    <span className="font-semibold">{policy.totalVotes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all" 
                      style={{ width: `${policy.approval}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">{policy.votesFor} YES ({policy.approval}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-gray-600">{policy.votesAgainst} NO ({100 - policy.approval}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Action Card */}
          {policy.isMyProposal ? (
            // Proposer View - Show voting status
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="text-center">📊 Voting Progress</CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  Track votes from other organizations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-green-600">{policy.votesFor}</p>
                    <p className="text-sm text-gray-600 mt-1">YES Votes</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{policy.votesAgainst}</p>
                    <p className="text-sm text-gray-600 mt-1">NO Votes</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Votes Received</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {policy.voteProgress || `${policy.totalVotes}/${policy.eligibleVoters || 0}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {policy.totalVotes === policy.eligibleVoters 
                      ? "All votes received!" 
                      : `${(policy.eligibleVoters || 0) - policy.totalVotes} more vote(s) needed`}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📢 Status</p>
                  <p className="text-sm text-blue-800">
                    {policy.approval >= 50 
                      ? "✅ Your policy is currently on track for approval!" 
                      : "⏳ Waiting for more votes to reach majority approval"}
                  </p>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                  You cannot vote on your own proposal
                </div>

                {/* Pause/Resume Button - only show for ACTIVE policies */}
                {policy.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={policy.paused_for_matching ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          disabled={togglingPause}
                        >
                          {policy.paused_for_matching ? (
                            <><Play className="h-4 w-4 mr-2" />{togglingPause ? "Resuming..." : "Resume for AI Matching"}</>
                          ) : (
                            <><Pause className="h-4 w-4 mr-2" />{togglingPause ? "Pausing..." : "Pause for AI Matching"}</>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {policy.paused_for_matching ? "Resume" : "Pause"} Policy for AI Matching?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {policy.paused_for_matching ? (
                              <>
                                Resume "{policy.title}"? The policy will be immediately considered in AI-powered organ matching again.
                                <br /><br />
                                <strong>This will:</strong>
                                <ul className="list-disc list-inside mt-2">
                                  <li>Apply policy weights to new match requests</li>
                                  <li>Influence organ allocation decisions</li>
                                  <li>Take effect immediately</li>
                                </ul>
                              </>
                            ) : (
                              <>
                                Pause "{policy.title}" from AI matching consideration? The policy will remain active in the system but won't be used in organ allocation decisions.
                                <br /><br />
                                <strong>This will:</strong>
                                <ul className="list-disc list-inside mt-2">
                                  <li>Stop applying policy in AI matching</li>
                                  <li>Preserve blockchain record (not deleted)</li>
                                  <li>Can be resumed anytime</li>
                                </ul>
                              </>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={async () => {
                              setTogglingPause(true);
                              try {
                                const token = localStorage.getItem("organization_token");
                                const res = await fetch(`/api/organization/policies/policies/${policyId}/toggle-pause`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ paused: !policy.paused_for_matching }),
                                });
                                const data = await res.json();
                                if (!res.ok || !data.success) {
                                  throw new Error(data.error || "Failed to toggle pause status");
                                }
                                toast({
                                  title: policy.paused_for_matching ? "✅ Policy Resumed!" : "⏸️ Policy Paused!",
                                  description: data.message,
                                  variant: "default",
                                });
                                // Refresh policy details
                                setTimeout(() => window.location.reload(), 1500);
                              } catch (error: any) {
                                toast({
                                  title: "❌ Action Failed",
                                  description: error.message || "Failed to toggle pause status",
                                  variant: "destructive",
                                });
                                setTogglingPause(false);
                              }
                            }}
                            className={policy.paused_for_matching ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
                          >
                            {policy.paused_for_matching ? "Resume" : "Pause"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Delete Button - only show if no votes */}
                {policy.totalVotes === 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleting ? "Deleting..." : "Delete Policy"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Policy?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{policy.title}"? This action cannot be undone.
                            The policy will be removed from the system and other organizations will no longer see it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : policy.hasVoted ? (
            // Already Voted - Show what they voted
            <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-center">✅ Vote Recorded</CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  You have already cast your vote on this policy
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-flex items-center space-x-2 bg-white px-6 py-4 rounded-lg border border-gray-200">
                  {policy.myVote === 'YES' ? (
                    <>
                      <ThumbsUp className="h-8 w-8 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">Voted YES</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-8 w-8 text-red-600" />
                      <span className="text-2xl font-bold text-gray-900">Voted NO</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Your vote is recorded on the blockchain and cannot be changed
                </p>
              </CardContent>
            </Card>
          ) : (
            // Can Vote - Show voting buttons
            <Card className="border border-gray-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-center">Cast Your Vote</CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  Your vote will be recorded on the blockchain and cannot be changed
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    disabled={votingYes || votingNo}
                    onClick={() => handleVote(true)}
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  >
                    <ThumbsUp className="h-6 w-6 mr-2" />
                    {votingYes ? "Submitting..." : "Vote YES"}
                  </Button>
                  <Button
                    disabled={votingYes || votingNo}
                    onClick={() => handleVote(false)}
                    size="lg"
                    variant="destructive"
                    className="flex-1 py-6 text-lg"
                  >
                    <ThumbsDown className="h-6 w-6 mr-2" />
                    {votingNo ? "Submitting..." : "Vote NO"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  By voting, you agree that this decision represents your organization's official position
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Voting Information</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your vote is permanent and recorded on the blockchain</li>
                    <li>• Policies require majority approval to become active</li>
                    <li>• Active policies influence organ allocation decisions</li>
                    <li>• You can only vote once per policy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
}
