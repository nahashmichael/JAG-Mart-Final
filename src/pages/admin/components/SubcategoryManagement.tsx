import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Upload, Trash2 } from 'lucide-react';
import { AddItemModal } from '@/components/admin/AddItemModal';
import { ExcelUploadModal } from '@/components/admin/ExcelUploadModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';

interface Subcategory {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string | null;
  is_active: boolean;
  category: {
    name: string;
  };
}

export function SubcategoryManagement() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subcategory>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchSubcategories();
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
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchSubcategories() {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select(`
          *,
          category:categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(subcategoryId: string) {
    try {
      const { error } = await supabase
        .from('subcategories')
        .update({
          name: editForm.name,
          description: editForm.description,
          image_url: editForm.image_url,
          is_active: editForm.is_active
        })
        .eq('id', subcategoryId);

      if (error) throw error;
      
      setEditingSubcategory(null);
      fetchSubcategories();
    } catch (error) {
      console.error('Error updating subcategory:', error);
    }
  }

  async function handleDelete(subcategory: Subcategory) {
    try {
      // First delete all products in this subcategory
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('subcategory_id', subcategory.id);

      if (productsError) throw productsError;

      // Then delete the subcategory
      const { error: subcategoryError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategory.id);

      if (subcategoryError) throw subcategoryError;
      
      setDeleteModalOpen(false);
      setSubcategoryToDelete(null);
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  }

  if (loading) {
    return <div>Loading subcategories...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
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
            {subcategories.map((subcategory) => (
              <tr key={subcategory.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingSubcategory === subcategory.id ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{subcategory.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subcategory.category.name}</div>
                </td>
                <td className="px-6 py-4">
                  {editingSubcategory === subcategory.id ? (
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      rows={2}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{subcategory.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingSubcategory === subcategory.id ? (
                    <ImageUpload
                      folder="subcategories"
                      currentImageUrl={editForm.image_url || ''}
                      onImageUrl={(url) => setEditForm({ ...editForm, image_url: url })}
                    />
                  ) : (
                    subcategory.image_url && (
                      <img
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        className="h-20 w-20 object-cover rounded"
                      />
                    )
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingSubcategory === subcategory.id ? (
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
                      subcategory.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subcategory.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingSubcategory === subcategory.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(subcategory.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingSubcategory(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingSubcategory(subcategory.id);
                          setEditForm({
                            name: subcategory.name,
                            description: subcategory.description,
                            image_url: subcategory.image_url,
                            is_active: subcategory.is_active
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSubcategoryToDelete(subcategory);
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
          type="subcategory"
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchSubcategories();
          }}
          categories={categories}
        />
      )}

      {uploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            setUploadModalOpen(false);
            fetchSubcategories();
          }}
        />
      )}

      {deleteModalOpen && subcategoryToDelete && (
        <DeleteConfirmationModal
          title="Delete Subcategory"
          message={`Are you sure you want to delete "${subcategoryToDelete.name}"? This will also delete all products in this subcategory. This action cannot be undone.`}
          onConfirm={() => handleDelete(subcategoryToDelete)}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSubcategoryToDelete(null);
          }}
        />
      )}
    </div>
  );
}