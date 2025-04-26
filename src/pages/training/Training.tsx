import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from '@/components/layout/MainLayout';
import TrainingHeader from "@/components/training/TrainingHeader";
import CategorySelector from "@/components/training/CategorySelector";
import VideoSection from "@/components/training/VideoSection";
import AssessmentSection from "@/components/training/AssessmentSection";

export interface CategoryWithContent {
  id: string;
  name: string;
  description: string | null;
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
      console.log("Fetching training categories for job:", jobId);
      
      // Fetch categories associated with the job
      const { data: jobCategoriesData, error: jobCategoriesError } = await supabase
        .from('job_categories')
        .select('category_id')
        .eq('job_id', jobId);
        
      if (jobCategoriesError) {
        console.error("Error fetching job categories:", jobCategoriesError);
        throw jobCategoriesError;
      }
      
      console.log("Job categories data:", jobCategoriesData);
      
      if (!jobCategoriesData || jobCategoriesData.length === 0) {
        // No categories found for this job
        console.log("No categories found for this job");
        setCategories([]);
        return;
      }
      
      // Extract category IDs
      const categoryIds = jobCategoriesData.map(item => item.category_id);
      console.log("Category IDs:", categoryIds);
      
      // Fetch detailed category information
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('module_categories')
        .select('*')
        .in('id', categoryIds);
        
      if (categoriesError) {
        console.error("Error fetching categories data:", categoriesError);
        throw categoriesError;
      }
      
      console.log("Categories data:", categoriesData);
      
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
        console.log("Processing category:", category.name);
        
        // Fetch videos associated with this category
        const { data: categoryVideosData, error: categoryVideosError } = await supabase
          .from('category_videos')
          .select('videos:video_id(*)')
          .eq('category_id', category.id);
          
        if (categoryVideosError) {
          console.error("Error fetching category videos:", categoryVideosError);
          throw categoryVideosError;
        }
        
        console.log("Category videos data:", categoryVideosData);
        
        const videos = categoryVideosData
          ? categoryVideosData.map(item => item.videos).filter(Boolean)
          : [];
        
        console.log("Processed videos:", videos);
        
        // Fetch quizzes associated with this category
        let quizzes: any[] = [];
        if (category.quiz_ids && category.quiz_ids.length > 0) {
          const { data: quizzesData, error: quizzesError } = await supabase
            .from('assessments')
            .select('*')
            .in('id', category.quiz_ids);
            
          if (quizzesError) {
            console.error("Error fetching quizzes:", quizzesError);
            throw quizzesError;
          }
          
          console.log("Quizzes data:", quizzesData);
          quizzes = quizzesData || [];
        } else {
          console.log("No quiz_ids found for category:", category.name);
        }
        
        categoriesWithContent.push({
          ...category,
          videos,
          quizzes
        });
      }
      
      console.log("Final categories with content:", categoriesWithContent);
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
        <TrainingHeader jobTitle={selectedJob?.title} />
        
        {categories.length > 0 ? (
          <>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
            />
            
            {selectedCategory && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4">{selectedCategory.name} Training</h2>
                  {selectedCategory.description && (
                    <p className="text-gray-600 mb-6">{selectedCategory.description}</p>
                  )}
                </div>
                
                <VideoSection videos={selectedCategory.videos} />
                <AssessmentSection quizzes={selectedCategory.quizzes} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No training content available for this job.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Training;
