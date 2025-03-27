import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Upload, RefreshCw, Video } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const Application = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    resume: null as File | null,
    aboutVideo: null as File | null,
    pitchVideo: null as File | null,
  });

  const [assessmentData, setAssessmentData] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssessmentChange = (question: string, value: string) => {
    setAssessmentData((prev) => ({ ...prev, [question]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'aboutVideo' | 'pitchVideo') => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [fileType]: e.target.files?.[0] || null }));
      toast.success(`${fileType === 'resume' ? 'Resume' : fileType === 'aboutVideo' ? 'About Me video' : 'Sales Pitch video'} uploaded successfully`);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const validatePersonalInfo = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast.error("Please fill in all personal information fields");
      return false;
    }
    return true;
  };

  const validateUploads = () => {
    if (!formData.resume || !formData.aboutVideo || !formData.pitchVideo) {
      toast.error("Please upload all required files");
      return false;
    }
    return true;
  };

  const validateAssessment = () => {
    const allAnswered = Object.values(assessmentData).every(value => value);
    if (!allAnswered) {
      toast.error("Please answer all assessment questions");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeTab === "personal" && validatePersonalInfo()) {
      setActiveTab("uploads");
    } else if (activeTab === "uploads" && validateUploads()) {
      setActiveTab("assessment");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "uploads") {
      setActiveTab("personal");
    } else if (activeTab === "assessment") {
      setActiveTab("uploads");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAssessment()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      toast.success("Application submitted successfully!");
      setIsSubmitting(false);
      navigate("/dashboard/candidate");
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sales Position Application</h1>
          <p className="mt-2 text-muted-foreground">
            Complete all sections to submit your application
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <div className="space-y-1">
                <CardTitle>Application Form</CardTitle>
                <CardDescription>
                  Please fill out all required information
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activeTab === "personal" || activeTab === "uploads" || activeTab === "assessment" ? "bg-primary text-white" : "bg-gray-200"}`}>
                  <span>1</span>
                </div>
                <div className={`w-8 h-1 ${activeTab === "uploads" || activeTab === "assessment" ? "bg-primary" : "bg-gray-200"}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activeTab === "uploads" || activeTab === "assessment" ? "bg-primary text-white" : "bg-gray-200"}`}>
                  <span>2</span>
                </div>
                <div className={`w-8 h-1 ${activeTab === "assessment" ? "bg-primary" : "bg-gray-200"}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activeTab === "assessment" ? "bg-primary text-white" : "bg-gray-200"}`}>
                  <span>3</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="uploads">Upload Files</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="py-4 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="uploads" className="py-4 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Resume/CV</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {formData.resume 
                            ? `Selected file: ${formData.resume.name}` 
                            : "Upload your resume in PDF format (Max 5MB)"}
                        </p>
                        <div>
                          <Label
                            htmlFor="resume-upload"
                            className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer"
                          >
                            {formData.resume ? "Replace File" : "Select File"}
                          </Label>
                          <Input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange(e, 'resume')}
                            className="sr-only"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>About Me Video</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Video className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {formData.aboutVideo 
                              ? `Selected file: ${formData.aboutVideo.name}` 
                              : "Upload a 1-2 minute self-introduction video"}
                          </p>
                          <div>
                            <Label
                              htmlFor="about-video-upload"
                              className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer"
                            >
                              {formData.aboutVideo ? "Replace File" : "Select File"}
                            </Label>
                            <Input
                              id="about-video-upload"
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileChange(e, 'aboutVideo')}
                              className="sr-only"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sales Pitch Video</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Video className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {formData.pitchVideo 
                              ? `Selected file: ${formData.pitchVideo.name}` 
                              : "Upload a 2-3 minute sales pitch for any product"}
                          </p>
                          <div>
                            <Label
                              htmlFor="pitch-video-upload"
                              className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer"
                            >
                              {formData.pitchVideo ? "Replace File" : "Select File"}
                            </Label>
                            <Input
                              id="pitch-video-upload"
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileChange(e, 'pitchVideo')}
                              className="sr-only"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="assessment" className="py-4 space-y-6">
                <div className="space-y-8">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Basic Sales Knowledge Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Please answer the following questions to the best of your ability
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>1. What is the most important element of a successful sales pitch?</Label>
                      <RadioGroup
                        value={assessmentData.q1}
                        onValueChange={(value) => handleAssessmentChange("q1", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id="q1-a" />
                          <Label htmlFor="q1-a" className="font-normal">Understanding customer needs</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id="q1-b" />
                          <Label htmlFor="q1-b" className="font-normal">Highlighting all product features</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="q1-c" />
                          <Label htmlFor="q1-c" className="font-normal">Quick delivery of information</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id="q1-d" />
                          <Label htmlFor="q1-d" className="font-normal">Lowest possible pricing</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>2. When a customer raises an objection, what is the best first response?</Label>
                      <RadioGroup
                        value={assessmentData.q2}
                        onValueChange={(value) => handleAssessmentChange("q2", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id="q2-a" />
                          <Label htmlFor="q2-a" className="font-normal">Immediately counter with benefits</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id="q2-b" />
                          <Label htmlFor="q2-b" className="font-normal">Listen and acknowledge their concern</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="q2-c" />
                          <Label htmlFor="q2-c" className="font-normal">Offer a discount</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id="q2-d" />
                          <Label htmlFor="q2-d" className="font-normal">Move on to another product feature</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>3. What is a key element of building long-term relationships with retail partners?</Label>
                      <RadioGroup
                        value={assessmentData.q3}
                        onValueChange={(value) => handleAssessmentChange("q3", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id="q3-a" />
                          <Label htmlFor="q3-a" className="font-normal">Only contacting them for new orders</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id="q3-b" />
                          <Label htmlFor="q3-b" className="font-normal">Consistent communication and follow-up</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="q3-c" />
                          <Label htmlFor="q3-c" className="font-normal">Undercutting competitor pricing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id="q3-d" />
                          <Label htmlFor="q3-d" className="font-normal">Offering exclusivity on all products</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>4. Which sales approach is most effective for high-value security products?</Label>
                      <RadioGroup
                        value={assessmentData.q4}
                        onValueChange={(value) => handleAssessmentChange("q4", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id="q4-a" />
                          <Label htmlFor="q4-a" className="font-normal">High-pressure closing techniques</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id="q4-b" />
                          <Label htmlFor="q4-b" className="font-normal">Focusing primarily on price</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="q4-c" />
                          <Label htmlFor="q4-c" className="font-normal">Consultative selling and needs assessment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id="q4-d" />
                          <Label htmlFor="q4-d" className="font-normal">One-size-fits-all product presentations</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>5. What metric is most important when evaluating a salesperson's performance?</Label>
                      <RadioGroup
                        value={assessmentData.q5}
                        onValueChange={(value) => handleAssessmentChange("q5", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id="q5-a" />
                          <Label htmlFor="q5-a" className="font-normal">Number of calls made</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id="q5-b" />
                          <Label htmlFor="q5-b" className="font-normal">Conversion rate and revenue generated</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="q5-c" />
                          <Label htmlFor="q5-c" className="font-normal">Hours worked per week</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id="q5-d" />
                          <Label htmlFor="q5-d" className="font-normal">Geographic territory size</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            {activeTab !== "personal" && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
            {activeTab !== "assessment" ? (
              <Button 
                type="button"
                className="ml-auto"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit"
                className="ml-auto"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Submit Application
                  </span>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Application;
