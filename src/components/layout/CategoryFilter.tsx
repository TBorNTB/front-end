"use client";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  title?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  title = "카테고리"
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange('all')}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>전체</span>
        </button>
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
