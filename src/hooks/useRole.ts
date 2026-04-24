import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'student' | 'admin' | 'club_manager' | 'tpo';

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setRole((data?.role as AppRole) ?? 'student');
        setLoading(false);
      });
  }, [user]);

  return { role, loading, isAdmin: role === 'admin' };
};
