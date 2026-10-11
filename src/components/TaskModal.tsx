import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import {
  formatDateToISO,
  formatDateFullPT,
  calculateDuration,
  timeStringToMinutes,
} from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task | null;
  defaultDate?: Date;
  defaultStartTime?: string;
}

const CATEGORY_SUGGESTIONS = ['Trabalho', 'Saúde', 'Pessoal', 'Estudos', 'Marketplace', 'Foco'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  defaultStartTime,
}) => {
  const [hasSpecificTime, setHasSpecificTime] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateToISO(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDate(initialTask.date);
      setHasSpecificTime(initialTask.hasSpecificTime);
      setStartTime(initialTask.startTime || '10:00');
      setEndTime(initialTask.endTime || '11:00');
      setCategory(initialTask.category || '');
      setStatus(initialTask.status);
    } else {
      // New task
      setTitle('');
      setDescription('');
      setDate(defaultDate ? formatDateToISO(defaultDate) : formatDateToISO(new Date()));
      setHasSpecificTime(true);
      if (defaultStartTime) {
        setStartTime(defaultStartTime);
        const [h, m] = defaultStartTime.split(':').map(Number);
        setEndTime(h >= 23 ? '23:59' : `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        // Default to the next full hour so a new task isn't already overdue.
        const nextHour = Math.min(new Date().getHours() + 1, 23);
        setStartTime(`${String(nextHour).padStart(2, '0')}:00`);
        setEndTime(nextHour === 23 ? '23:59' : `${String(nextHour + 1).padStart(2, '0')}:00`);
      }
      setCategory('');
      setStatus('pending');
    }
    setErrorMessage(null);
  }, [initialTask, isOpen, defaultDate, defaultStartTime]);

  if (!isOpen) return null;

  const durationText = hasSpecificTime ? calculateDuration(startTime, endTime) : null;
  const isTimeValid = hasSpecificTime ? timeStringToMinutes(endTime) > timeStringToMinutes(startTime) : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('O título da tarefa é obrigatório.');
      return;
    }

    if (hasSpecificTime) {
      if (!startTime || !endTime) {
        setErrorMessage('Informe os horários de início e término.');
        return;
      }
      if (timeStringToMinutes(endTime) <= timeStringToMinutes(startTime)) {
        setErrorMessage('O horário de término deve ser após o horário de início.');
        return;
      }
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      hasSpecificTime,
      startTime: hasSpecificTime ? startTime : '00:00',
      endTime: hasSpecificTime ? endTime : '00:00',
      category: category.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-t-3xl sm:rounded-3xl border border-[#E5E5E5] dark:border-[#262626] shadow-xl overflow-hidden max-h-[92vh] flex flex-col text-[#0A0A0A] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E5E5E5] dark:border-[#262626]">
          <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            {initialTask ? 'Editar tarefa' : 'Nova tarefa'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Segmented Control: [Tarefa] [Sem horário] */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F7F7] dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
            <button
              type="button"
              onClick={() => setHasSpecificTime(true)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                hasSpecificTime
                  ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shadow-xs'
                  : 'text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              Com horário
            </button>
            <button
              type="button"
              onClick={() => setHasSpecificTime(false)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !hasSpecificTime
                  ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shadow-xs'
                  : 'text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              Sem horário
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Título da tarefa *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Analisar produtos"
              required
              className="w-full px-4 py-3 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all resize-none"
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Data
            </label>
            <div className="relative flex items-center">
              <CalendarIcon className="absolute left-3.5 w-4 h-4 text-[#737373] dark:text-neutral-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-[#737373] dark:text-neutral-400 mt-1">
              {formatDateFullPT(date)}
            </p>
          </div>

          {/* Horários se tiver horário */}
          {hasSpecificTime && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Horário de início
                  </label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3.5 w-4 h-4 text-[#737373] dark:text-neutral-400 pointer-events-none" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all tabular-nums font-mono cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Horário de término
                  </label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3.5 w-4 h-4 text-[#737373] dark:text-neutral-400 pointer-events-none" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all tabular-nums font-mono cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic duration indicator */}
              <div className="flex items-center justify-end">
                <span
                  className={`text-xs font-medium tabular-nums ${
                    isTimeValid ? 'text-[#737373] dark:text-neutral-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Duração: {durationText}
                </span>
              </div>
            </div>
          )}

          {/* Categoria / Tag */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Categoria / Contexto (opcional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Trabalho, Saúde, Pessoal..."
              className="w-full px-4 py-2.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm text-[#0A0A0A] dark:text-white placeholder-[#737373] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] transition-all"
            />
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white'
                      : 'bg-[#F7F7F7] dark:bg-[#141414] text-[#737373] dark:text-neutral-400 border-[#E5E5E5] dark:border-[#262626] hover:text-[#0A0A0A] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0A0A0A] dark:bg-white hover:bg-[#171717] dark:hover:bg-neutral-200 active:scale-[0.99] text-white dark:text-[#0A0A0A] font-semibold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              {initialTask ? 'Salvar alterações' : 'Salvar tarefa'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#F7F7F7] dark:bg-[#141414] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] text-[#0A0A0A] dark:text-white font-medium text-sm rounded-2xl transition-colors flex items-center justify-center cursor-pointer border border-[#E5E5E5] dark:border-[#262626]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
