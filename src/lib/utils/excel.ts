import * as XLSX from 'xlsx';
import { z } from 'zod';
import { supabase } from '../supabase';

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(), // Base64 image data
  is_active: z.boolean().default(true),
});

const subcategorySchema = z.object({
  name: z.string().min(1),
  category_name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(), // Base64 image data
  is_active: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1),
  category_name: z.string().min(1),
  subcategory_name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  image: z.string().optional(), // Base64 image data
  is_active: z.boolean().default(true),
});

async function uploadBase64Image(base64Data: string, folder: string): Promise<string> {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();

    // Generate unique filename
    const fileName = `${Math.random()}.${blob.type.split('/')[1]}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function parseExcelFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result = {
          categories: [],
          subcategories: [],
          products: [],
          errors: [] as string[],
        };

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          switch (sheetName.toLowerCase()) {
            case 'categories':
              for (const [index, row] of jsonData.entries()) {
                try {
                  const validatedData = categorySchema.parse(row);
                  if (validatedData.image) {
                    validatedData.image_url = await uploadBase64Image(validatedData.image, 'categories');
                    delete validatedData.image;
                  }
                  result.categories.push(validatedData);
                } catch (error) {
                  result.errors.push(`Row ${index + 2} in Categories: ${error.message}`);
                }
              }
              break;

            case 'subcategories':
              for (const [index, row] of jsonData.entries()) {
                try {
                  const validatedData = subcategorySchema.parse(row);
                  if (validatedData.image) {
                    validatedData.image_url = await uploadBase64Image(validatedData.image, 'subcategories');
                    delete validatedData.image;
                  }
                  result.subcategories.push(validatedData);
                } catch (error) {
                  result.errors.push(`Row ${index + 2} in Subcategories: ${error.message}`);
                }
              }
              break;

            case 'products':
              for (const [index, row] of jsonData.entries()) {
                try {
                  const validatedData = productSchema.parse(row);
                  if (validatedData.image) {
                    validatedData.image_url = await uploadBase64Image(validatedData.image, 'products');
                    delete validatedData.image;
                  }
                  result.products.push(validatedData);
                } catch (error) {
                  result.errors.push(`Row ${index + 2} in Products: ${error.message}`);
                }
              }
              break;
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}