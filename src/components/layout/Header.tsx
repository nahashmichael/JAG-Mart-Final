import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, ShoppingBag, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useNavigationStore } from '@/lib/store/navigation';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { categories, subcategories } = useNavigationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary-green" />
              <span className="ml-2 text-xl font-bold text-primary-brown">JagMart</span>
            </Link>

            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              <div className="relative group">
                <button 
                  className="px-3 py-2 rounded-md text-sm font-medium text-primary-brown hover:text-primary-green transition-colors duration-200 flex items-center"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  Categories
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {/* Mega Menu */}
                <div className={`absolute top-full left-0 w-screen max-w-7xl bg-white shadow-lg rounded-b-lg transform transition-all duration-200 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="grid grid-cols-4 gap-6 p-6">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-4">
                        <Link 
                          to={`/category/${category.id}`}
                          className="text-lg font-semibold text-primary-brown hover:text-primary-green"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-2">
                          {subcategories
                            .filter(sub => sub.category_id === category.id)
                            .map(subcategory => (
                              <li key={subcategory.id}>
                                <Link
                                  to={`/subcategory/${subcategory.id}`}
                                  className="text-sm text-gray-600 hover:text-primary-green"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="ml-4 p-2 text-primary-brown hover:text-primary-green transition-colors duration-200 relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                <Link
                  to="/profile"
                  className="ml-4 p-2 text-primary-brown hover:text-primary-green transition-colors duration-200"
                >
                  <User className="h-6 w-6" />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-green hover:bg-primary-green-dark transition-colors duration-200"
              >
                Sign in
              </Link>
            )}

            <button className="ml-4 p-2 text-primary-brown hover:text-primary-green transition-colors duration-200 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}