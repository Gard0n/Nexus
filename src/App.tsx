import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/contexts/ToastContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { JournalPage } from '@/features/journal/JournalPage';
import { SearchPage } from '@/features/search/SearchPage';
import { WishlistPage } from '@/features/wishlist/WishlistPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';

  if (loading && !devMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-nexus-accent text-xl font-bold animate-pulse">Nexus</div>
      </div>
    );
  }

  if (!user && !devMode) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<JournalPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
