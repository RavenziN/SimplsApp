import React, { useState } from 'react';
import { Search, X, Check, Clock } from 'lucide-react';
import { Task } from '../types';
import { formatDateFullPT } from '../utils/dateUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onToggleComplete,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredTasks = query.trim()
    ? tasks.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-3xl border border-[#E5E5E5] dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-[#0A0A0A] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#737373] dark:text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, categoria ou descrição..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#0A0A0A] dark:text-white placeholder-[#737373] dark:placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto">
          {query.trim() === '' ? (
            <p className="text-center text-xs text-[#737373] dark:text-neutral-400 py-8">
              Digite uma palavra-chave para buscar entre suas tarefas.
            </p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-center text-xs text-[#737373] dark:text-neutral-400 py-8">
              Nenhuma tarefa encontrada para "{query}".
            </p>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider block mb-2">
                Resultados ({filteredTasks.length})
              </span>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onClose();
                    onSelectTask(task);
                  }}
                  className={`p-3 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#0A0A0A] dark:hover:border-white transition-all ${
                    task.status === 'completed' ? 'opacity-60 bg-neutral-50 dark:bg-neutral-900/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task);
                      }}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white text-white dark:text-[#0A0A0A]'
                          : 'border-[#737373] dark:border-neutral-500 hover:border-[#0A0A0A] dark:hover:border-white'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-bold text-[#0A0A0A] dark:text-white truncate ${
                          task.status === 'completed' ? 'line-through text-[#737373] dark:text-neutral-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                        {task.category && `${task.category} · `}
                        {task.hasSpecificTime
                          ? `${task.startTime} – ${task.endTime}`
                          : 'Sem horário'}{' '}
                        · {formatDateFullPT(task.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
