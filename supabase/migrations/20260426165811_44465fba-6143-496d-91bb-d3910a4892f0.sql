-- Add code and code_type columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS code_type text;

-- Backfill existing rows with a short unique code derived from id (max 10 chars)
UPDATE public.products
SET code = COALESCE(code, substr(replace(id::text, '-', ''), 1, 10))
WHERE code IS NULL;

UPDATE public.products
SET code_type = COALESCE(code_type, 'NDC')
WHERE code_type IS NULL;

-- Enforce constraints
ALTER TABLE public.products
  ALTER COLUMN code SET NOT NULL,
  ALTER COLUMN code_type SET NOT NULL,
  ADD CONSTRAINT products_code_length_check CHECK (char_length(code) <= 10),
  ADD CONSTRAINT products_code_type_length_check CHECK (char_length(code_type) <= 10),
  ADD CONSTRAINT products_code_unique UNIQUE (code);
