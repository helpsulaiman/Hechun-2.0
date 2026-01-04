-- Add status column if it doesn't exist
ALTER TABLE idioms 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- Add updated_at column if it doesn't exist
ALTER TABLE idioms 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing rows to have 'approved' status if null
UPDATE idioms SET status = 'approved' WHERE status IS NULL;
