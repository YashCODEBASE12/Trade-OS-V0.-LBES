import { ArrowUpRight, BrainCircuit, Globe2, Lock, Mic, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { labsCards } from '../data/reasontrack';
import { joinLabsWaitlist } from '../services/subscriptionService';
import { useAuthStore } from '../store/useAuthStore';

export default function Labs() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [waitlistStatus, setWaitlistStatus] = useState<string | null>(null);
  const activeCard = useMemo(() => labsCards.find((card) => card.id === activeDetailId) ?? null, [activeDetailId]);

  const handleJoinWaitlist = async () => {
    if (!user || !activeCard) {
      setWaitlistStatus('Sign in to join the waitlist.');
      return;
    }

    try {
      await joinLabsWaitlist(user.id, user.email ?? '', activeCard.id);
      setWaitlistStatus('Waitlist saved to Supabase.');
    } catch (error) {
      setWaitlistStatus(error instanceof Error ? error.message : 'Waitlist save failed.');
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Upcoming Intelligence</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">LBES Labs</h1>
      </div>

      <div className="space-y-4">
        {labsCards.map((card, index) => (
          <motion.button
            type="button"
            onClick={() => {
              setWaitlistStatus(null);
              setActiveDetailId(card.id);
            }}
            key={card.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            className="block w-full text-left"
          >
            <Card className="overflow-hidden">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary-soft text-primary">
                    <LabVisual kind={card.visual} compact />
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-text-secondary">{card.badge}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{card.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  Learn more
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>

      <Card className="bg-[radial-gradient(circle_at_top_right,_rgba(71,130,255,0.18),_transparent_42%),linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)]">
        <CardContent className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Future vision</p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">ReasonTrack is expanding from filtered signals into full execution intelligence.</h2>
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/pro')}>
            Upgrade Pro
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {activeCard ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0f172a]/28 backdrop-blur-md"
            onClick={() => setActiveDetailId(null)}
          >
            <motion.div
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 mx-auto h-[88vh] w-full max-w-[420px] overflow-hidden rounded-t-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(248,250,255,0.96)_0%,rgba(244,246,252,0.96)_100%)] shadow-[0_-26px_70px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="h-full overflow-y-auto px-5 pb-10 pt-4">
                <div className="mb-4 flex justify-center">
                  <div className="h-1.5 w-14 rounded-full bg-white/85" />
                </div>
                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => setActiveDetailId(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-text-secondary">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-5">
                  <div className="rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(94,147,255,0.18),_transparent_42%),rgba(255,255,255,0.72)] p-5 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-soft text-primary">
                        <LabVisual kind={activeCard.visual} />
                      </div>
                      <span className="rounded-full bg-white/74 px-3 py-1 text-[11px] font-semibold text-text-secondary">Coming soon</span>
                    </div>
                    <h2 className="mt-5 text-[28px] font-bold tracking-[-0.04em] text-text-primary">{activeCard.title}</h2>
                    <p className="mt-2 text-sm text-text-secondary">{activeCard.description}</p>
                  </div>

                  <DetailSection title="Problem" value={activeCard.problem} />
                  <DetailSection title="Future vision" value={activeCard.futureVision} />
                  <DetailSection title="How it works" value={activeCard.howItWorks} />
                  <DetailSection title="Benefit" value={activeCard.benefit} />
                  <DetailSection title="Signal preview" value={activeCard.example} />
                  {waitlistStatus ? (
                    <div className="rounded-[18px] bg-white/62 px-4 py-3 text-center text-sm font-semibold text-text-secondary">
                      {waitlistStatus}
                    </div>
                  ) : null}
                  <Button variant="primary" size="lg" className="w-full" onClick={handleJoinWaitlist}>
                    Join Waitlist
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function DetailSection({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{title}</div>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{value}</p>
      </CardContent>
    </Card>
  );
}

function LabVisual({ kind, compact }: { kind: string; compact?: boolean }) {
  const size = compact ? 'h-6 w-6' : 'h-8 w-8';

  if (kind === 'dna') {
    return (
      <div className="relative">
        <BrainCircuit className={`${size}`} />
        <div className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-primary" />
      </div>
    );
  }

  if (kind === 'voice') {
    return (
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <Mic className={size} />
      </motion.div>
    );
  }

  if (kind === 'grid') {
    return <Globe2 className={size} />;
  }

  return <Lock className={size} />;
}
