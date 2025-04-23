
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CandidateWithProfile } from "@/types/candidate";
import { AddCandidateDialog } from "@/components/candidates/AddCandidateDialog";
import { CandidatesTable } from "@/components/candidates/CandidatesTable";
import { CandidateHistoryDialog } from "@/components/candidates/CandidateHistoryDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Candidates = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("in progress");

  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidatePhone, setNewCandidatePhone] = useState("");
  const [newCandidateLocation, setNewCandidateLocation] = useState("");
  const [newCandidateStatus, setNewCandidateStatus] = useState("pending");

  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyCandidateName, setHistoryCandidateName] = useState<string>("");
  const [historyCandidateId, setHistoryCandidateId] = useState<string>("");

  const { 
    data: fetchedCandidates,
    isLoading: isLoadingCandidates,
    error: candidatesError
  } = useQuery<CandidateWithProfile[]>({
    queryKey: ['candidates', statusFilter],
    queryFn: async (): Promise<CandidateWithProfile[]> => {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          profile:profiles!candidates_id_fkey(name, email)
        `)
        .order('updated_at', { ascending: false });

      if (statusFilter === "in progress") {
        // Exclude hired, rejected, and archived candidates
        query = query.not('status', 'eq', 'hired')
                    .not('status', 'eq', 'rejected')
                    .not('status', 'eq', 'archived');
      } else {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error("Failed to fetch candidates: " + error.message);
        throw new Error(error.message);
      }
      
      return (data || []) as CandidateWithProfile[];
    },
    enabled: !!user,
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      email: string;
      phone: string;
      location: string;
      status: string;
    }) => {
      const userId = crypto.randomUUID();

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: formData.name,
          email: formData.email,
          role: 'candidate'
        })
        .select();

      if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
      if (!profileData || profileData.length === 0) throw new Error('Failed to create profile');

      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          id: userId,
          phone: formData.phone,
          location: formData.location,
          status: formData.status,
        })
        .select();

      if (candidateError) throw new Error(`Candidate creation failed: ${candidateError.message}`);

      return { profile: profileData[0], candidate: candidateData?.[0] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success("Candidate added successfully");
      setShowAddCandidateDialog(false);
      setNewCandidateName("");
      setNewCandidateEmail("");
      setNewCandidatePhone("");
      setNewCandidateLocation("");
      setNewCandidateStatus("pending");
    },
    onError: (error) => {
      toast.error("Failed to add candidate: " + error.message);
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .update({ status: 'archived' })
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      
      // Log the archive action - fixed to properly handle the RPC call
      try {
        const { error: logError } = await supabase.rpc('log_activity', {
          user_id: user?.id || '', 
          action: 'archive_candidate',
          entity_type: 'candidates',
          entity_id: id,
          details: { status_change: 'archived' }
        });
        
        if (logError) {
          console.error('Error logging activity:', logError);
        }
      } catch (error) {
        console.error('Error logging activity:', error);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success("Candidate archived successfully");
    },
    onError: (error) => {
      toast.error("Failed to archive candidate: " + error.message);
    },
  });

  const openHistoryDialog = async (candidate: CandidateWithProfile) => {
    setShowHistoryDialog(true);
    setHistoryCandidateName(candidate.profile?.name || candidate.id);
    setHistoryCandidateId(candidate.id);
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, details, created_at, user_id")
      .eq("entity_id", candidate.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("Failed to load candidate history: " + error.message);
      setHistoryLogs([]);
    } else {
      setHistoryLogs(data || []);
    }
    setHistoryLoading(false);
  };

  const closeHistoryDialog = () => {
    setShowHistoryDialog(false);
    setHistoryLogs([]);
  };

  const handleAddCandidate = () => {
    if (!newCandidateName || !newCandidateEmail || !newCandidatePhone || !newCandidateLocation || !newCandidateStatus) {
      toast.error("All fields are required.");
      return;
    }
    if (!user) { toast.error("You must be logged in."); return; }

    createCandidateMutation.mutate({
      name: newCandidateName,
      email: newCandidateEmail,
      phone: newCandidatePhone,
      location: newCandidateLocation,
      status: newCandidateStatus,
    });
  };

  const handleDeleteCandidate = (id: string) => {
    if (window.confirm("Are you sure you want to archive this candidate?")) {
      deleteCandidateMutation.mutate(id);
    }
  };

  const filteredCandidates = fetchedCandidates?.filter(
    (candidate) =>
      (candidate.profile?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.profile?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
            <p className="text-muted-foreground mt-2">
              Manage candidates for the hiring portal
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ToggleGroup 
            type="single" 
            value={statusFilter}
            onValueChange={(value) => {
              if (value) setStatusFilter(value);
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="in progress" aria-label="Toggle in progress">
              In Progress
            </ToggleGroupItem>
            <ToggleGroupItem value="hired" aria-label="Toggle hired">
              Hired
            </ToggleGroupItem>
            <ToggleGroupItem value="rejected" aria-label="Toggle rejected">
              Rejected
            </ToggleGroupItem>
            <ToggleGroupItem value="archived" aria-label="Toggle archived">
              Archived
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Candidate List</h2>
            <p className="text-muted-foreground">View and manage candidates</p>
          </div>
          <AddCandidateDialog
            isOpen={showAddCandidateDialog}
            onOpenChange={setShowAddCandidateDialog}
            onSubmit={handleAddCandidate}
            isSubmitting={createCandidateMutation.isPending}
            formData={{
              name: newCandidateName,
              email: newCandidateEmail,
              phone: newCandidatePhone,
              location: newCandidateLocation,
              status: newCandidateStatus,
            }}
            onFormChange={{
              setName: setNewCandidateName,
              setEmail: setNewCandidateEmail,
              setPhone: setNewCandidatePhone,
              setLocation: setNewCandidateLocation,
              setStatus: setNewCandidateStatus,
            }}
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <CandidatesTable
                candidates={filteredCandidates}
                isLoading={isLoadingCandidates}
                error={candidatesError}
                userRole={profile?.role}
                onDelete={handleDeleteCandidate}
              />
            </div>
          </CardContent>
        </Card>

        <CandidateHistoryDialog
          isOpen={showHistoryDialog}
          onClose={closeHistoryDialog}
          candidateName={historyCandidateName}
          isLoading={historyLoading}
          logs={historyLogs}
        />
      </div>
    </MainLayout>
  );
};

export default Candidates;
