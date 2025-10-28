import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Vote, BarChart3, History, Users, Clock, TrendingUp } from "lucide-react";
import OrganizationLayout from "@/components/organization/OrganizationLayout";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { useState, useEffect } from "react";

interface ActiveProposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  eligibleVoters: number;
  approval: number;
  createdAt: string;
}

interface Activity {
  type: string;
  action: string;
  description: string;
  status: string;
  timestamp: string;
}

export default function OrganizationDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activePolicies: 0,
    myProposals: 0,
    pendingVotes: 0,
    totalVotes: 0
  });
  const [activeProposals, setActiveProposals] = useState<ActiveProposal[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("organization_token");
        
        // Fetch all dashboard data in parallel
        const [statsRes, proposalsRes, activityRes] = await Promise.all([
          fetch("/api/organization/policies/dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/organization/policies/dashboard-active-proposals", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/organization/policies/dashboard-recent-activity", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        const [statsData, proposalsData, activityData] = await Promise.all([
          statsRes.json(),
          proposalsRes.json(),
          activityRes.json()
        ]);
        
        if (statsData.success) {
          setStats(statsData.stats);
        }
        if (proposalsData.success) {
          setActiveProposals(proposalsData.proposals);
        }
        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  
  return (
    <OrganizationLayout>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Dashboard</h1>
          <p className="text-gray-600">Policy management and voting status overview</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <a href="/organization/policies/propose" className="block">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Propose New Policy</h3>
                <p className="text-sm text-gray-600 mb-4">Create policy proposal</p>
                <Button className="w-full" variant="outline">
                  Create
                </Button>
              </CardContent>
            </Card>
          </a>
          
          <a href="/organization/policies" className="block">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Vote className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Vote on Policies</h3>
                <p className="text-sm text-gray-600 mb-4">{stats.pendingVotes} pending</p>
                <Button className="w-full" variant="outline">
                  Open
                </Button>
              </CardContent>
            </Card>
          </a>
          
          <a href="/organization/policies" className="block">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <History className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Policy History</h3>
                <p className="text-sm text-gray-600 mb-4">View all policies</p>
                <Button className="w-full" variant="outline">
                  View
                </Button>
              </CardContent>
            </Card>
          </a>
          
          <a href="/organization/insights" className="block">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">AI Insights</h3>
                <p className="text-sm text-gray-600 mb-4">Policy analytics</p>
                <Button className="w-full" variant="outline">
                  View Insights
                </Button>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activePolicies}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Currently applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">My Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.myProposals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Votes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingVotes}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Awaiting your vote</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Votes Cast</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Active Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-sm text-gray-600 mb-4">Latest policy actions and updates</p>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, idx) => {
                    const isApproved = activity.status === 'APPROVED';
                    const dotColor = isApproved ? 'bg-green-500' : 'bg-yellow-500';
                    const badgeColor = isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                    const timeAgo = getTimeAgo(activity.timestamp);
                    
                    return (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs ${badgeColor} rounded-full`}>{activity.status}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">🗳️ Pending Proposals</h3>
                  <p className="text-sm text-gray-600">Policies in voting phase (not yet active)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {activeProposals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No pending proposals to vote on</p>
                ) : (
                  activeProposals.map((proposal) => (
                    <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{proposal.title}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">VOTING</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">ID: POL-{proposal.id}</p>
                      <p className="text-sm text-gray-600 mb-2">{proposal.description}</p>
                      <p className="text-sm text-gray-600 mb-3">Approval: {proposal.approval}% ({proposal.totalVotes}/{proposal.eligibleVoters})</p>
                      <a href={`/organization/policies/vote/${proposal.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                          Vote Now
                        </Button>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </OrganizationLayout>
  );
}
