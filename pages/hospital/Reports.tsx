import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Calendar,
  Users,
  Heart,
  TrendingUp,
  Activity,
  FileText,
  Filter,
  RefreshCw,
  Brain,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useToast } from "@/contexts/ToastContext";
import HospitalLayout from "@/components/hospital/HospitalLayout";

interface ReportData {
  monthlyStats: {
    month: string;
    patients: number;
    donors: number;
    matches: number;
  }[];
  organDistribution: {
    organ: string;
    patients: number;
    donors: number;
    matches: number;
  }[];
  bloodTypeStats: {
    bloodType: string;
    patients: number;
    donors: number;
    compatibility: number;
  }[];
  urgencyStats: {
    urgency: string;
    count: number;
    percentage: number;
  }[];
  matchingStats: {
    totalRequests: number;
    successfulMatches: number;
    pendingRequests: number;
    successRate: number;
  };
  ageGroupStats: {
    ageGroup: string;
    patients: number;
    donors: number;
  }[];
  aiInsights?: {
    performanceScore: number;
    trendAnalysis: {
      patient: { trend: string; growthRate: number; prediction: number };
      donor: { trend: string; growthRate: number; prediction: number };
    };
    demandPrediction: Record<string, any>;
    riskAssessment: Array<{
      type: string;
      level: string;
      impact: string;
      recommendation: string;
    }>;
    recommendations: Array<{
      category: string;
      priority: string;
      action: string;
      expectedImpact: string;
      timeline: string;
    }>;
    efficiency: {
      patientThroughput: number;
      matchingEfficiency: number;
      resourceUtilization: number;
      responseTime: number;
      qualityScore: number;
    };
    benchmarking: {
      patients: { hospital: number; industry: number; percentile: number };
      donors: { hospital: number; industry: number; percentile: number };
      successRate: { hospital: number; industry: number; percentile: number };
    };
    predictions: Array<{
      month: string;
      patients: number;
      donors: number;
      matches: number;
      confidence: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function HospitalReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6months");
  const [reportType, setReportType] = useState("overview");

  const { hospital } = useHospitalAuth();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(`/api/hospital/reports?range=${dateRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        showError("Failed to load report data");
      }
    } catch (error) {
      console.error("Report data fetch error:", error);
      showError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(`/api/hospital/reports/export?format=${format}&range=${dateRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hospital-report-${dateRange}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        showSuccess(`Report exported as ${format.toUpperCase()}`);
      } else {
        showError("Failed to export report");
      }
    } catch (error) {
      console.error("Export error:", error);
      showError("Failed to export report");
    }
  };

  if (loading) {
    return (
      <HospitalLayout title="Reports & Analytics" subtitle="Comprehensive data insights and performance metrics">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
        </div>
      </HospitalLayout>
    );
  }

  return (
    <HospitalLayout title="Reports & Analytics" subtitle="Comprehensive data insights and performance metrics">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={fetchReportData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportReport('excel')}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('pdf')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reportData?.monthlyStats.reduce((sum, month) => sum + month.patients, 0) || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{reportData?.monthlyStats[reportData.monthlyStats.length - 1]?.patients || 0} this month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donors</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reportData?.monthlyStats.reduce((sum, month) => sum + month.donors, 0) || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{reportData?.monthlyStats[reportData.monthlyStats.length - 1]?.donors || 0} this month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Matches</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reportData?.matchingStats.successfulMatches || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {reportData?.matchingStats.successRate || 0}% success rate
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reportData?.matchingStats.pendingRequests || 0}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">Pending matches</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="organs">Organ Analysis</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="matching">Matching Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.monthlyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients" />
                      <Line type="monotone" dataKey="donors" stroke="#82ca9d" name="Donors" />
                      <Line type="monotone" dataKey="matches" stroke="#ffc658" name="Matches" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Urgency Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Urgency Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.urgencyStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({urgency, percentage}) => `${urgency}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(reportData?.urgencyStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            {reportData?.aiInsights ? (
              <>
                {/* Performance Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-600" />
                        Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-6xl font-bold text-medical-600 mb-2">
                          {reportData.aiInsights.performanceScore}
                        </div>
                        <p className="text-lg text-gray-600">out of 100</p>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-medical-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${reportData.aiInsights.performanceScore}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {reportData.aiInsights.performanceScore >= 80 ? 'Excellent Performance' :
                           reportData.aiInsights.performanceScore >= 60 ? 'Good Performance' :
                           reportData.aiInsights.performanceScore >= 40 ? 'Average Performance' : 'Needs Improvement'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Efficiency Metrics */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-blue-600" />
                        Efficiency Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {reportData.aiInsights.efficiency.patientThroughput}
                          </p>
                          <p className="text-sm text-gray-600">Patients/Month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {reportData.aiInsights.efficiency.matchingEfficiency}%
                          </p>
                          <p className="text-sm text-gray-600">Matching Success</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {reportData.aiInsights.efficiency.resourceUtilization}%
                          </p>
                          <p className="text-sm text-gray-600">Resource Usage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {reportData.aiInsights.efficiency.responseTime}h
                          </p>
                          <p className="text-sm text-gray-600">Avg Response</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Analysis & Predictions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Trend Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Patient Registrations</span>
                          <Badge className={reportData.aiInsights.trendAnalysis.patient.growthRate >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {reportData.aiInsights.trendAnalysis.patient.growthRate >= 0 ? '+' : ''}{reportData.aiInsights.trendAnalysis.patient.growthRate}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Trend: {reportData.aiInsights.trendAnalysis.patient.trend}</p>
                        <p className="text-sm text-gray-600">Next month prediction: {reportData.aiInsights.trendAnalysis.patient.prediction}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Donor Registrations</span>
                          <Badge className={reportData.aiInsights.trendAnalysis.donor.growthRate >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {reportData.aiInsights.trendAnalysis.donor.growthRate >= 0 ? '+' : ''}{reportData.aiInsights.trendAnalysis.donor.growthRate}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Trend: {reportData.aiInsights.trendAnalysis.donor.trend}</p>
                        <p className="text-sm text-gray-600">Next month prediction: {reportData.aiInsights.trendAnalysis.donor.prediction}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3-Month Predictions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        AI Predictions (Next 3 Months)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={reportData.aiInsights.predictions || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="donors" stroke="#82ca9d" name="Donors" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="matches" stroke="#ffc658" name="Matches" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Predictions based on historical trends and AI analysis
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Benchmarking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                      Industry Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Patient Volume</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Hospital:</span>
                            <span className="font-medium">{reportData.aiInsights.benchmarking.patients.hospital}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Industry Average:</span>
                            <span>{Math.round(reportData.aiInsights.benchmarking.patients.industry)}</span>
                          </div>
                          <div className="pt-2">
                            <Badge className={reportData.aiInsights.benchmarking.patients.percentile >= 75 ? "bg-green-100 text-green-800" : 
                                             reportData.aiInsights.benchmarking.patients.percentile >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {reportData.aiInsights.benchmarking.patients.percentile}th Percentile
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-center border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Donor Volume</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Hospital:</span>
                            <span className="font-medium">{reportData.aiInsights.benchmarking.donors.hospital}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Industry Average:</span>
                            <span>{Math.round(reportData.aiInsights.benchmarking.donors.industry)}</span>
                          </div>
                          <div className="pt-2">
                            <Badge className={reportData.aiInsights.benchmarking.donors.percentile >= 75 ? "bg-green-100 text-green-800" : 
                                             reportData.aiInsights.benchmarking.donors.percentile >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {reportData.aiInsights.benchmarking.donors.percentile}th Percentile
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-center border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Success Rate</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Hospital:</span>
                            <span className="font-medium">{reportData.aiInsights.benchmarking.successRate.hospital}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Industry Average:</span>
                            <span>{Math.round(reportData.aiInsights.benchmarking.successRate.industry)}%</span>
                          </div>
                          <div className="pt-2">
                            <Badge className={reportData.aiInsights.benchmarking.successRate.percentile >= 75 ? "bg-green-100 text-green-800" : 
                                             reportData.aiInsights.benchmarking.successRate.percentile >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {reportData.aiInsights.benchmarking.successRate.percentile}th Percentile
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risk Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reportData.aiInsights.riskAssessment.length > 0 ? (
                        <div className="space-y-3">
                          {reportData.aiInsights.riskAssessment.map((risk, index) => (
                            <div key={index} className={`border rounded-lg p-3 ${
                              risk.level === 'High' ? 'border-red-200 bg-red-50' :
                              risk.level === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                              'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm">{risk.type}</h4>
                                <Badge className={`text-xs ${
                                  risk.level === 'High' ? 'bg-red-100 text-red-800' :
                                  risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {risk.level}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{risk.impact}</p>
                              <p className="text-xs text-gray-500">{risk.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Award className="h-12 w-12 text-green-500 mx-auto mb-2" />
                          <p className="text-green-600 font-medium">No significant risks identified</p>
                          <p className="text-sm text-gray-500">Your hospital operations are running smoothly</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reportData.aiInsights.recommendations.length > 0 ? (
                        <div className="space-y-3">
                          {reportData.aiInsights.recommendations.slice(0, 4).map((rec, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm">{rec.category}</h4>
                                <Badge className={`text-xs ${
                                  rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-700 mb-1 font-medium">{rec.action}</p>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{rec.expectedImpact}</span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {rec.timeline}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                          <p className="text-blue-600 font-medium">System optimized</p>
                          <p className="text-sm text-gray-500">Continue current excellent performance</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Loading</h3>
                  <p className="text-gray-600 mb-4">AI is analyzing your hospital's performance data...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="organs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organ Distribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData?.organDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="organ" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#8884d8" name="Patients Needing" />
                    <Bar dataKey="donors" fill="#82ca9d" name="Available Donors" />
                    <Bar dataKey="matches" fill="#ffc658" name="Successful Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Group Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData?.ageGroupStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill="#8884d8" name="Patients" />
                      <Bar dataKey="donors" fill="#82ca9d" name="Donors" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Blood Type Compatibility */}
              <Card>
                <CardHeader>
                  <CardTitle>Blood Type Compatibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData?.bloodTypeStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bloodType" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill="#ff7300" name="Patients" />
                      <Bar dataKey="donors" fill="#387908" name="Donors" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Matching Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.monthlyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="matches" stroke="#8884d8" name="Matches" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matching Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {reportData?.matchingStats.successRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Requests</span>
                      <Badge variant="outline">{reportData?.matchingStats.totalRequests || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Successful</span>
                      <Badge className="bg-green-100 text-green-800">{reportData?.matchingStats.successfulMatches || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{reportData?.matchingStats.pendingRequests || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Report */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Patient Care</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {reportData?.monthlyStats.reduce((sum, month) => sum + month.patients, 0) || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total patients registered</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Donor Network</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {reportData?.monthlyStats.reduce((sum, month) => sum + month.donors, 0) || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total donors registered</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Lives Saved</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {reportData?.matchingStats.successfulMatches || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Successful transplants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HospitalLayout>
  );
}
