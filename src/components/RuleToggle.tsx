'use client';

import { useTransition } from 'react';
import { toggleRuleAction } from '@/app/actions';

interface RuleToggleProps {
  ruleId: string;
  isActive: boolean;
}

export function RuleToggle({ ruleId, isActive }: RuleToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleRuleAction(ruleId, !isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isActive ? 'bg-blue-600' : 'bg-slate-300'
      } ${isPending ? 'opacity-50' : ''}`}
      role="switch"
      aria-checked={isActive}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isActive ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
