
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserService } from '@/services/userService';
import MainLayout from '@/components/layout/MainLayout';

interface CompanyMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const userFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum(['hr', 'manager', 'director', 'candidate']),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type UserFormData = z.infer<typeof userFormSchema>;

const CompanyManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "hr",
      password: "",
    },
  });

  // Fetch company members
  const fetchCompanyMembers = async () => {
    try {
      setIsLoading(true);
      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      setCompanyMembers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch company members",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyMembers();
  }, [profile]);

  // Handle creating new user
  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await UserService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        company_id: profile?.company_id,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create user");
      }

      toast({
        title: "User created successfully",
        description: `${data.name} has been added to your company.`,
      });
      
      form.reset();
      setIsDialogOpen(false);
      fetchCompanyMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check permissions
  if (!profile?.isCompanyAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-500">You need to be a company admin to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Company Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Company Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user for your company. They will receive an email with their login details.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hr">HR Manager</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                            <SelectItem value="candidate">Candidate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{profile?.company?.name || "Company"} Members</CardTitle>
            <CardDescription>Manage users in your company</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Name</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Role</th>
                      <th scope="col" className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyMembers.map((member) => (
                      <tr key={member.id} className="bg-white border-b">
                        <td className="px-6 py-4">{member.name}</td>
                        <td className="px-6 py-4">{member.email}</td>
                        <td className="px-6 py-4 capitalize">{member.role}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" className="ml-2">Edit</Button>
                        </td>
                      </tr>
                    ))}
                    {companyMembers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center">
                          No members found. Add your first user!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>Manage your company information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="companyName" className="text-right">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  value={profile?.company?.name || ""}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="domain" className="text-right">
                  Domain
                </label>
                <Input
                  id="domain"
                  value={profile?.company?.domain || ""}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Edit Company Info</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CompanyManagement;
