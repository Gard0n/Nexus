import { BookOpen, Search, Heart, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { signOut } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-nexus-accent/15 text-nexus-accent'
        : 'text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-surface-hover'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-nexus-surface border-t border-nexus-border z-50 md:static md:border-t-0 md:border-r md:w-56 md:min-h-screen md:flex md:flex-col">
      <div className="hidden md:block px-5 py-6">
        <h1 className="text-xl font-bold text-nexus-accent">Nexus</h1>
      </div>

      <div className="flex justify-around py-2 md:flex-col md:gap-1 md:px-3 md:py-0 md:flex-1">
        <NavLink to="/" className={linkClass}>
          <BookOpen size={20} />
          <span className="hidden md:inline text-sm">Journal</span>
        </NavLink>
        <NavLink to="/search" className={linkClass}>
          <Search size={20} />
          <span className="hidden md:inline text-sm">Recherche</span>
        </NavLink>
        <NavLink to="/wishlist" className={linkClass}>
          <Heart size={20} />
          <span className="hidden md:inline text-sm">Wishlist</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User size={20} />
          <span className="hidden md:inline text-sm">Profil</span>
        </NavLink>
      </div>

      <div className="hidden md:block px-3 pb-4">
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-nexus-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-sm cursor-pointer"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}
