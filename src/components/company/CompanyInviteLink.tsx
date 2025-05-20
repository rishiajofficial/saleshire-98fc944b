
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CompanyInviteLinkProps {
  companyId: string;
}

const CompanyInviteLink: React.FC<CompanyInviteLinkProps> = ({ companyId }) => {
  const [inviteLink, setInviteLink] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        
        const { data: company, error } = await supabase
          .from('companies')
          .select('invite_code')
          .eq('id', companyId)
          .single();
        
        if (error) throw error;
        
        // Construct the invite link
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/register?invite=${company.invite_code}`;
        setInviteLink(inviteUrl);
      } catch (err: any) {
        console.error('Error fetching company invite code:', err);
        setError(err.message || 'Failed to load invite link');
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Invite Link</CardTitle>
        <CardDescription>
          Share this link with candidates to join your company directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="invite-link">Candidate Invite Link</Label>
            <div className="flex space-x-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                title="Copy invite link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Candidates who register using this link will be automatically associated with your company.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyInviteLink;
