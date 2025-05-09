import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";

// Indian states array
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  city: z.string().min(2, "City must be at least 2 characters").optional(),
  state: z.string().optional(),
});

interface ApplicationStepProfileProps {
  onNext: () => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

const ApplicationStepProfile = ({ onNext, profileData, setProfileData }: ApplicationStepProfileProps) => {
  const { user, profile } = useAuth();
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData?.name || profile?.name || "",
      email: profileData?.email || user?.email || "",
      phone: profileData?.phone || "",
      city: profileData?.city || "",
      state: profileData?.state || "",
    },
  });

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const locationParts = data.location?.split(', ') || ["", ""];
          const city = locationParts[0] || "";
          const state = locationParts[1] || "";
          
          form.reset({
            name: profile?.name || "",
            email: user?.email || "",
            phone: data.phone || "",
            city,
            state,
          });
          
          setProfileData({
            name: profile?.name || "",
            email: user?.email || "",
            phone: data.phone || "",
            city,
            state,
          });
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };
    
    fetchCandidateData();
  }, [user?.id, form, profile?.name, user?.email, setProfileData]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user?.id) return;
    
    try {
      // Update candidate record
      const { error } = await supabase
        .from("candidates")
        .update({
          phone: values.phone,
          location: `${values.city}, ${values.state}`,
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Update profile name if changed
      if (values.name !== profile?.name) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ name: values.name })
          .eq("id", user.id);
          
        if (profileError) throw profileError;
      }
      
      // Update local state with form values
      setProfileData(values);
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Profile Information</h2>
        <p className="text-gray-600 text-sm">Please complete your profile information below.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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
                    <Input placeholder="example@email.com" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select value={field.value || "select_state"} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select_state" disabled>Select a state</SelectItem>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ApplicationStepProfile;
