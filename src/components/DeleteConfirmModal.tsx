import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-3xl border border-[#E5E5E5] dark:border-[#262626] p-6 shadow-2xl text-[#0A0A0A] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
          Excluir tarefa?
        </h3>
        <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1.5 leading-relaxed">
          Tem certeza de que deseja excluir a tarefa "{task.title}"? Esta ação não pode ser desfeita.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            Sim, excluir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
