CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Conference',
  description text,
  date date NOT NULL,
  start_time time,
  end_time time,
  venue text NOT NULL DEFAULT '',
  organizer text NOT NULL DEFAULT '',
  expected_attendees integer NOT NULL DEFAULT 0,
  budget numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Completed','Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update" ON public.events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete" ON public.events FOR DELETE TO anon, authenticated USING (true);