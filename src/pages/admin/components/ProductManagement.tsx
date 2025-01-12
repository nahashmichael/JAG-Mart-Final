import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Upload, Trash2 } from 'lucide-react';
import { AddItemModal } from '@/components/admin/AddItemModal';
import { ExcelUploadModal } from '@/components/admin/ExcelUploadModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  subcategory_id: string;
  is_active: boolean;
  subcategory: {
    name: string;
    category: {
      name: string;
    };
  };
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string; category_id: string }>>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;
      setCategories(data || []);

      // Fetch subcategories after categories
      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('is_active', true);

      if (subcategoryError) throw subcategoryError;
      setSubcategories(subcategoryData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          subcategory:subcategories (
            name,
            category:categories (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(productId: string) {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          stock_quantity: editForm.stock_quantity,
          image_url: editForm.image_url,
          is_active: editForm.is_active
        })
        .eq('id', productId);

      if (error) throw error;
      
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  async function handleDelete(product: Product) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct === product.id ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{product.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.subcategory.category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.subcategory.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct === product.id ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">₹{product.price.toFixed(2)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct === product.id ? (
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock_quantity || ''}
                      onChange={(e) => setEditForm({ ...editForm, stock_quantity: parseInt(e.target.value) })}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingProduct === product.id ? (
                    <ImageUpload
                      folder="products"
                      currentImageUrl={editForm.image_url || ''}
                      onImageUrl={(url) => setEditForm({ ...editForm, image_url: url })}
                    />
                  ) : (
                    product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-20 w-20 object-cover rounded"
                      />
                    )
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct === product.id ? (
                    <select
                      value={editForm.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingProduct === product.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(product.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product.id);
                          setEditForm({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            stock_quantity: product.stock_quantity,
                            image_url: product.image_url,
                            is_active: product.is_active
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addModalOpen && (
        <AddItemModal
          type="product"
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchProducts();
          }}
          categories={categories}
          subcategories={subcategories}
        />
      )}

      {uploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            setUploadModalOpen(false);
            fetchProducts();
          }}
        />
      )}

      {deleteModalOpen && productToDelete && (
        <DeleteConfirmationModal
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(productToDelete)}
          onCancel={() => {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
}