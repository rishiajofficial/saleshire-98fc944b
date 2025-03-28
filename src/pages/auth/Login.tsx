
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  Info, 
  User, 
  UserCog, 
  Shield 
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect accordingly
    if (user) {
      navigate(-1);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (type: 'candidate' | 'manager' | 'admin') => {
    setIsLoading(true);
    let demoEmail = '';
    let demoPassword = 'password123';

    switch (type) {
      case 'candidate':
        demoEmail = 'candidate@example.com';
        break;
      case 'manager':
        demoEmail = 'manager@example.com';
        break;
      case 'admin':
        demoEmail = 'admin@example.com';
        break;
    }

    try {
      console.log(`Attempting demo login as ${type} with email: ${demoEmail}`);
      await signIn(demoEmail, demoPassword);
    } catch (error) {
      console.error(`Demo login error (${type}):`, error);
      toast.error(`Failed to sign in with demo ${type} account. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in to HireSmart</CardTitle>
          <CardDescription>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Info size={16} className="mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Demo logins for testing
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-1 h-6 px-1 text-primary hover:bg-transparent hover:underline"
                  onClick={() => setShowDemoInfo(true)}
                >
                  Info
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => loginWithDemo('candidate')}
                  disabled={isLoading}
                >
                  <User size={14} className="mr-1" />
                  Candidate
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => loginWithDemo('manager')}
                  disabled={isLoading}
                >
                  <UserCog size={14} className="mr-1" />
                  Manager
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => loginWithDemo('admin')}
                  disabled={isLoading}
                >
                  <Shield size={14} className="mr-1" />
                  Admin
                </Button>
              </div>
            </div>

            <div className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showDemoInfo} onOpenChange={setShowDemoInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo Login Information</DialogTitle>
            <DialogDescription>
              These demo accounts are for testing purposes only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center"><User size={16} className="mr-2" /> Candidate Account</h4>
              <div className="pl-6 space-y-1 text-sm">
                <p><span className="font-semibold">Email:</span> candidate@example.com</p>
                <p><span className="font-semibold">Password:</span> password123</p>
                <p className="text-muted-foreground text-xs">Access to candidate features, training modules, and assessments.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center"><UserCog size={16} className="mr-2" /> Manager Account</h4>
              <div className="pl-6 space-y-1 text-sm">
                <p><span className="font-semibold">Email:</span> manager@example.com</p>
                <p><span className="font-semibold">Password:</span> password123</p>
                <p className="text-muted-foreground text-xs">Access to candidate management, assessments, and analytics.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center"><Shield size={16} className="mr-2" /> Admin Account</h4>
              <div className="pl-6 space-y-1 text-sm">
                <p><span className="font-semibold">Email:</span> admin@example.com</p>
                <p><span className="font-semibold">Password:</span> password123</p>
                <p className="text-muted-foreground text-xs">Full access to all features including user management and system settings.</p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <p>Note: In a production environment, manager accounts are created by admin users only.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
