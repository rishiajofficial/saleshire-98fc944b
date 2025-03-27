
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Mock login function (for demonstration)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Demo login logic
      if (email === "candidate@example.com" && password === "password") {
        localStorage.setItem("userRole", "candidate");
        localStorage.setItem("currentUser", JSON.stringify({
          id: "1",
          name: "Demo Candidate",
          email: "candidate@example.com",
          role: "candidate",
          createdAt: new Date(),
          currentStep: 2,
          status: 'training'
        }));
        toast.success("Login successful!");
        navigate("/dashboard/candidate");
      } else if (email === "manager@example.com" && password === "password") {
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("currentUser", JSON.stringify({
          id: "2",
          name: "Demo Manager",
          email: "manager@example.com",
          role: "manager",
          createdAt: new Date()
        }));
        toast.success("Login successful!");
        navigate("/dashboard/manager");
      } else if (email === "admin@example.com" && password === "password") {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("currentUser", JSON.stringify({
          id: "3",
          name: "Demo Admin",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date()
        }));
        toast.success("Login successful!");
        navigate("/dashboard/admin");
      } else {
        toast.error("Invalid credentials");
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials below to continue
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <p>Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up as candidate
                </Link>
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2 text-center">Demo credentials:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="border rounded-md p-2">
                  <p className="font-medium">Candidate</p>
                  <p>candidate@example.com</p>
                  <p>password</p>
                </div>
                <div className="border rounded-md p-2">
                  <p className="font-medium">Manager</p>
                  <p>manager@example.com</p>
                  <p>password</p>
                </div>
                <div className="border rounded-md p-2">
                  <p className="font-medium">Admin</p>
                  <p>admin@example.com</p>
                  <p>password</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
