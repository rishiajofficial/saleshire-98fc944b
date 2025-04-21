
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  PenLine,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Enhanced candidate type including profile data
type CandidateWithProfile = Database['public']['Tables']['candidates']['Row'] & {
  profile?: {
    name: string;
    email: string;
  }
};

const Candidates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidatePhone, setNewCandidatePhone] = useState("");
  const [newCandidateLocation, setNewCandidateLocation] = useState("");
  const [newCandidateStatus, setNewCandidateStatus] = useState("pending");

  const { 
    data: fetchedCandidates,
    isLoading: isLoadingCandidates,
    error: candidatesError
  } = useQuery<CandidateWithProfile[]>({
    queryKey: ['candidates'],
    queryFn: async (): Promise<CandidateWithProfile[]> => {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          profile:profiles(name, email)
        `)
        .order('updated_at', { ascending: false });
      if (error) {
        toast.error("Failed to fetch candidates: " + error.message);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Modified to ensure we're creating both profile and candidate records properly
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: {
      name: string;
      email: string;
      phone: string;
      location: string;
      status: string;
    }) => {
      // First, we need to create a user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          name: candidateData.name,
          email: candidateData.email,
          role: 'candidate'
        }])
        .select();

      if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
      if (!profileData || profileData.length === 0) throw new Error('Failed to create profile');

      const profileId = profileData[0].id;

      // Then create the candidate record linked to the profile
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .insert([{
          id: profileId,
          phone: candidateData.phone,
          location: candidateData.location,
          status: candidateData.status,
        }])
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
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success("Candidate deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete candidate: " + error.message);
    },
  });

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
    if (window.confirm("Are you sure you want to delete this candidate?")) {
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
              Manage candidates for the sales training program
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Candidate List</h2>
            <p className="text-muted-foreground">View and manage candidates</p>
          </div>
          <Dialog open={showAddCandidateDialog} onOpenChange={setShowAddCandidateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" /> Add New Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Create a new candidate for the sales training program.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter candidate name" required value={newCandidateName} onChange={(e) => setNewCandidateName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter candidate email" type="email" required value={newCandidateEmail} onChange={(e) => setNewCandidateEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter candidate phone" required value={newCandidatePhone} onChange={(e) => setNewCandidatePhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter candidate location" required value={newCandidateLocation} onChange={(e) => setNewCandidateLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newCandidateStatus} onValueChange={setNewCandidateStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddCandidateDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddCandidate} disabled={createCandidateMutation.isPending}>
                  {createCandidateMutation.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCandidates ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading candidates...</TableCell>
                    </TableRow>
                  ) : candidatesError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-red-600">Error: {candidatesError.message}</TableCell>
                    </TableRow>
                  ) : filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{candidate.profile?.name || "Unknown"}</TableCell>
                        <TableCell>{candidate.profile?.email || "Unknown"}</TableCell>
                        <TableCell className="hidden md:table-cell">{candidate.phone || "N/A"}</TableCell>
                        <TableCell className="hidden md:table-cell">{candidate.location || "N/A"}</TableCell>
                        <TableCell>{candidate.status || "Unknown"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">{searchTerm ? "No candidates found matching search." : "No candidates created yet."}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Candidates;
