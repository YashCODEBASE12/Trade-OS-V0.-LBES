import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTradesStore } from '../store/useTradesStore';
import { useAuthStore } from '../store/useAuthStore';
import { SettingsSection } from '../components/SettingsSection';
import { HelpSupportSection } from '../components/HelpSupportSection';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { Select } from '../components/ui/Select';
import { syncService } from '../services/sync.service';
import { setUserId } from '../lib/storage';
import { 
  User, Palette, Zap, Database, Shield, 
  LogOut, Download, Upload, Trash2, Globe, Cloud, CheckCircle
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, automation, display, updateProfile, updateAutomation, updateDisplay } = useSettingsStore();
  const { trades, importTrades, clearAllTrades } = useTradesStore();
  const { user, signOut } = useAuthStore();

  const handleExport = () => {
    const data = {
      trades,
      settings: { profile, automation, display },
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `reasontrack_backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string);
            if (parsed.trades && Array.isArray(parsed.trades)) {
              importTrades(parsed.trades);
              if (parsed.settings) {
                if (parsed.settings.profile) updateProfile(parsed.settings.profile);
                if (parsed.settings.automation) updateAutomation(parsed.settings.automation);
                if (parsed.settings.display) updateDisplay(parsed.settings.display);
              }
              alert('Data imported successfully!');
            }
          } catch (err) {
            alert('Invalid file format');
          }
        }
      };
    }
  };

  const handleSyncNow = async () => {
    if (!user) return;
    const result = await syncService.migrateLocalData(user.id);
    if (result?.success) {
      alert('Sync completed successfully!');
    } else {
      alert('Sync failed. Check console for details.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Force user isolation switch
    setUserId('guest');
    window.location.href = '/auth';
  };

  return (
    <div className="pb-24 space-y-6 px-4 pt-6 bg-background min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary">Configure your trading environment</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg border border-accent/20">
          {profile.displayName.charAt(0)}
        </div>
      </div>

      <div className="space-y-4">
        {/* ACCOUNT / CLOUD SYNC */}
        <SettingsSection title="Account & Sync" icon={<Cloud className="w-5 h-5" />} defaultOpen>
          <div className="space-y-4">
            {user ? (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-accent/20 rounded-full">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Signed In</p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-trading-profit ml-auto" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleSyncNow} variant="outline" className="w-full text-xs">
                    <Cloud className="w-3 h-3 mr-2" /> Sync Now
                  </Button>
                  <Button onClick={handleSignOut} variant="destructive" className="w-full text-xs bg-loss hover:bg-loss/90 text-white border-none">
                    <LogOut className="w-3 h-3 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-lg p-4 text-center space-y-3">
                <p className="text-sm text-text-secondary">Sign in to sync your data across devices and backup to the cloud.</p>
                <Button onClick={() => navigate('/auth')} className="w-full bg-primary text-primary-foreground">
                  Sign In / Create Account
                </Button>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* PROFILE SECTION */}
        <SettingsSection title="Trader Profile" icon={<User className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Display Name</label>
              <Input 
                value={profile.displayName} 
                onChange={(e) => updateProfile({ displayName: e.target.value })}
                className="bg-background border-border text-text-primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Trading Style</label>
                <Select 
                  value={profile.tradingStyle}
                  onChange={(e) => updateProfile({ tradingStyle: e.target.value as any })}
                >
                  <option value="Scalper">Scalper</option>
                  <option value="Day Trader">Day Trader</option>
                  <option value="Swing Trader">Swing Trader</option>
                  <option value="Position Trader">Position Trader</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Account Size</label>
                <Input 
                  type="number"
                  value={profile.accountSize}
                  onChange={(e) => updateProfile({ accountSize: Number(e.target.value) })}
                  className="bg-background border-border text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Risk Tolerance</label>
              <div className="flex gap-2">
                {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateProfile({ riskTolerance: level as any })}
                    className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                      profile.riskTolerance === level 
                        ? 'bg-accent text-accent-foreground border-accent' 
                        : 'bg-background text-text-secondary border-border hover:bg-surface'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* AUTOMATION SECTION */}
        <SettingsSection title="Automation" icon={<Zap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-text-primary">Auto R/R Calc</div>
                <div className="text-xs text-text-muted">Calculate Reward/Risk automatically</div>
              </div>
              <Switch 
                checked={automation.autoRR}
                onCheckedChange={(c) => updateAutomation({ autoRR: c })}
              />
            </div>

            {automation.autoRR && (
              <div className="space-y-2 pl-4 border-l-2 border-border">
                <label className="text-xs font-medium text-text-secondary">Target R Ratio</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-primary">1 :</span>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={automation.autoRRRatio}
                    onChange={(e) => updateAutomation({ autoRRRatio: Number(e.target.value) })}
                    className="w-20 bg-background border-border"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-text-primary">Emotional Tracking</div>
                <div className="text-xs text-text-muted">Prompt for emotion score after trades</div>
              </div>
              <Switch 
                checked={automation.emotionalTracking}
                onCheckedChange={(c) => updateAutomation({ emotionalTracking: c })}
              />
            </div>
          </div>
        </SettingsSection>

        {/* DATA MANAGEMENT */}
        <SettingsSection title="Data Management" icon={<Database className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="p-3 bg-surface border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-bold text-text-primary">Local Data</span>
              </div>
              <p className="text-xs text-text-secondary">
                Export your local data manually as a JSON backup.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleExport} className="w-full justify-start border-border hover:bg-surface text-text-primary">
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
              
              <div className="relative">
                <Button variant="outline" className="w-full justify-start border-border hover:bg-surface text-text-primary">
                  <Upload className="mr-2 h-4 w-4" /> Import JSON
                </Button>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={() => {
                if(confirm('Are you sure? This will delete ALL trades and cannot be undone.')) {
                  clearAllTrades();
                }
              }} 
              className="w-full justify-start mt-2 bg-loss hover:bg-loss/90 text-white border-none"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Factory Reset
            </Button>
          </div>
        </SettingsSection>

        {/* SECURITY */}
        <SettingsSection title="Security" icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-4">
             <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-text-primary">App Lock</div>
                <div className="text-xs text-text-muted">Require Biometrics/PIN (Pro)</div>
              </div>
              <Switch checked={false} onCheckedChange={() => {}} disabled />
            </div>
          </div>
        </SettingsSection>

        {/* HELP & SUPPORT - NEW */}
        <HelpSupportSection />
      </div>
    </div>
  );
};

export default Settings;
