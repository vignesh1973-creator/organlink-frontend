import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Vote, CheckCircle } from "lucide-react";
import OrganizationLayout from "@/components/organization/OrganizationLayout";
import { useState, useEffect } from "react";

export default function OrganizationInsights() {
  const [stats, setStats] = useState({
    activePolicies: 0,
    myProposals: 0,
    pendingVotes: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("organization_token");
        const res = await fetch("/api/organization/policies/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  return (
    <OrganizationLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights & Analytics</h1>
          <p className="text-gray-600">Policy performance and voting patterns</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Participation Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activePolicies > 0 
                          ? Math.round((stats.totalVotes / stats.activePolicies) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.myProposals > 0 
                          ? Math.round((stats.myProposals / (stats.myProposals + 1)) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.min(100, (stats.totalVotes * 10) + (stats.myProposals * 20))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Policy Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-gray-700">Total Active Policies</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stats.activePolicies}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-gray-700">My Proposals</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stats.myProposals}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Vote className="h-5 w-5 text-yellow-600" />
                        </div>
                        <span className="text-gray-700">Pending Votes</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stats.pendingVotes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Voting Insights</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Votes Cast</span>
                        <span className="text-sm font-bold text-purple-600">{stats.totalVotes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (stats.totalVotes / 10) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pending Actions</span>
                        <span className="text-sm font-bold text-orange-600">{stats.pendingVotes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (stats.pendingVotes / 5) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Proposals Submitted</span>
                        <span className="text-sm font-bold text-green-600">{stats.myProposals}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (stats.myProposals / 3) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI-Powered Recommendations */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Recommendations</h3>
                <div className="space-y-3">
                  {stats.pendingVotes > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        📊 You have {stats.pendingVotes} pending vote{stats.pendingVotes > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-600">
                        Review and vote on pending policies to increase your participation rate
                      </p>
                    </div>
                  )}
                  
                  {stats.myProposals === 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        💡 Consider proposing a new policy
                      </p>
                      <p className="text-xs text-gray-600">
                        Share your insights to help improve organ allocation processes
                      </p>
                    </div>
                  )}
                  
                  {stats.totalVotes > 5 && (
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        🎉 Excellent engagement!
                      </p>
                      <p className="text-xs text-gray-600">
                        You're an active contributor to policy decisions
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </OrganizationLayout>
  );
}
