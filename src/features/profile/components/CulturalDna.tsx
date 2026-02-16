import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Star, TrendingUp, Calendar } from 'lucide-react';
import type { CulturalDnaStats } from '@/hooks/useCulturalDna';
import { MEDIA_CONFIG } from '@/types/media';

interface CulturalDnaProps {
  stats: CulturalDnaStats;
}

export function CulturalDna({ stats }: CulturalDnaProps) {
  if (stats.totalEntries === 0) {
    return (
      <div className="text-center py-12 text-nexus-text-muted">
        <p className="text-lg mb-2">Pas encore d'ADN culturel</p>
        <p className="text-sm">Ajoute au moins 5 œuvres à ton journal pour générer ton profil.</p>
      </div>
    );
  }

  // Prepare data for charts
  const mediaData = Object.entries(stats.mediaBreakdown)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: MEDIA_CONFIG[type as keyof typeof MEDIA_CONFIG].label,
      value: count,
      color: MEDIA_CONFIG[type as keyof typeof MEDIA_CONFIG].color,
    }));

  const genreData = stats.topGenres.map((g) => ({
    genre: g.genre.length > 15 ? g.genre.slice(0, 15) + '...' : g.genre,
    count: g.count,
  }));

  // Radar data (top 6 genres for better visualization)
  const radarData = stats.topGenres.slice(0, 6).map((g) => ({
    genre: g.genre.length > 12 ? g.genre.slice(0, 12) + '...' : g.genre,
    value: g.count,
  }));

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <div className="text-2xl font-bold text-nexus-accent">{stats.totalEntries}</div>
          <div className="text-sm text-nexus-text-muted">Œuvres</div>
        </div>
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <div className="flex items-center gap-1 text-2xl font-bold text-nexus-accent">
            <Star size={20} fill="var(--color-nexus-accent)" />
            {stats.averageRating}/10
          </div>
          <div className="text-sm text-nexus-text-muted">Note moyenne</div>
        </div>
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <div className="text-2xl font-bold text-nexus-accent">
            {stats.favoriteType ? MEDIA_CONFIG[stats.favoriteType].label : '-'}
          </div>
          <div className="text-sm text-nexus-text-muted">Type favori</div>
        </div>
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <div className="text-2xl font-bold text-nexus-accent capitalize">
            {stats.mostActiveMonth}
          </div>
          <div className="text-sm text-nexus-text-muted">Mois le plus actif</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Media Breakdown - Donut */}
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-nexus-accent" />
            Répartition par média
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mediaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {mediaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-nexus-surface)',
                  border: '1px solid var(--color-nexus-border)',
                  borderRadius: '8px',
                  color: 'var(--color-nexus-text)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {mediaData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-nexus-text-muted">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres - Radar */}
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-nexus-accent" />
            Top genres
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-nexus-border)" />
              <PolarAngleAxis
                dataKey="genre"
                tick={{ fill: 'var(--color-nexus-text-muted)', fontSize: 12 }}
              />
              <Radar
                dataKey="value"
                stroke="var(--color-nexus-accent)"
                fill="var(--color-nexus-accent)"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-nexus-surface)',
                  border: '1px solid var(--color-nexus-border)',
                  borderRadius: '8px',
                  color: 'var(--color-nexus-text)',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-nexus-accent" />
            Activité (12 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.entriesByMonth}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--color-nexus-text-muted)', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'var(--color-nexus-text-muted)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-nexus-surface)',
                  border: '1px solid var(--color-nexus-border)',
                  borderRadius: '8px',
                  color: 'var(--color-nexus-text)',
                }}
              />
              <Bar dataKey="count" fill="var(--color-nexus-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
