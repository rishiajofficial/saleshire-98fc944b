
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/contexts/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Form validation schema for individual registration
const individualFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

// Extended schema for company registration
const companyFormSchema = individualFormSchema.extend({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  companyDomain: z.string().optional(),
  role: z.enum(['admin', 'hr', 'manager', 'director']).default('admin'),
});

type IndividualFormData = z.infer<typeof individualFormSchema>;
type CompanyFormData = z.infer<typeof companyFormSchema>;

const Register = () => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"individual" | "company">("individual");

  // Individual registration form
  const individualForm = useForm<IndividualFormData>({
    resolver: zodResolver(individualFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  // Company registration form
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      companyName: "",
      companyDomain: "",
      role: "admin",
    },
  });

  // Handle individual registration
  const onIndividualSubmit = async (data: IndividualFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, {
        name: data.name,
        role: 'candidate',
      });
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle company registration
  const onCompanySubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, {
        name: data.name,
        role: data.role,
        register_as_company: 'true',
        company_name: data.companyName,
        company_domain: data.companyDomain || undefined,
      });
      toast({
        title: "Company registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Register">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card className="mx-auto w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Create an account to get started with WorkForce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "individual" | "company")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual">
                <Form {...individualForm}>
                  <form onSubmit={individualForm.handleSubmit(onIndividualSubmit)} className="space-y-4">
                    <FormField
                      control={individualForm.control}
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
                      control={individualForm.control}
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
                      control={individualForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Register as Individual"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="company">
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="companyDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Domain (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={companyForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Role</FormLabel>
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
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="hr">HR Manager</SelectItem>
                                <SelectItem value="director">Director</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={companyForm.control}
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
                      control={companyForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Register Company"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default Register;
