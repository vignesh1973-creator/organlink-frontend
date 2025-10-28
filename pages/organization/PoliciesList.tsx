import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrganizationLayout from "@/components/organization/OrganizationLayout";
import { useEffect, useState } from "react";
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { PoliciesListSkeleton } from "@/components/ui/skeletons";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PoliciesList() {
  const [items, setItems] = useState<any[]>([]);
  const [myPolicies, setMyPolicies] = useState<any[]>([]);
  const [otherPolicies, setOtherPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [organFilter, setOrganFilter] = useState("All Organs");
  const [activeTab, setActiveTab] = useState("All Policies");
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<number | null>(null);

  const openDeleteDialog = (policyId: number) => {
    setPolicyToDelete(policyId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!policyToDelete) return;

    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch(`/api/organization/policies/delete/${policyToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "✅ Policy Deleted",
          description: "The policy has been deleted successfully.",
        });
        // Refresh the page
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "❌ Delete Failed",
        description: error.message || "Failed to delete policy",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
    }
  };

  // Fetch policies from API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const token = localStorage.getItem("organization_token");
        const res = await fetch("/api/organization/policies/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setMyPolicies(data.myPolicies || []);
          setOtherPolicies(data.otherPolicies || []);
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // Combine all policies based on active tab
  const allPolicies = activeTab === "My Proposals" 
    ? myPolicies 
    : activeTab === "Others' Policies"
    ? otherPolicies
    : [...myPolicies, ...otherPolicies];

  // Filter policies based on search and filters
  const filteredPolicies = allPolicies.filter(policy => {
    const matchesSearch = !searchTerm || 
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (policy.content && policy.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (policy.proposer && policy.proposer.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === "All Status" || 
      policy.status.toLowerCase() === statusFilter.toLowerCase();
      
    const matchesOrgan = organFilter === "All Organs" || 
      (policy.category && policy.category.toLowerCase() === organFilter.toLowerCase());
      
    return matchesSearch && matchesStatus && matchesOrgan;
  });

  useEffect(() => {
    if (!initialLoading) {
      setItems(filteredPolicies);
    }
  }, [filteredPolicies, searchTerm, statusFilter, organFilter, activeTab, initialLoading]);

  const tabs = ["All Policies", "My Proposals", "Others' Policies"];

  return (
    <OrganizationLayout>
      {initialLoading ? (
        <PoliciesListSkeleton />
      ) : (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Global Policies</h1>
              <p className="text-blue-100">View and track all organ allocation policies</p>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-blue-50" asChild>
              <a href="/organization/policies/propose">+ Propose New Policy</a>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search policies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={organFilter} onValueChange={setOrganFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Organs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Organs">All Organs</SelectItem>
                  <SelectItem value="Kidney">Kidney</SelectItem>
                  <SelectItem value="Liver">Liver</SelectItem>
                  <SelectItem value="Heart">Heart</SelectItem>
                  <SelectItem value="Lung">Lung</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Policy Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            items.map((policy) => (
              <Card key={policy.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
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
                        {policy.isMyProposal && (
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                            My Proposal
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {policy.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{policy.content || policy.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>🏢 {policy.proposer}</span>
                        <span>📋 #{policy.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {policy.approval}%
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Approval</p>
                    </div>
                  </div>

                  {/* Voting Results */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Voting Results</span>
                      <span className="text-sm text-gray-600">{policy.voteProgress || `${policy.totalVotes} votes`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${policy.approval}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{policy.votesFor} for</span>
                      <span>{policy.votesAgainst} against</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Policy ID: #{policy.id}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(policy.createdAt).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}</span>
                    </div>
                    <div className="flex space-x-2">
                      {!policy.isMyProposal && policy.status === 'voting' && (
                        policy.hasVoted ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            ✓ Voted {policy.myVote}
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            asChild
                          >
                            <a href={`/organization/policies/vote/${policy.id}`}>Vote Now</a>
                          </Button>
                        )
                      )}
                      {policy.isMyProposal && policy.totalVotes === 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => openDeleteDialog(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        asChild
                      >
                        <a href={`/organization/policies/vote/${policy.id}`}>
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Search Policies Section */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Policies</h3>
            <p className="text-sm text-gray-600 mb-4">Find specific policies by title, ID, or organ type</p>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input placeholder="Search policies..." />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be undone.
              The policy will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OrganizationLayout>
  );
}
