
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
import { ArrowLeft, Mail, Phone, Briefcase } from "lucide-react";

const HRDetail = () => {
  const { hrId } = useParams<{ hrId: string }>();
  
  // Placeholder data for an HR staff member
  const hr = {
    id: hrId,
    name: "HR Staff " + hrId,
    email: `hr${hrId}@example.com`,
    phone: "+1 (555) 987-6543",
    department: "Recruitment",
    status: "active",
    candidatesProcessed: 45
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">HR Staff Details</h1>
        <Button asChild variant="outline">
          <Link to="/hr">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to HR Staff
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>HR Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold">{hr.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-bold mt-4">{hr.name}</h2>
              <Badge 
                variant={hr.status === "active" ? "outline" : "secondary"}
                className={hr.status === "active" ? "border-green-500 text-green-600 mt-2" : "mt-2"}
              >
                {hr.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{hr.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{hr.phone}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{hr.department}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {hr.name} has processed {hr.candidatesProcessed} candidates.
                  </p>
                  <div className="mt-4 bg-muted/40 p-8 rounded-xl text-center">
                    <p>Performance metrics are under development.</p>
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
                  <CardTitle>HR Staff Settings</CardTitle>
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

export default HRDetail;
