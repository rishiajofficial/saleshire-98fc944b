
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { updateCompany } from '@/services/userService';
import CompanyInviteLink from './CompanyInviteLink';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  logo: string | null;
}

const CompanyManagement = () => {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!profile?.company_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
        
        if (companyError) throw companyError;
        
        setCompany(companyData);
        setCompanyName(companyData.name || '');
        setCompanyDomain(companyData.domain || '');
        
        // Check if user is company admin
        const { data: adminData, error: adminError } = await supabase
          .rpc('is_company_admin', { 
            company_uuid: profile.company_id,
            user_uuid: profile.id
          });
        
        if (adminError) throw adminError;
        setIsAdmin(!!adminData);
        
      } catch (err: any) {
        console.error('Error fetching company data:', err);
        setError(err.message || 'Failed to load company data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) return;
    
    try {
      setIsSaving(true);
      setError('');
      
      const updated = await updateCompany(company.id, {
        name: companyName,
        domain: companyDomain || null
      });
      
      if (updated) {
        toast.success('Company information updated successfully');
        // Update local state
        setCompany({
          ...company,
          name: companyName,
          domain: companyDomain || null
        });
      } else {
        setError('Failed to update company information');
      }
    } catch (err: any) {
      console.error('Error updating company:', err);
      setError(err.message || 'Failed to update company information');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Company Found</CardTitle>
          <CardDescription>
            You are not associated with any company.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.href = '/company/register'}>
            Register a Company
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Manage your company details
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!isAdmin || isSaving}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-domain">Company Website Domain (Optional)</Label>
              <Input
                id="company-domain"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                disabled={!isAdmin || isSaving}
                placeholder="example.com"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            {isAdmin ? (
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                You need admin privileges to edit company information.
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
      
      {isAdmin && company && (
        <CompanyInviteLink companyId={company.id} />
      )}
    </div>
  );
};

export default CompanyManagement;
