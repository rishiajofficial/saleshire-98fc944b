
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreHorizontal,
  PenLine,
  Trash2,
  Video,
  FileText,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TrainingManagement = () => {
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("videos");

  // Mock data for demonstration
  const trainingVideos = [
    {
      id: "1",
      title: "Product Knowledge: Security Locks Overview",
      description: "Introduction to our security lock products, features and benefits",
      module: "product",
      url: "https://example.com/videos/product-locks",
      duration: "12:34",
      createdAt: "2023-07-15"
    },
    {
      id: "2",
      title: "Sales Techniques: Handling Objections",
      description: "Learn how to effectively handle common customer objections",
      module: "sales",
      url: "https://example.com/videos/sales-objections",
      duration: "15:21",
      createdAt: "2023-08-10"
    },
    {
      id: "3",
      title: "Relationship Building: Retailer Partnerships",
      description: "Strategies for building long-term relationships with retailers",
      module: "relationship",
      url: "https://example.com/videos/retailer-relationships",
      duration: "08:45",
      createdAt: "2023-09-05"
    },
  ];

  const quizzes = [
    {
      id: "1",
      title: "Product Knowledge Assessment",
      description: "Test understanding of our security lock products",
      module: "product",
      questionCount: 10,
      passingScore: 70,
      createdAt: "2023-07-20"
    },
    {
      id: "2",
      title: "Sales Techniques Quiz",
      description: "Evaluate knowledge of sales approaches and techniques",
      module: "sales",
      questionCount: 15,
      passingScore: 75,
      createdAt: "2023-08-15"
    },
    {
      id: "3",
      title: "Relationship Building Assessment",
      description: "Test understanding of relationship management principles",
      module: "relationship",
      questionCount: 8,
      passingScore: 80,
      createdAt: "2023-09-10"
    },
  ];

  const handleAddVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New training video added successfully");
    setShowVideoDialog(false);
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleAddQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New quiz added successfully");
    setShowQuizDialog(false);
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleDeleteContent = (contentType: string, id: string) => {
    toast.success(`${contentType} deleted successfully`);
  };

  const filteredVideos = trainingVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage training videos and quizzes for the sales training program
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="videos">Training Videos</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          {/* Training Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Training Videos</h2>
                <p className="text-muted-foreground">Manage training video content for candidates</p>
              </div>
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add New Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Training Video</DialogTitle>
                    <DialogDescription>
                      Upload a new training video for candidate education.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddVideo}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Video Title</Label>
                        <Input id="title" placeholder="Enter video title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Enter video description" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="module">Module</Label>
                        <Select defaultValue="product">
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product Knowledge</SelectItem>
                            <SelectItem value="sales">Sales Techniques</SelectItem>
                            <SelectItem value="relationship">Relationship Building</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input 
                          id="videoUrl" 
                          placeholder="https://example.com/video" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (MM:SS)</Label>
                        <Input 
                          id="duration" 
                          placeholder="12:34" 
                          required 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowVideoDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Video</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="hidden md:table-cell">Duration</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVideos.length > 0 ? (
                        filteredVideos.map((video) => (
                          <TableRow key={video.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center">
                                  <Video className="h-4 w-4 mr-2 text-primary" />
                                  {video.title}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {video.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                video.module === "product" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : video.module === "sales" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }>
                                {video.module === "product" 
                                  ? "Product Knowledge" 
                                  : video.module === "sales" 
                                  ? "Sales Techniques"
                                  : "Relationship Building"
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {video.duration}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Edit Video"
                                >
                                  <PenLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Video"
                                  onClick={() => handleDeleteContent('Video', video.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="More Options"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">No videos found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Training Quizzes</h2>
                <p className="text-muted-foreground">Manage quizzes for training module assessment</p>
              </div>
              <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Training Quiz</DialogTitle>
                    <DialogDescription>
                      Create a new quiz to assess candidate knowledge.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddQuiz}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="quizTitle">Quiz Title</Label>
                        <Input id="quizTitle" placeholder="Enter quiz title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quizDescription">Description</Label>
                        <Textarea 
                          id="quizDescription" 
                          placeholder="Enter quiz description" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quizModule">Module</Label>
                        <Select defaultValue="product">
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product Knowledge</SelectItem>
                            <SelectItem value="sales">Sales Techniques</SelectItem>
                            <SelectItem value="relationship">Relationship Building</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="questionCount">Number of Questions</Label>
                        <Input 
                          id="questionCount" 
                          type="number" 
                          min="1"
                          placeholder="10" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input 
                          id="passingScore" 
                          type="number"
                          min="1"
                          max="100"
                          placeholder="70" 
                          required 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowQuizDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Quiz</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="hidden md:table-cell">Questions</TableHead>
                        <TableHead className="hidden md:table-cell">Pass Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuizzes.length > 0 ? (
                        filteredQuizzes.map((quiz) => (
                          <TableRow key={quiz.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-primary" />
                                  {quiz.title}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {quiz.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                quiz.module === "product" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : quiz.module === "sales" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }>
                                {quiz.module === "product" 
                                  ? "Product Knowledge" 
                                  : quiz.module === "sales" 
                                  ? "Sales Techniques"
                                  : "Relationship Building"
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {quiz.questionCount} questions
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {quiz.passingScore}%
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Edit Quiz"
                                >
                                  <PenLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Quiz"
                                  onClick={() => handleDeleteContent('Quiz', quiz.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="More Options"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">No quizzes found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrainingManagement;
