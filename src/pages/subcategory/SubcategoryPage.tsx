import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface Subcategory {
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
}

export function SubcategoryPage() {
  const { id } = useParams();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubcategoryAndProducts();
    }
  }, [id]);

  async function fetchSubcategoryAndProducts() {
    try {
      // Fetch subcategory details
      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('subcategories')
        .select(`
          name,
          description,
          category:categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (subcategoryError) throw subcategoryError;
      setSubcategory(subcategoryData);

      // Fetch products in this subcategory
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('subcategory_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (err) {
      setError('Failed to fetch subcategory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading subcategory...</div>
      </div>
    );
  }

  if (error || !subcategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Subcategory not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link 
            to={`/category/${subcategory.category.id}`}
            className="hover:text-primary-green"
          >
            {subcategory.category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">{subcategory.name}</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
        {subcategory.description && (
          <p className="mt-2 text-gray-600">{subcategory.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this subcategory</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}