import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  itemCount: number;
}

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      // Fetch categories with product count
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          description,
          image_url,
          subcategories (
            products (count)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const categoriesWithCount = data?.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image_url: category.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop',
        itemCount: category.subcategories.reduce((sum, sub) => sum + (sub.products?.[0]?.count || 0), 0)
      })) || [];

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 animate-fade-in">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-primary-brown sm:text-6xl">
                  Quality Indian Groceries at Your Doorstep
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  From premium dal and rice to fresh spices and snacks. Get authentic Indian groceries delivered to your home.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to="/category/daily-needs"
                    className="rounded-md bg-primary-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-green-dark transition-colors duration-200"
                  >
                    Shop Daily Needs
                  </Link>
                  <Link
                    to="/about"
                    className="text-sm font-semibold leading-6 text-primary-brown hover:text-primary-brown-dark transition-colors"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80"
            alt="Indian groceries"
          />
        </div>
      </div>

      {/* Featured Categories */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-primary-brown sm:text-4xl mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative animate-slide-up hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4 p-4">
                <h3 className="text-lg font-medium text-primary-brown group-hover:text-primary-green transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{category.itemCount} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}