// components/LinkGuard.tsx
import { Navigate } from 'react-router-dom';
import useLinkExpiration from './hooks/useLinkExpiration';

export default function LinkGuard({ children }: { children: React.ReactNode }) {
  const { expired, expiresAt } = useLinkExpiration();

  if (expired) return <Navigate to="/" replace />;

  // Optional banner:
  if (expiresAt) {
    const minutes = Math.max(0, Math.floor((+expiresAt - Date.now()) / 60000));
    return (
      <>
        <div style={{ background: '#fff3cd', padding: 8, textAlign: 'center' }}>
          Session expires in <strong>{minutes}</strong> min
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
