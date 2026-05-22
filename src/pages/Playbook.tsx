import React, { useState } from 'react';
import { usePlaybookStore } from '../store/usePlaybookStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

const Playbook = () => {
  const { setups, addSetup, deleteSetup } = usePlaybookStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newSetupName, setNewSetupName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetupName.trim()) return;
    
    addSetup({
      name: newSetupName,
      description: '',
      trigger_condition: '',
      entry_logic: '',
      confirmation: '',
      target_logic: '',
      risk_rule: '',
      tags: [],
    });
    setNewSetupName('');
    setIsAdding(false);
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Playbook</h1>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-1" /> New Setup
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="flex gap-2">
              <Input 
                value={newSetupName}
                onChange={(e) => setNewSetupName(e.target.value)}
                placeholder="Setup Name (e.g., Golden Cross)"
                autoFocus
              />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {setups.map((setup) => (
          <Card key={setup.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{setup.name}</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={() => deleteSetup(setup.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Used: {setup.times_used} times</span>
                <span>Win Rate: {setup.success_rate.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {setups.length === 0 && !isAdding && (
          <div className="text-center py-10 text-slate-500">
            No setups defined. Create your first strategy!
          </div>
        )}
      </div>
    </div>
  );
};

export default Playbook;
