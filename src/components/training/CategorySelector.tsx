
import React from 'react';
import { Button } from "@/components/ui/button";
import { CategoryWithContent } from '@/pages/training/Training';

interface CategorySelectorProps {
  categories: CategoryWithContent[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
}

const CategorySelector = ({ categories, selectedCategoryId, onCategoryChange }: CategorySelectorProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Training Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className="text-sm"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
