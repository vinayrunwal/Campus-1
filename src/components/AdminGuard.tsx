import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Loader2 } from 'lucide-react';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useRole();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default AdminGuard;
