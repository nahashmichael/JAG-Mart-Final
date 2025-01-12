import { create } from 'zustand';
import { supabase } from '../supabase';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface NavigationState {
  categories: Category[];
  subcategories: Subcategory[];
  fetchNavigation: () => Promise<void>;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  categories: [],
  subcategories: [],
  fetchNavigation: async () => {
    try {
      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch subcategories
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('is_active', true)
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      set({ 
        categories: categories || [], 
        subcategories: subcategories || [] 
      });
    } catch (error) {
      console.error('Error fetching navigation data:', error);
    }
  }
}));