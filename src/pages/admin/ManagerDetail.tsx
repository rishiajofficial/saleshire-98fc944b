
import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

const ManagerDetail = () => {
  const { managerId } = useParams<{ managerId: string }>();
  
  // Placeholder data for a manager
  const manager = {
    id: managerId,
    name: "Manager " + managerId,
    email: `manager${managerId}@example.com`,
    phone: "+1 (555) 123-4567",
    region: "North",
    address: "123 Main St, City, State, 12345",
    status: "active",
    candidatesAssigned: 12
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manager Details</h1>
        <Button asChild variant="outline">
          <Link to="/managers">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Managers
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Manager Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold">{manager.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-bold mt-4">{manager.name}</h2>
              <Badge 
                variant={manager.status === "active" ? "outline" : "secondary"}
                className={manager.status === "active" ? "border-green-500 text-green-600 mt-2" : "mt-2"}
              >
                {manager.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{manager.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{manager.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{manager.region} Region</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="candidates">
            <TabsList>
              <TabsTrigger value="candidates">Assigned Candidates</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="candidates" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {manager.name} has {manager.candidatesAssigned} candidates assigned.
                  </p>
                  <div className="mt-4 bg-muted/40 p-8 rounded-xl text-center">
                    <p>Candidate list is under development.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 p-8 rounded-xl text-center">
                    <p>Activity log is under development.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manager Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 p-8 rounded-xl text-center">
                    <p>Settings panel is under development.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManagerDetail;
