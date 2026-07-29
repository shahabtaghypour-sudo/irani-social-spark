CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL DEFAULT 'other',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone"
ON public.listings FOR SELECT TO anon, authenticated
USING (status = 'active');

CREATE POLICY "Sellers can view their own listings"
ON public.listings FOR SELECT TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = listings.seller_id));

CREATE POLICY "Sellers can create their own listings"
ON public.listings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = listings.seller_id));

CREATE POLICY "Sellers can update their own listings"
ON public.listings FOR UPDATE TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = listings.seller_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = listings.seller_id));

CREATE POLICY "Sellers can delete their own listings"
ON public.listings FOR DELETE TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = listings.seller_id));

CREATE INDEX listings_created_at_idx ON public.listings (created_at DESC);

CREATE POLICY "Authenticated users can upload their own media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can read media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);