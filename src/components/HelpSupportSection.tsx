import React, { useState } from 'react';
import { Mail, MessageCircle, Twitter, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  hoverBorder: string;
}

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get direct help from our team',
    icon: <Mail className="w-5 h-5 text-white" />,
    action: () => {
      window.location.href = 'mailto:yashclient.flow@gmail.com?subject=ReasonTrack%20Support&body=Hi%20ReasonTrack%20Team,%0A%0AI%20need%20help%20with:%0A%0A•%20App%20Version:%201.0.0%0A•%20Issue%20Description:%0A%0AThank you!';
    },
    color: 'bg-blue-500',
    hoverBorder: 'hover:border-blue-500'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Channel',
    description: 'Join our community for updates',
    icon: <MessageCircle className="w-5 h-5 text-white" />,
    action: () => {
      window.open('https://whatsapp.com/channel/0029VbASdkj90x2rc9CPHM27', '_blank', 'noopener,noreferrer');
    },
    color: 'bg-green-500',
    hoverBorder: 'hover:border-green-500'
  },
  {
    id: 'twitter',
    title: 'X (Twitter) Updates',
    description: 'Follow for tips and announcements',
    icon: <Twitter className="w-5 h-5 text-white" />,
    action: () => {
      window.open('https://x.com/AUxMindset', '_blank', 'noopener,noreferrer');
    },
    color: 'bg-black',
    hoverBorder: 'hover:border-slate-900'
  }
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 text-left focus:outline-none"
      >
        <span className="text-sm font-medium text-text-primary">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-40 opacity-100 pb-3" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-xs text-text-secondary leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const HelpSupportSection = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-surface border-border">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          Help & Support
        </h2>
        
        <div className="space-y-6">
          {/* Contact Options */}
          <div className="grid grid-cols-1 gap-3">
            {CONTACT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border border-border bg-background transition-all duration-200 hover:shadow-md text-left group",
                  option.hoverBorder
                )}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0", option.color)}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary text-sm flex items-center gap-1">
                    {option.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="bg-background/50 rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-text-primary mb-2 text-sm">Frequently Asked Questions</h3>
            <div className="space-y-1">
              <FAQItem 
                question="How do I start tracking trades?"
                answer="Go to the Add Trade tab (Plus icon), fill in your trade details like Pair, Entry, and Stop Loss, then tap 'Log Trade'. Your data saves automatically."
              />
              <FAQItem 
                question="Is my data secure?"
                answer="Yes! Your data is stored locally on your device by default. When you sign in, it syncs to a secure, encrypted database that only you can access."
              />
              <FAQItem 
                question="Can I export my trading data?"
                answer="Absolutely. Go to Data Management in Settings to export a JSON backup of all your trades and settings."
              />
              <FAQItem 
                question="How does the R-Multiple calculation work?"
                answer="R-Multiple is calculated as (Reward / Risk). For a Buy trade: (Take Profit - Entry) / (Entry - Stop Loss). We handle this math for you automatically."
              />
            </div>
          </div>
          
          {/* App Info */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-text-primary text-sm">ReasonTrack</h4>
                <p className="text-xs text-text-secondary">v1.0.0 • Build 2024.05.15</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-text-primary">
                  Made for traders
                </p>
                <p className="text-[10px] text-text-muted">
                  Your success is our priority
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
