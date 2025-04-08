
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
import { ArrowLeft, Mail, Phone, Briefcase, MapPin } from "lucide-react";

const DirectorDetail = () => {
  const { directorId } = useParams<{ directorId: string }>();
  
  // Placeholder data for a director
  const director = {
    id: directorId,
    name: "Director " + directorId,
    email: `director${directorId}@example.com`,
    phone: "+1 (555) 123-7890",
    department: "Sales",
    region: "North",
    status: "active",
    managersSupervised: 5,
    teamSize: 45
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Director Details</h1>
        <Button asChild variant="outline">
          <Link to="/directors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directors
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Director Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold">{director.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-bold mt-4">{director.name}</h2>
              <Badge 
                variant={director.status === "active" ? "outline" : "secondary"}
                className={director.status === "active" ? "border-green-500 text-green-600 mt-2" : "mt-2"}
              >
                {director.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{director.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{director.phone}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{director.department}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{director.region} Region</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="team">
            <TabsList>
              <TabsTrigger value="team">Team Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="team" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {director.name} supervises {director.managersSupervised} managers with a total team size of {director.teamSize} employees.
                  </p>
                  <div className="mt-4 bg-muted/40 p-8 rounded-xl text-center">
                    <p>Team organization chart is under development.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 p-8 rounded-xl text-center">
                    <p>Performance metrics are under development.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Director Settings</CardTitle>
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

export default DirectorDetail;
