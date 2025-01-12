import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Upload, Trash2 } from 'lucide-react';
import { AddItemModal } from '@/components/admin/AddItemModal';
import { ExcelUploadModal } from '@/components/admin/ExcelUploadModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(categoryId: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editForm.name,
          description: editForm.description,
          image_url: editForm.image_url,
          is_active: editForm.is_active
        })
        .eq('id', categoryId);

      if (error) throw error;
      
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }

  async function handleDelete(category: Category) {
    try {
      // First, get all subcategories for this category
      const { data: subcategories } = await supabase
        .from('subcategories')
        .select('id')
        .eq('category_id', category.id);

      if (subcategories && subcategories.length > 0) {
        // Delete all products associated with these subcategories
        for (const subcategory of subcategories) {
          const { error: productsError } = await supabase
            .from('products')
            .delete()
            .eq('subcategory_id', subcategory.id);

          if (productsError) throw productsError;
        }

        // Delete all subcategories
        const { error: subcategoriesError } = await supabase
          .from('subcategories')
          .delete()
          .eq('category_id', category.id);

        if (subcategoriesError) throw subcategoriesError;
      }

      // Finally, delete the category
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (categoryError) throw categoryError;
      
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
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
                Description
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
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{category.name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingCategory === category.id ? (
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      rows={2}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{category.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingCategory === category.id ? (
                    <ImageUpload
                      folder="categories"
                      currentImageUrl={editForm.image_url || ''}
                      onImageUrl={(url) => setEditForm({ ...editForm, image_url: url })}
                    />
                  ) : (
                    category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-20 w-20 object-cover rounded"
                      />
                    )
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCategory === category.id ? (
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
                      category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingCategory === category.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(category.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditForm({
                            name: category.name,
                            description: category.description,
                            image_url: category.image_url,
                            is_active: category.is_active
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(category);
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
          type="category"
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchCategories();
          }}
        />
      )}

      {uploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            setUploadModalOpen(false);
            fetchCategories();
          }}
        />
      )}

      {deleteModalOpen && categoryToDelete && (
        <DeleteConfirmationModal
          title="Delete Category"
          message={`Are you sure you want to delete "${categoryToDelete.name}"? This will also delete all subcategories and products in this category. This action cannot be undone.`}
          onConfirm={() => handleDelete(categoryToDelete)}
          onCancel={() => {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
        />
      )}
    </div>
  );
}