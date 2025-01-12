/*
  # Add Demo Data for Indian Grocery Store

  1. Demo Data
    - Categories for Indian groceries
    - Subcategories for each category
    - Sample products with prices in INR
  
  2. Notes
    - All prices are in INR
    - Sample data focuses on common Indian grocery items
*/

-- Insert demo categories
INSERT INTO categories (id, name, description, image_url, is_active)
SELECT 
  gen_random_uuid(),
  name,
  description,
  image_url,
  is_active
FROM (VALUES
  ('Dal & Pulses', 'High-quality lentils and pulses', 'https://images.unsplash.com/photo-1585996746473-5c11d97d7794', true),
  ('Rice & Grains', 'Premium quality rice and grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c', true),
  ('Spices & Masalas', 'Authentic Indian spices and blends', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', true),
  ('Atta & Flours', 'Fresh flour varieties', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', true)
) AS t(name, description, image_url, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = t.name
);

-- Insert demo subcategories
DO $$
DECLARE
  dal_id uuid;
  rice_id uuid;
  spices_id uuid;
  flour_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO dal_id FROM categories WHERE name = 'Dal & Pulses';
  SELECT id INTO rice_id FROM categories WHERE name = 'Rice & Grains';
  SELECT id INTO spices_id FROM categories WHERE name = 'Spices & Masalas';
  SELECT id INTO flour_id FROM categories WHERE name = 'Atta & Flours';

  -- Insert subcategories
  INSERT INTO subcategories (id, category_id, name, description, is_active)
  SELECT
    gen_random_uuid(),
    CASE
      WHEN category_name = 'Dal & Pulses' THEN dal_id
      WHEN category_name = 'Rice & Grains' THEN rice_id
      WHEN category_name = 'Spices & Masalas' THEN spices_id
      WHEN category_name = 'Atta & Flours' THEN flour_id
    END,
    name,
    description,
    true
  FROM (VALUES
    ('Dal & Pulses', 'Yellow Dal', 'Various types of yellow lentils'),
    ('Dal & Pulses', 'Green Dal', 'Healthy green lentil varieties'),
    ('Rice & Grains', 'Basmati Rice', 'Premium long-grain rice'),
    ('Rice & Grains', 'Brown Rice', 'Nutritious whole grain rice'),
    ('Spices & Masalas', 'Whole Spices', 'Authentic whole Indian spices'),
    ('Spices & Masalas', 'Ground Spices', 'Freshly ground spice powders'),
    ('Atta & Flours', 'Wheat Flour', 'Traditional Indian wheat flour'),
    ('Atta & Flours', 'Special Flours', 'Specialty flour varieties')
  ) AS t(category_name, name, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM subcategories s 
    WHERE s.name = t.name 
    AND s.category_id = CASE
      WHEN t.category_name = 'Dal & Pulses' THEN dal_id
      WHEN t.category_name = 'Rice & Grains' THEN rice_id
      WHEN t.category_name = 'Spices & Masalas' THEN spices_id
      WHEN t.category_name = 'Atta & Flours' THEN flour_id
    END
  );

  -- Insert products
  INSERT INTO products (
    id,
    subcategory_id,
    name,
    description,
    price,
    stock_quantity,
    image_url,
    is_active
  )
  SELECT
    gen_random_uuid(),
    s.id,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.image_url,
    true
  FROM (VALUES
    ('Yellow Dal', 'Toor Dal', 'Premium quality toor dal', 120.00, 100, 'https://images.unsplash.com/photo-1585996746473-5c11d97d7794'),
    ('Yellow Dal', 'Moong Dal', 'Split yellow moong dal', 140.00, 100, 'https://images.unsplash.com/photo-1585996746473-5c11d97d7794'),
    ('Green Dal', 'Green Moong Dal', 'Whole green moong dal', 160.00, 100, 'https://images.unsplash.com/photo-1585996746473-5c11d97d7794'),
    ('Basmati Rice', 'Premium Basmati', 'Aged premium basmati rice', 250.00, 100, 'https://images.unsplash.com/photo-1586201375761-83865001e31c'),
    ('Basmati Rice', 'Classic Basmati', 'Traditional basmati rice', 200.00, 100, 'https://images.unsplash.com/photo-1586201375761-83865001e31c'),
    ('Brown Rice', 'Organic Brown Rice', 'Organic whole grain brown rice', 180.00, 100, 'https://images.unsplash.com/photo-1586201375761-83865001e31c'),
    ('Whole Spices', 'Cardamom', 'Green cardamom pods', 90.00, 100, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d'),
    ('Whole Spices', 'Cinnamon', 'Ceylon cinnamon sticks', 80.00, 100, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d'),
    ('Ground Spices', 'Turmeric Powder', 'Pure ground turmeric', 60.00, 100, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d'),
    ('Ground Spices', 'Red Chilli Powder', 'Premium red chilli powder', 70.00, 100, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d'),
    ('Wheat Flour', 'Chakki Atta', 'Fresh chakki ground wheat flour', 45.00, 100, 'https://images.unsplash.com/photo-1509440159596-0249088772ff'),
    ('Wheat Flour', 'Whole Wheat Atta', 'Traditional whole wheat flour', 50.00, 100, 'https://images.unsplash.com/photo-1509440159596-0249088772ff'),
    ('Special Flours', 'Besan', 'Gram flour', 85.00, 100, 'https://images.unsplash.com/photo-1509440159596-0249088772ff'),
    ('Special Flours', 'Rice Flour', 'Fine rice flour', 65.00, 100, 'https://images.unsplash.com/photo-1509440159596-0249088772ff')
  ) AS p(subcategory_name, name, description, price, stock_quantity, image_url)
  JOIN subcategories s ON s.name = p.subcategory_name
  WHERE NOT EXISTS (
    SELECT 1 FROM products pr 
    WHERE pr.name = p.name 
    AND pr.subcategory_id = s.id
  );
END $$;