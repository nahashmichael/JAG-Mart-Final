import { Product } from '@/lib/types';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await addItem(product, quantity);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-64">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full transform transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-primary-brown">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xl font-bold text-primary-red">
            ₹{product.price.toFixed(2)}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-full hover:bg-primary-green-light hover:text-white transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-primary-brown font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-full hover:bg-primary-green-light hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={loading || !user}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-green hover:bg-primary-green-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Adding...'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}