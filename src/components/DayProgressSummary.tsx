import React from 'react';
import { Task } from '../types';

interface DayProgressSummaryProps {
  tasks: Task[];
}

export const DayProgressSummary: React.FC<DayProgressSummaryProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) {
    return null; // Keep it clean if no tasks exist
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#222222] px-4 py-2.5 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {completed} de {total} tarefas concluídas
          </span>
          <span className="font-bold text-[#0A0A0A] dark:text-white tabular-nums font-mono">
            {percentage}%
          </span>
        </div>

        {/* Minimal monochrome linear progress bar */}
        <div className="w-full h-1 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0A0A0A] dark:bg-white transition-all duration-300 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
