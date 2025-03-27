
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    region: "north",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate registration process
    setTimeout(() => {
      // Store user in local storage for demo purposes
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: 'candidate',
        createdAt: new Date(),
        currentStep: 1,
        status: 'applied',
        region: formData.region
      };
      
      // In a real application, you would use proper authentication
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('userRole', 'candidate');
      
      toast.success("Registration successful! Please complete your application.");
      setIsSubmitting(false);
      navigate("/application");
    }, 1500);
  };

  const handleDemoLogin = (role: string) => {
    // Create demo user based on role
    const demoUsers = {
      candidate: {
        id: "demo-candidate",
        name: "Demo Candidate",
        email: "candidate@example.com",
        role: "candidate",
        createdAt: new Date(),
        currentStep: 2,
        status: "training",
        region: "north"
      },
      manager: {
        id: "demo-manager",
        name: "Demo Manager",
        email: "manager@example.com",
        role: "manager",
        createdAt: new Date(),
        regions: ["north", "south"]
      },
      admin: {
        id: "demo-admin",
        name: "Demo Admin",
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date()
      }
    };

    // Set user data in local storage
    localStorage.setItem('currentUser', JSON.stringify(demoUsers[role as keyof typeof demoUsers]));
    localStorage.setItem('userRole', role);
    
    // Redirect to appropriate dashboard
    toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    
    switch(role) {
      case 'candidate':
        navigate("/dashboard/candidate");
        break;
      case 'manager':
        navigate("/dashboard/manager");
        break;
      case 'admin':
        navigate("/dashboard/admin");
        break;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Apply as Candidate</CardTitle>
              <CardDescription>
                Register to apply for the sales position
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={handleRegionChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North Region</SelectItem>
                      <SelectItem value="south">South Region</SelectItem>
                      <SelectItem value="east">East Region</SelectItem>
                      <SelectItem value="west">West Region</SelectItem>
                      <SelectItem value="central">Central Region</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating your account..." : "Apply Now"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Demo Login Buttons */}
          <div className="mt-8">
            <h3 className="text-center text-lg font-medium mb-4">Demo Accounts</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('candidate')}
                className="w-full"
              >
                Demo Candidate
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('manager')}
                className="w-full"
              >
                Demo Manager
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('admin')}
                className="w-full"
              >
                Demo Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
