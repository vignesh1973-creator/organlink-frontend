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

  const exportPDF = async () => {
    if (!reportData) { showError("No data to export"); return; }
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default as any;
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Hospital Report & Analytics", 14, 20);
      doc.setFontSize(11);
      doc.text(`Date Range: ${dateRange} | Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      let yPos = 40;
      doc.setFontSize(14);
      doc.text("Summary Statistics", 14, yPos);
      yPos += 8;
      const summaryData = [["Total Patients", reportData.monthlyStats.reduce((sum, m) => sum + m.patients, 0)], ["Total Donors", reportData.monthlyStats.reduce((sum, m) => sum + m.donors, 0)], ["Successful Matches", reportData.matchingStats.successfulMatches], ["Success Rate", `${reportData.matchingStats.successRate}%`], ["Pending Requests", reportData.matchingStats.pendingRequests]];
      autoTable(doc, { startY: yPos, head: [["Metric", "Value"]], body: summaryData, styles: { fontSize: 10 }, headStyles: { fillColor: [22, 163, 74] }, theme: "grid" });
      yPos = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Organ Distribution", 14, yPos);
      yPos += 8;
      autoTable(doc, { startY: yPos, head: [["Organ", "Patients", "Donors", "Matches"]], body: reportData.organDistribution.map(o => [o.organ, o.patients, o.donors, o.matches]), styles: { fontSize: 9 }, headStyles: { fillColor: [22, 163, 74] }, theme: "grid" });
      doc.save(`hospital-report-${Date.now()}.pdf`);
      showSuccess("PDF report generated successfully");
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
              onClick={exportPDF}
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="h-auto whitespace-normal py-2">Overview</TabsTrigger>
            <TabsTrigger value="organs" className="h-auto whitespace-normal py-2">Organ Analysis</TabsTrigger>
            <TabsTrigger value="demographics" className="h-auto whitespace-normal py-2">Demographics</TabsTrigger>
            <TabsTrigger value="matching" className="h-auto whitespace-normal py-2">Matching Stats</TabsTrigger>
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
                        label={({ urgency, percentage }) => `${urgency}: ${percentage}%`}
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
