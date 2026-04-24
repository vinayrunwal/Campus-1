
-- ==========================================
-- NOTES TABLE
-- ==========================================
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  semester TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'PDF',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view approved notes" ON public.notes
  FOR SELECT USING (
    status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can upload notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- INTERNSHIPS TABLE
-- ==========================================
CREATE TABLE public.internships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Remote' CHECK (type IN ('Remote', 'Hybrid', 'On-site')),
  stipend TEXT NOT NULL DEFAULT '',
  description TEXT,
  apply_link TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  posted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view approved internships" ON public.internships
  FOR SELECT USING (
    status = 'approved' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tpo')
  );

CREATE POLICY "TPO and admin can insert internships" ON public.internships
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tpo')
  );

CREATE POLICY "TPO and admin can update internships" ON public.internships
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tpo')
  );

CREATE POLICY "Admin can delete internships" ON public.internships
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- EVENTS TABLE
-- ==========================================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL DEFAULT '',
  event_date TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL DEFAULT 'Event',
  registration_link TEXT,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  posted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active events" ON public.events
  FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin and club_manager can insert events" ON public.events
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'club_manager')
  );

CREATE POLICY "Admin and posted_by can update events" ON public.events
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR auth.uid() = posted_by
  );

CREATE POLICY "Admin can delete events" ON public.events
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- EVENT REGISTRATIONS TABLE
-- ==========================================
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- COMPLAINTS TABLE
-- ==========================================
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  admin_note TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can submit complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints" ON public.complaints
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Users can delete own open complaints" ON public.complaints
  FOR DELETE USING (auth.uid() = user_id AND status = 'open');

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- ANNOUNCEMENTS TABLE
-- ==========================================
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  urgent BOOLEAN NOT NULL DEFAULT false,
  posted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view announcements" ON public.announcements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update announcements" ON public.announcements
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete announcements" ON public.announcements
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- CLUBS TABLE
-- ==========================================
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  managed_by UUID,
  member_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view clubs" ON public.clubs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage clubs" ON public.clubs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- CLUB MEMBERSHIPS TABLE
-- ==========================================
CREATE TABLE public.club_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view club memberships" ON public.club_memberships
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join clubs" ON public.club_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs" ON public.club_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- INTERNSHIP APPLICATIONS TABLE
-- ==========================================
CREATE TABLE public.internship_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(internship_id, user_id)
);

ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.internship_applications
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tpo'));

CREATE POLICY "Users can apply for internships" ON public.internship_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update applications" ON public.internship_applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tpo'));

-- ==========================================
-- STORAGE BUCKET FOR NOTES
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload notes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');

CREATE POLICY "Everyone can download notes" ON storage.objects
  FOR SELECT USING (bucket_id = 'notes');

CREATE POLICY "Users can delete own notes files" ON storage.objects
  FOR DELETE USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);
