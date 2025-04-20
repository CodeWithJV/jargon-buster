CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT NOT NULL,
    definition TEXT,
    understood BOOLEAN DEFAULT false,
    "dateAdded" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "dateUnderstood" TIMESTAMPTZ,
    "initialThoughts" TEXT,
    notes TEXT,
    eli5 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now() -- Add standard created_at timestamp
);

-- Optional: Add Row Level Security (RLS) policies if needed later
-- ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON terms FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated write access" ON terms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow owner update access" ON terms FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); -- Assuming a user_id column exists
-- CREATE POLICY "Allow owner delete access" ON terms FOR DELETE USING (auth.uid() = user_id); -- Assuming a user_id column exists
