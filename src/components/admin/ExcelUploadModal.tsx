import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { parseExcelFile } from '@/lib/utils/excel';
import { supabase } from '@/lib/supabase';

interface ExcelUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelUploadModal({ onClose, onSuccess }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setErrors([]);

    try {
      const result = await parseExcelFile(file);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      // Process categories
      for (const category of result.categories) {
        const { error } = await supabase
          .from('categories')
          .upsert({
            name: category.name,
            description: category.description,
            image_url: category.image_url,
            is_active: category.is_active,
          }, {
            onConflict: 'name'
          });

        if (error) throw error;
      }

      // Process subcategories
      for (const subcategory of result.subcategories) {
        // Find category ID
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', subcategory.category_name)
          .single();

        if (!categoryData) {
          setErrors(prev => [...prev, `Category "${subcategory.category_name}" not found for subcategory "${subcategory.name}"`]);
          continue;
        }

        const { error } = await supabase
          .from('subcategories')
          .upsert({
            name: subcategory.name,
            category_id: categoryData.id,
            description: subcategory.description,
            image_url: subcategory.image_url,
            is_active: subcategory.is_active,
          }, {
            onConflict: 'name,category_id'
          });

        if (error) throw error;
      }

      // Process products
      for (const product of result.products) {
        // Find subcategory ID
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('id, categories!inner(name)')
          .eq('name', product.subcategory_name)
          .eq('categories.name', product.category_name)
          .single();

        if (!subcategoryData) {
          setErrors(prev => [...prev, `Subcategory "${product.subcategory_name}" not found in category "${product.category_name}" for product "${product.name}"`]);
          continue;
        }

        const { error } = await supabase
          .from('products')
          .upsert({
            name: product.name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            subcategory_id: subcategoryData.id,
            is_active: product.is_active,
          }, {
            onConflict: 'name,subcategory_id'
          });

        if (error) throw error;
      }

      if (errors.length === 0) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      setErrors(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Excel File</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center text-red-800 mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Validation errors:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500">Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500">Excel files only</p>
              </div>
            </div>
          </div>

          {file && (
            <p className="text-sm text-gray-600">
              Selected file: {file.name}
            </p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}