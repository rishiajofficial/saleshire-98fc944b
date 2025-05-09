import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/auth';
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InterviewData {
  id: string;
  scheduled_at: string;
  status: string;
  candidate: {
    id: string;
    profile: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  } | null;
  manager: {
    id: string;
    profile: {
      id: string;
      name: string | null;
    } | null;
  } | null;
}

const Interviews = () => {
  const { user, profile } = useAuth();
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewData[]>([]);

  // Query interviews - Supabase RLS will handle the filtering
  const { data: interviewsData = [], isLoading: isLoadingInterviews } = useQuery({
    queryKey: ['interviews', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select(`
            id,
            scheduled_at,
            status,
            candidate:candidates!interviews_candidate_id_fkey (
              id, profile:profiles!candidates_id_fkey ( id, name, email )
            ),
            manager:managers!interviews_manager_id_fkey (
              id, profile:profiles!managers_id_fkey ( id, name )
            )
          `)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching interviews:", err);
        return [];
      }
    },
    enabled: !!user,
  });

  // Update filtered interviews whenever data changes
  React.useEffect(() => {
    setFilteredInterviews(interviewsData);
  }, [interviewsData]);

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
      scheduled: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive"
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  // Handle status update
  const handleUpdateStatus = async (interviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: newStatus })
        .eq('id', interviewId);

      if (error) throw error;
      
      toast.success(`Interview marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating interview:", err);
      toast.error("Failed to update interview status");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Interviews</CardTitle>
            <CardDescription>
              View and manage your scheduled interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInterviews ? (
              <p>Loading interviews...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    {(profile?.role === 'hr' || profile?.role === 'director') && (
                      <TableHead>Manager</TableHead>
                    )}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.length > 0 ? (
                    filteredInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          {interview.candidate?.profile?.name || interview.candidate?.profile?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(interview.scheduled_at)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(interview.status)}
                        </TableCell>
                        {(profile?.role === 'hr' || profile?.role === 'director') && (
                          <TableCell>
                            {interview.manager?.profile?.name || 'N/A'}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex space-x-2">
                            {(interview.status === 'scheduled' || interview.status === 'confirmed') && (
                              <>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(interview.id, 'completed')}
                                >
                                  Mark Completed
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(interview.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={profile?.role === 'hr' || profile?.role === 'director' ? 5 : 4} 
                        className="text-center"
                      >
                        No interviews found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Interviews;
