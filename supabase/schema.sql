-- ============================================
-- NEXUS — Schema PostgreSQL (Supabase)
-- ============================================

-- Profils utilisateurs (étend auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cache des métadonnées média
CREATE TABLE media (
  external_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv', 'book', 'game', 'music')),
  title TEXT NOT NULL,
  year TEXT,
  poster_url TEXT,
  genres TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (external_id, media_type)
);

-- Journal — le cœur de l'app
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_external_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  consumed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 10),
  note TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_rewatch BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (media_external_id, media_type) REFERENCES media(external_id, media_type)
);

-- Wishlist
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_external_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  priority SMALLINT DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (media_external_id, media_type) REFERENCES media(external_id, media_type),
  UNIQUE(user_id, media_external_id, media_type)
);

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, consumed_at DESC);
CREATE INDEX idx_journal_user_type ON journal_entries(user_id, media_type);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_media_type ON media(media_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Media cache (lecture publique, insertion par users auth)
CREATE POLICY "Anyone can read media cache"
  ON media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert media"
  ON media FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update media"
  ON media FOR UPDATE USING (auth.role() = 'authenticated');

-- Journal entries
CREATE POLICY "Users can read own journal"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal"
  ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal"
  ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal"
  ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Wishlist
CREATE POLICY "Users can manage own wishlist"
  ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_journal
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_media
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
