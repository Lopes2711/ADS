'use client';

import { useTransition } from 'react';
import { toggleRuleAction } from '@/app/actions';

interface RuleToggleProps {
  ruleId: number;
  is_active: boolean;
}

export function RuleToggle({ ruleId, is_active }: RuleToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleRuleAction(ruleId, !is_active);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        is_active ? 'bg-blue-600' : 'bg-slate-300'
      } ${isPending ? 'opacity-50' : ''}`}
      role="switch"
      aria-checked={is_active}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          is_active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
