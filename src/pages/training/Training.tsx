
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Book, Calendar, Lock, Video } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from '@/components/layout/MainLayout';
import { TrainingCategory } from "@/hooks/useModuleCategories";

interface CategoryWithContent extends TrainingCategory {
  videos: any[];
  quizzes: any[];
}

const Training = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryWithContent[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const checkAccessAndFetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get candidate status
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('status, current_step')
          .eq('id', user.id)
          .single();
          
        if (candidateError) throw candidateError;
        
        // Check if candidate has access to training (after HR review)
        const hasTrainingAccess = candidateData.status === 'hr_approved' || 
                                candidateData.current_step >= 3;
        setHasAccess(hasTrainingAccess);
        
        // Get selected job from localStorage
        const selectedJobId = localStorage.getItem("selectedJob");
        if (!selectedJobId) {
          setIsLoading(false);
          return;
        }
        
        // Get job data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', selectedJobId)
          .single();
          
        if (jobError) throw jobError;
        setSelectedJob(jobData);
        
        if (hasTrainingAccess) {
          await fetchJobTrainingCategories(selectedJobId);
        }
      } catch (error) {
        console.error("Error in checkAccessAndFetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccessAndFetchData();
  }, [user]);

  const fetchJobTrainingCategories = async (jobId: string) => {
    try {
      // Fetch categories associated with the job
      const { data: jobCategoriesData, error: jobCategoriesError } = await supabase
        .from('job_categories')
        .select('category_id')
        .eq('job_id', jobId);
        
      if (jobCategoriesError) throw jobCategoriesError;
      
      if (!jobCategoriesData || jobCategoriesData.length === 0) {
        // No categories found for this job
        setCategories([]);
        return;
      }
      
      // Extract category IDs
      const categoryIds = jobCategoriesData.map(item => item.category_id);
      
      // Fetch detailed category information
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('module_categories')
        .select('*')
        .in('id', categoryIds);
        
      if (categoriesError) throw categoriesError;
      
      if (!categoriesData) {
        setCategories([]);
        return;
      }
      
      // Set the first category as selected by default
      if (categoriesData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriesData[0].id);
      }
      
      // For each category, fetch associated videos and quizzes
      const categoriesWithContent: CategoryWithContent[] = [];
      
      for (const category of categoriesData) {
        // Fetch videos associated with this category
        const { data: categoryVideosData, error: categoryVideosError } = await supabase
          .from('category_videos')
          .select('videos:video_id(*)')
          .eq('category_id', category.id);
          
        if (categoryVideosError) throw categoryVideosError;
        
        const videos = categoryVideosData
          ? categoryVideosData.map(item => item.videos).filter(Boolean)
          : [];
        
        // Fetch quizzes associated with this category
        let quizzes: any[] = [];
        if (category.quiz_ids && category.quiz_ids.length > 0) {
          const { data: quizzesData, error: quizzesError } = await supabase
            .from('assessments')
            .select('*')
            .in('id', category.quiz_ids);
            
          if (quizzesError) throw quizzesError;
          quizzes = quizzesData || [];
        }
        
        categoriesWithContent.push({
          ...category,
          videos,
          quizzes
        });
      }
      
      setCategories(categoriesWithContent);
    } catch (error) {
      console.error("Error fetching job training categories:", error);
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!hasAccess) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Training Content Locked</h2>
          <p className="text-gray-600 mb-6">
            Training modules will be available after your application is reviewed by HR.
          </p>
        </div>
      </MainLayout>
    );
  }

  // Find the currently selected category
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Training Center</h1>
        
        {selectedJob && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h2 className="font-semibold text-blue-800">Training for: {selectedJob.title}</h2>
            <p className="text-sm text-gray-600">
              Complete the following training modules and assessments.
            </p>
          </div>
        )}
        
        {categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Training Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category.id)}
                  className="text-sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No training content available for this job.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {selectedCategory && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-4">{selectedCategory.name} Training</h2>
                  {selectedCategory.description && (
                    <p className="text-gray-600 mb-6">{selectedCategory.description}</p>
                  )}
                </div>
                
                {/* Videos section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Video className="h-5 w-5 mr-2 text-blue-500" /> Training Videos
                  </h3>
                  
                  {selectedCategory.videos.length === 0 ? (
                    <p className="text-gray-500 py-4">No videos available for this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedCategory.videos.map((video: any) => (
                        <Card key={video.id}>
                          <CardHeader>
                            <CardTitle className="text-md font-semibold">{video.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                              {video.description || "No description available."}
                            </p>
                            <Button asChild className="w-full">
                              <Link to={`/training/video/${video.id}`}>
                                Watch Video
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Quizzes section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Book className="h-5 w-5 mr-2 text-green-500" /> Assessments
                  </h3>
                  
                  {selectedCategory.quizzes.length === 0 ? (
                    <p className="text-gray-500 py-4">No assessments available for this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedCategory.quizzes.map((quiz: any) => (
                        <Card key={quiz.id}>
                          <CardHeader>
                            <CardTitle className="text-md font-semibold">{quiz.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-2">
                              {quiz.description || "No description available."}
                            </p>
                            <p className="text-xs font-medium mb-4">
                              Difficulty: {quiz.difficulty || "Not specified"}
                            </p>
                            <Button asChild className="w-full">
                              <Link to={`/training/assessment/${quiz.id}`}>
                                Take Assessment
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Training;
