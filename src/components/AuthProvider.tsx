import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth in background, don't block UI
    initialize();
  }, [initialize]);

  // Don't block rendering - allow guest mode
  return <>{children}</>;
}
