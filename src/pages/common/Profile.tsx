
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  location: z.string().optional(),
});

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.candidates?.[0]?.phone || "",
      location: profile?.candidates?.[0]?.location || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    
    try {
      // Update profile
      const profileData = {
        name: values.name,
      };
      
      await updateProfile(profileData);
      
      // If candidate, update candidate table
      if (profile?.role === 'candidate' && profile?.candidates?.[0]) {
        const { data, error } = await supabase
          .from('candidates')
          .update({
            phone: values.phone,
            location: values.location,
          })
          .eq('id', profile.id);
          
        if (error) throw error;
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse flex flex-col items-center justify-center h-64">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mt-4"></div>
            <div className="h-3 w-64 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal information and contact details
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
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
                            <Input placeholder="Your email" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {profile?.role === "candidate" && (
                      <>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your phone number"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City, State"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <div className="py-1 px-2 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </div>
                        {profile.role === "candidate" && profile.candidates?.[0]?.status && (
                          <div className="py-1 px-2 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Status: {profile.candidates[0].status.charAt(0).toUpperCase() + profile.candidates[0].status.slice(1)}
                          </div>
                        )}
                        {profile.role === "candidate" && profile.candidates?.[0]?.region && (
                          <div className="py-1 px-2 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Region: {profile.candidates[0].region.charAt(0).toUpperCase() + profile.candidates[0].region.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
