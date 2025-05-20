
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { createCompany } from '@/services/userService';

const CompanyRegistration = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Create the company
      const company = await createCompany({
        name: companyName,
        domain: companyDomain.trim() || null
      });
      
      if (company) {
        toast.success(`${companyName} has been registered successfully`);
        navigate('/dashboard/hr');
      } else {
        setError('Failed to create company');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to register company');
      console.error('Error registering company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register Your Company</CardTitle>
        <CardDescription>
          Create your company profile to manage job openings and candidates
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
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
              placeholder="Acme Corporation"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-domain">Company Website Domain (Optional)</Label>
            <Input
              id="company-domain"
              placeholder="acme.com"
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Company'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyRegistration;
