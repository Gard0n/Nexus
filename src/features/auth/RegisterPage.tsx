import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, username);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold mb-4">Nexus</h1>
          <div className="bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent px-4 py-6 rounded-lg">
            <p className="font-medium mb-2">Compte créé !</p>
            <p className="text-sm text-nexus-text-muted">
              Vérifie ton email pour confirmer ton compte.
            </p>
          </div>
          <button
            onClick={onSwitchToLogin}
            className="mt-6 text-nexus-accent hover:underline cursor-pointer"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">Nexus</h1>
        <p className="text-nexus-text-muted text-center mb-8">
          Crée ton journal culturel
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full px-4 py-2.5 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text"
              placeholder="tonpseudo"
            />
          </div>

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
              placeholder="6 caractères minimum"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-nexus-text-muted mt-6">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-nexus-accent hover:underline cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
