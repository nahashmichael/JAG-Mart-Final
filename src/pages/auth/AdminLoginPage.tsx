import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Shield } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, sign in the user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) throw signInError;
      if (!authData?.user) throw new Error('Authentication failed');

      // Then check if they're an admin using a direct query
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('is_super_admin')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (adminError) throw adminError;
      
      if (!adminData?.is_super_admin) {
        throw new Error('Unauthorized access. Admin privileges required.');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-green-light/10 to-primary-brown-light/10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-primary-green" />
              <span className="text-2xl font-bold text-primary-brown">JagMart</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary-green" />
            <h2 className="mt-6 text-3xl font-extrabold text-primary-brown">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Secure access for administrators only
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-green focus:border-primary-green focus:z-10 sm:text-sm"
                  placeholder="Admin email"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-green focus:border-primary-green focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in as Admin'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-primary-green hover:text-primary-green-dark transition-colors duration-200">
                Regular user? Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}