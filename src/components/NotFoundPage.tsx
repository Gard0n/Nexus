import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-nexus-text-muted">
      <Compass size={64} className="mb-6 opacity-30" />
      <h1 className="text-4xl font-bold text-nexus-text mb-2">404</h1>
      <p className="text-lg mb-6">Cette page n'existe pas.</p>
      <Link
        to="/"
        className="px-6 py-2 bg-nexus-accent text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Retour au journal
      </Link>
    </div>
  );
}
