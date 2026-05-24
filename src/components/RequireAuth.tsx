import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-text-primary">
        <div className="rounded-3xl border border-border bg-surface px-6 py-5 text-center shadow-lg">
          <p className="text-sm font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
