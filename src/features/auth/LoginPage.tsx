import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">Nexus</h1>
        <p className="text-nexus-text-muted text-center mb-8">
          Ton journal culturel
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-nexus-text-muted mt-6">
          Pas encore de compte ?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-nexus-accent hover:underline cursor-pointer"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
