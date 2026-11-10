import React, { useState } from 'react';
import { Briefcase, Mail, MapPin, Send, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, Card, StatusBadge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';

interface ActivityPost {
  id: string;
  author: string;
  time: string;
  content: string;
  likes: number;
}

export function UserProfilePage() {
  const { user } = useAuth();
  const { contacts } = useAppData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'profile' | 'followers' | 'activity'>('profile');
  const [postDraft, setPostDraft] = useState('');
  const [posts, setPosts] = useState<ActivityPost[]>([
    {
      id: 'p-1',
      author: user.name,
      time: '2 hours ago',
      content:
        'Published Q4 Dashboard 3 telemetry upgrades — ROI tracking and Delivery Analytics radar views are live across all workspaces.',
      likes: 18,
    },
    {
      id: 'p-2',
      author: 'Erin Reid',
      time: 'Yesterday',
      content:
        'Finalized the 24px card elevation tokens and pill segmented tab transitions for dark and light themes.',
      likes: 24,
    },
  ]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDraft.trim()) return;
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        author: user.name,
        time: 'Just now',
        content: postDraft.trim(),
        likes: 0,
      },
      ...prev,
    ]);
    setPostDraft('');
    showToast('Update posted to activity feed', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'User Profile' }]}
      />

      {/* Hero Banner Card */}
      <Card padding="none" className="overflow-hidden">
        <div className="h-44 bg-gradient-to-r from-[#00a1ff] via-[#539bff] to-[#8965e5]" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-gradient-to-br from-[#00a1ff] to-[#00ceb6] text-2xl font-bold text-white shadow-md">
                {user.avatarInitials}
              </span>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-ink">{user.name}</h2>
                <p className="text-sm text-muted">{user.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-ink">938</p>
                <p className="text-xs text-muted">Projects</p>
              </div>
              <div>
                <p className="text-lg font-bold text-ink">4,562</p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-ink">2,659</p>
                <p className="text-xs text-muted">Following</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
            {(['profile', 'followers', 'activity'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'bg-light-primary text-primary'
                    : 'text-muted hover:bg-subtle hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {tab === 'followers' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-light-primary text-xs font-bold text-primary">
                  {c.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-xs text-muted">{c.role}</p>
                </div>
              </div>
              <StatusBadge label="Following" tone="primary" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-4">
            <Card>
              <h3 className="text-base font-semibold text-ink">Introduction</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Leading product analytics, operational dashboards, and design systems at MaterialM.
                Focused on turning complex revenue metrics into clear daily decisions.
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <p className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>{user.department}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span>{user.email}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-success" />
                  <span>{user.location}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-warning" />
                  <span>Role: {user.role}</span>
                </p>
              </div>
            </Card>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-8">
            <Card>
              <form onSubmit={handlePublish} className="space-y-3">
                <label htmlFor="profile-post" className="text-sm font-semibold text-ink">
                  Share an update
                </label>
                <textarea
                  id="profile-post"
                  rows={3}
                  value={postDraft}
                  onChange={(e) => setPostDraft(e.target.value)}
                  placeholder="Share milestone updates with your team..."
                  className="w-full rounded-2xl border border-border bg-surface p-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!postDraft.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Post Update
                  </Button>
                </div>
              </form>
            </Card>

            {posts.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-light-primary text-xs font-bold text-primary">
                      {p.author
                        .split(' ')
                        .map((s) => s[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{p.author}</p>
                      <p className="text-xs text-muted">{p.time}</p>
                    </div>
                  </div>
                  <StatusBadge label={`${p.likes} likes`} tone="primary" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink">{p.content}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
