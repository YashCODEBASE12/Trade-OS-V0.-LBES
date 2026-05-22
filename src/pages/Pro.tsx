import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { proTiers } from '../data/reasontrack';

export default function Pro() {
  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(94,147,255,0.2),_transparent_40%),rgba(255,255,255,0.62)] p-5 shadow-[0_18px_40px_rgba(27,39,76,0.08)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Execution Intelligence Tiers</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">LBES PRO</h1>
      </div>

      <div className="space-y-4">
        {proTiers.map((tier, index) => (
          <motion.div key={tier.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }}>
            <Card className={tier.name === 'PRO' ? 'bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ff_100%)]' : ''}>
              <CardContent className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">{tier.name}</div>
                    <div className="mt-2 text-[32px] font-bold tracking-[-0.04em]">{tier.price}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  {tier.features.map((feature) => (
                    <div key={feature}>{feature}</div>
                  ))}
                </div>
                <Button variant={tier.name === 'FREE' ? 'outline' : 'primary'} className="w-full">
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
