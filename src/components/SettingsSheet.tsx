import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpFromLine,
  ChevronDown,
  Cloud,
  Database,
  Download,
  ExternalLink,
  HelpCircle,
  Lock,
  Mail,
  MessageCircle,
  Palette,
  Shield,
  Sparkles,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Switch } from './ui/Switch';
import { useSettingsStore } from '../store/useSettingsStore';
import { useReasonTrackStore } from '../store/useReasonTrackStore';
import { cn } from '../lib/utils';

const faqItems = [
  {
    question: 'How does AI generate signals?',
    answer: 'ReasonTrack checks structure, momentum, liquidity and session behavior before creating a trade idea. Signals only appear after multiple filters align.',
  },
  {
    question: 'What does alignment score mean?',
    answer: 'Alignment shows how many market conditions matched your setup. Higher alignment means stronger quality, not guaranteed wins.',
  },
  {
    question: 'Why was no signal generated?',
    answer: 'ReasonTrack blocks weak or conflicting setups. No trade is often better than a low-quality trade.',
  },
  {
    question: 'Can I trust AI execution?',
    answer: 'Signals are filtered through multiple execution checks before release. You stay in control before entering any trade.',
  },
  {
    question: 'How should beginners use this?',
    answer: 'Start with one pair and follow the AI explanation. Focus on understanding behavior before increasing trade volume.',
  },
];

const supportCards = [
  {
    title: 'Email Support',
    subtitle: 'Get direct help from our team',
    icon: Mail,
    gradient: 'from-[#5da8ff] to-[#2563eb]',
    action: () => {
      window.location.href = 'mailto:yashclient.flow@gmail.com?subject=ReasonTrack%20Support';
    },
  },
  {
    title: 'WhatsApp Channel',
    subtitle: 'Join our community for updates',
    icon: MessageCircle,
    gradient: 'from-[#43d17b] to-[#15a34a]',
    action: () => {
      window.open('https://whatsapp.com/channel/0029VbASdkj90x2rc9CPHM27', '_blank', 'noopener,noreferrer');
    },
  },
  {
    title: 'X Updates',
    subtitle: 'Follow product and execution updates',
    icon: ExternalLink,
    gradient: 'from-[#2b3345] to-[#0f172a]',
    action: () => {
      window.open('https://x.com/yash0to1', '_blank', 'noopener,noreferrer');
    },
  },
];

export default function SettingsSheet({
  onClose,
  onOpenSignIn,
}: {
  onClose: () => void;
  onOpenSignIn: () => void;
}) {
  const { profile, automation, display, updateProfile, updateAutomation, updateDisplay } = useSettingsStore();
  const { trades, clearAllTrades, setDefaultCapital } = useReasonTrackStore();
  const [openSection, setOpenSection] = useState<string>('account');

  const initials = useMemo(() => {
    const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'RT';
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  }, [profile.displayName]);

  const handleExport = () => {
    const data = {
      trades,
      settings: { profile, automation, display },
      exportDate: new Date().toISOString(),
      version: 'supabase-production',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reasontrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    {
      id: 'account',
      title: 'Account & Sync',
      icon: Cloud,
      content: (
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(96,151,255,0.18),_transparent_42%),rgba(255,255,255,0.68)] p-5 text-center shadow-[0_18px_40px_rgba(27,39,76,0.08)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle,#d8e8ff_0%,#9fc3ff_48%,#4a82ff_100%)] shadow-[0_0_34px_rgba(74,130,255,0.26)]">
              <Cloud className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-text-primary">Sync trades across devices</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Backup journals, AI history and settings</p>
            <Button variant="primary" size="lg" className="mt-5 w-full" onClick={onOpenSignIn}>
              Sign In / Create Account
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 'profile',
      title: 'Trader Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <Field label="Display Name">
            <Input value={profile.displayName} onChange={(event) => updateProfile({ displayName: event.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trading Style">
              <Select value={profile.tradingStyle} onChange={(event) => updateProfile({ tradingStyle: event.target.value as typeof profile.tradingStyle })}>
                <option value="Scalper">Scalper</option>
                <option value="Day Trader">Day Trader</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Position Trader">Position Trader</option>
              </Select>
            </Field>
            <Field label="Experience">
              <Select value={profile.experience} onChange={(event) => updateProfile({ experience: event.target.value as typeof profile.experience })}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </Field>
            <Field label="Account Size">
              <Input
                type="number"
                value={profile.accountSize}
                onChange={(event) => {
                  const value = Number(event.target.value) || 0;
                  updateProfile({ accountSize: value });
                  setDefaultCapital(value);
                }}
              />
            </Field>
          </div>
          <Field label="Risk Tolerance">
            <div className="grid grid-cols-3 gap-2">
              {(['Conservative', 'Moderate', 'Aggressive'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => updateProfile({ riskTolerance: level })}
                  className={cn(
                    'rounded-[20px] border px-3 py-3 text-xs font-semibold transition-all duration-300',
                    profile.riskTolerance === level
                      ? 'border-transparent bg-[linear-gradient(180deg,#5da8ff_0%,#2563eb_100%)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.26)]'
                      : 'border-white/80 bg-white/56 text-text-secondary',
                  )}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </Field>
        </div>
      ),
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="space-y-4">
          <Field label="Theme">
            <div className="rounded-[22px] border border-white/80 bg-white/60 px-4 py-4 text-sm font-medium text-text-primary">
              Soft Premium Light
            </div>
          </Field>
          <Field label="Chart Density">
            <Select value={display.chartDensity} onChange={(event) => updateDisplay({ chartDensity: event.target.value as typeof display.chartDensity })}>
              <option value="Compact">Compact</option>
              <option value="Normal">Normal</option>
              <option value="Detailed">Detailed</option>
            </Select>
          </Field>
          <div className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/56 px-4 py-4">
            <div>
              <div className="text-sm font-semibold text-text-primary">Interface Motion</div>
              <div className="mt-1 text-xs text-text-muted">Enable premium transitions across the cockpit</div>
            </div>
            <Switch checked={display.animations} onCheckedChange={(checked) => updateDisplay({ animations: checked })} />
          </div>
        </div>
      ),
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <SettingRow
            title="Auto R:R"
            subtitle="Calculate Reward/Risk automatically"
            control={<Switch checked={automation.autoRR} onCheckedChange={(checked) => updateAutomation({ autoRR: checked })} />}
          />
          <SettingRow
            title="Emotional Tracking"
            subtitle="Prompt for emotion score after trades"
            control={<Switch checked={automation.emotionalTracking} onCheckedChange={(checked) => updateAutomation({ emotionalTracking: checked })} />}
          />
          <Field label="Target Ratio">
            <div className="grid grid-cols-4 gap-2">
              {[1.5, 2, 2.5, 3].map((ratio) => (
                <motion.button
                  key={ratio}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => updateAutomation({ autoRRRatio: ratio })}
                  className={cn(
                    'rounded-[18px] border px-3 py-3 text-sm font-semibold transition-all duration-300',
                    automation.autoRRRatio === ratio
                      ? 'border-transparent bg-[linear-gradient(180deg,#5da8ff_0%,#2563eb_100%)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]'
                      : 'border-white/80 bg-white/56 text-text-secondary',
                  )}
                >
                  1:{ratio}
                </motion.button>
              ))}
            </div>
          </Field>
        </div>
      ),
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      content: (
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(96,151,255,0.16),_transparent_42%),rgba(255,255,255,0.66)] p-5 shadow-[0_18px_40px_rgba(27,39,76,0.08)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[radial-gradient(circle,#dae8ff_0%,#a5c5ff_50%,#4f86ff_100%)] shadow-[0_0_26px_rgba(79,134,255,0.24)]">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-[-0.02em] text-text-primary">Data vault</div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Backup your execution history</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="justify-start" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="lg" className="justify-start" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
          </div>
          <Button
            variant="destructive"
            size="lg"
            className="w-full justify-start"
            onClick={() => {
              if (window.confirm('Delete all Supabase trades for this account?')) {
                clearAllTrades();
              }
            }}
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4 rotate-180" />
            Factory Reset
          </Button>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/80 bg-[rgba(255,255,255,0.6)] p-5 opacity-70">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[radial-gradient(circle,#edf4ff_0%,#d6e4ff_52%,#b5ccff_100%)]">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <SettingRow
              title="App lock"
              subtitle="Require Biometrics/PIN"
              control={<Switch checked={false} onCheckedChange={() => {}} disabled />}
            />
            <div className="mt-4 flex items-center justify-between rounded-[22px] border border-white/80 bg-white/54 px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">Biometrics</div>
                <div className="mt-1 text-xs text-text-muted">Premium disabled state</div>
              </div>
              <span className="rounded-full bg-[linear-gradient(180deg,#0f172a_0%,#2b3345_100%)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Pro
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: HelpCircle,
      content: (
        <div className="space-y-3">
          {supportCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                type="button"
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={card.action}
                className={`flex w-full items-center gap-4 rounded-[28px] bg-gradient-to-r ${card.gradient} p-4 text-left text-white shadow-[0_18px_36px_rgba(27,39,76,0.12)]`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/18 backdrop-blur-md">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{card.title}</div>
                  <div className="mt-1 text-xs text-white/78">{card.subtitle}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-white/80" />
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <FAQRow key={item.question} question={item.question} answer={item.answer} delay={index * 0.04} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ y: 36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute inset-0 z-50 overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,#f8faff_0%,#f4f6fc_52%,#eef2ff_100%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(111,159,255,0.22),_transparent_34%)]" />
      <div className="relative flex h-full flex-col">
        <div className="glass-tint sticky top-0 z-20 border-b border-white/65 px-6 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-[20px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="text-[18px] font-bold tracking-[-0.02em] text-text-primary">ReasonTrack</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onOpenSignIn} className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-primary shadow-[0_8px_18px_rgba(27,39,76,0.06)]">
                Sign In
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-text-secondary shadow-[0_8px_18px_rgba(27,39,76,0.06)]">
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 overflow-y-auto px-6 pb-[calc(44px+env(safe-area-inset-bottom))] pt-6">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[32px] font-bold tracking-[-0.04em] text-text-primary">Settings</h1>
              <p className="mt-2 text-sm text-text-secondary">Configure your trading environment</p>
            </div>
            <div className="rounded-full bg-[conic-gradient(from_180deg,#9bc1ff_0deg,#4f86ff_120deg,#84b0ff_240deg,#9bc1ff_360deg)] p-[2px] shadow-[0_0_26px_rgba(79,134,255,0.2)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-primary">
                {initials}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <SectionAccordion
                key={section.id}
                title={section.title}
                icon={section.icon}
                open={openSection === section.id}
                onToggle={() => setOpenSection(openSection === section.id ? '' : section.id)}
                delay={index * 0.04}
              >
                {section.content}
              </SectionAccordion>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SectionAccordion({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
  delay,
}: {
  title: string;
  icon: typeof User;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
      <Card className="overflow-hidden">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-5 py-5 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[18px] bg-[radial-gradient(circle,#dceaff_0%,#a8c7ff_52%,#5d93ff_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_0_22px_rgba(93,147,255,0.24)]">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold text-text-primary">{title}</span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.35 }}>
            <ChevronDown className="h-5 w-5 text-text-muted" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <CardContent className="border-t border-white/60 pt-5">{children}</CardContent>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      {children}
    </div>
  );
}

function SettingRow({ title, subtitle, control }: { title: string; subtitle: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[24px] border border-white/80 bg-white/56 px-4 py-4">
      <div>
        <div className="text-sm font-semibold text-text-primary">{title}</div>
        <div className="mt-1 text-xs text-text-muted">{subtitle}</div>
      </div>
      {control}
    </div>
  );
}

function FAQRow({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} className="rounded-[24px] border border-white/80 bg-white/56 px-4 py-1">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="pr-4 text-sm font-semibold text-text-primary">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.35 }}>
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="pb-4 text-sm leading-6 text-text-secondary">
              {answer}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
