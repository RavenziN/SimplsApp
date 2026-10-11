import React from 'react';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Task } from '../types';
import { formatDateFullPT, calculateDuration } from '../utils/dateUtils';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggleComplete,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const duration = task.hasSpecificTime
    ? calculateDuration(task.startTime, task.endTime)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-t-3xl sm:rounded-3xl border border-[#E5E5E5] dark:border-[#262626] shadow-xl overflow-hidden max-h-[92vh] flex flex-col text-[#0A0A0A] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E5E5E5] dark:border-[#262626]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
            Detalhes da tarefa
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Status */}
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              className={`w-7 h-7 mt-1 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                task.status === 'completed'
                  ? 'bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white text-white dark:text-[#0A0A0A] shadow-xs'
                  : 'border-[#737373] dark:border-neutral-500 hover:border-[#0A0A0A] dark:hover:border-white bg-white dark:bg-[#141414]'
              }`}
            >
              {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <div>
              <h2
                className={`text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white ${
                  task.status === 'completed' ? 'line-through text-[#737373] dark:text-neutral-500' : ''
                }`}
              >
                {task.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-neutral-400 mt-1">
                {task.category && <span>{task.category}</span>}
                {task.category && <span>·</span>}
                <span>{formatDateFullPT(task.date)}</span>
              </div>
            </div>
          </div>

          {/* Time & Duration card */}
          {task.hasSpecificTime ? (
            <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex items-center gap-5 text-xs text-[#0A0A0A] dark:text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
                <span className="font-semibold tabular-nums font-mono">
                  {task.startTime} – {task.endTime}
                </span>
              </div>
              {duration && (
                <div className="flex items-center gap-2 text-[#737373] dark:text-neutral-400">
                  <span>·</span>
                  <span>{duration}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl text-xs text-[#737373] dark:text-neutral-400">
              Tarefa sem horário específico definido.
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="p-4 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl">
              <h4 className="text-xs font-semibold text-[#737373] dark:text-neutral-400 mb-1">
                Descrição
              </h4>
              <p className="text-sm text-[#0A0A0A] dark:text-white whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Actions List */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              className="w-full py-3 px-4 bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-xl flex items-center gap-3 text-xs font-semibold text-[#0A0A0A] dark:text-white transition-colors cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
            >
              {task.status === 'completed' ? (
                <>
                  <RotateCcw className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  Reabrir tarefa
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  Marcar como concluída
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="w-full py-3 px-4 bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-xl flex items-center gap-3 text-xs font-semibold text-[#0A0A0A] dark:text-white transition-colors cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
            >
              <Edit3 className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
              Editar tarefa
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDuplicate(task);
              }}
              className="w-full py-3 px-4 bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-xl flex items-center gap-3 text-xs font-semibold text-[#0A0A0A] dark:text-white transition-colors cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
            >
              <Copy className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
              Duplicar tarefa
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(task);
              }}
              className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl flex items-center gap-3 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors cursor-pointer border border-red-200 dark:border-red-900"
            >
              <Trash2 className="w-4 h-4" />
              Excluir tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
