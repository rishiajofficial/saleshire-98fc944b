
import React, { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from '@/components/layout/MainLayout';
import TrainingHeader from "@/components/training/TrainingHeader";
import CategorySelector from "@/components/training/CategorySelector";
import VideoSection from "@/components/training/VideoSection";
import AssessmentSection from "@/components/training/AssessmentSection";
import { toast } from "sonner";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";

export interface CategoryWithContent {
  id: string;
  name: string;
  description: string | null;
  videos: any[];
  quizzes: any[];
  quiz_ids?: string[]; // Make it optional to fix TS error
}

const Training = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryWithContent[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Use the shared training progress hook to maintain consistency
  const { trainingModules, isLoading: isLoadingModules } = useTrainingProgress();

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
          await fetchModuleCategories();
        }
      } catch (error) {
        console.error("Error in checkAccessAndFetchData:", error);
        toast.error("Failed to load training data");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccessAndFetchData();
  }, [user]);

  // Modified function to fetch all module categories and their videos
  const fetchModuleCategories = async () => {
    try {
      console.log("Fetching all available training categories");
      
      // Fetch all available categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('module_categories')
        .select('*')
        .order('name');
        
      if (categoriesError) {
        console.error("Error fetching categories data:", categoriesError);
        throw categoriesError;
      }
      
      console.log("Categories data:", categoriesData);
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        return;
      }
      
      // Set the first category as selected by default
      if (categoriesData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriesData[0].id);
      }
      
      // Fetch all videos
      const { data: allVideosData, error: allVideosError } = await supabase
        .from('videos')
        .select('*');
        
      if (allVideosError) {
        console.error("Error fetching all videos:", allVideosError);
        throw allVideosError;
      }
      
      console.log("All fetched videos:", allVideosData);
      
      // Fetch all category-video associations
      const { data: categoryVideosData, error: categoryVideosError } = await supabase
        .from('category_videos')
        .select('*');
        
      if (categoryVideosError) {
        console.error("Error fetching category videos associations:", categoryVideosError);
        throw categoryVideosError;
      }
      
      console.log("Category-video associations:", categoryVideosData);
      
      // Process categories and assign videos
      const categoriesWithContent: CategoryWithContent[] = categoriesData.map(category => {
        // Find video IDs associated with this category
        const categoryVideoIds = (categoryVideosData || [])
          .filter(cv => cv.category_id === category.id)
          .map(cv => cv.video_id);
        
        console.log(`Videos IDs for category ${category.name}:`, categoryVideoIds);
        
        // Find the actual video objects
        const videos = (allVideosData || []).filter(video => 
          categoryVideoIds.includes(video.id) || video.module === category.name
        );
        
        console.log(`Videos for category ${category.name}:`, videos);
        
        // Store quiz_ids from the category
        let quizIdsArray = category.quiz_ids || [];
        console.log(`Quiz IDs for category ${category.name}:`, quizIdsArray);
        
        if (!quizIdsArray || quizIdsArray.length === 0) {
          console.log(`No quiz_ids found for category: ${category.name}`);
        }
        
        // Initialize empty quizzes array to be populated later
        let quizzes: any[] = [];
        
        return {
          ...category,
          videos,
          quizzes,
          quiz_ids: quizIdsArray
        };
      });
      
      // Fetch all assessments and add to relevant categories
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*');
        
      if (!assessmentsError && assessmentsData) {
        console.log("All assessments:", assessmentsData);
        
        // Add assessments to categories that reference them in quiz_ids
        categoriesWithContent.forEach(category => {
          if (category.quiz_ids && category.quiz_ids.length > 0) {
            category.quizzes = assessmentsData.filter(assessment => 
              category.quiz_ids?.includes(assessment.id)
            );
            console.log(`Quizzes for category ${category.name}:`, category.quizzes);
          }
        });
      }
      
      console.log("Final categories with content:", categoriesWithContent);
      setCategories(categoriesWithContent);
    } catch (error) {
      console.error("Error fetching module categories:", error);
      toast.error("Failed to load training categories");
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  if (isLoading || isLoadingModules) {
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
                
                <VideoSection 
                  videos={selectedCategory.videos} 
                  moduleId={selectedCategory.id}
                />
                
                <AssessmentSection 
                  quizzes={selectedCategory.quizzes}
                  moduleId={selectedCategory.id} 
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No training content available. Please check back later.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Training;
