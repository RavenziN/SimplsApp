import React, { useState, useEffect } from 'react';
import { User, Task, UserPreferences, ActiveTab } from './types';
import {
  getActiveUser,
  setActiveUser,
  getUserTasks,
  saveUserTasks,
  getUserPreferences,
  saveUserPreferences,
  saveUserProfile,
} from './services/storage';
import { AuthScreen } from './components/AuthScreen';
import { TimelineHeader } from './components/TimelineHeader';
import { DateStrip } from './components/DateStrip';
import { DayProgressSummary } from './components/DayProgressSummary';
import { VerticalTimeline } from './components/VerticalTimeline';
import { MonthCalendarView } from './components/MonthCalendarView';
import { SettingsScreen } from './components/SettingsScreen';
import { FocusScreen } from './components/FocusScreen';
import { BoxBreatheScreen } from './components/BoxBreatheScreen';
import { ClockScreen } from './components/ClockScreen';
import { BottomNav } from './components/BottomNav';
import { TaskModal } from './components/TaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { SearchModal } from './components/SearchModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { formatDateToISO } from './utils/dateUtils';
import { Smartphone, Monitor } from 'lucide-react';
import { OnboardingScreen, hasCompletedOnboarding } from './components/Onboarding/OnboardingScreen';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<ActiveTab>('agenda');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasCompletedOnboarding());
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    startHour: 6,
    endHour: 23,
    autoScrollToCurrentTime: true,
  });

  // Device frame toggle on desktop (for reviewing the mobile mockups or using full width)
  const [desktopViewMode, setDesktopViewMode] = useState<'responsive' | 'phoneFrame'>('responsive');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultSlotTime, setDefaultSlotTime] = useState<string | undefined>(undefined);

  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Initialize active user removed so no account is pre-set on entry
  useEffect(() => {
    // Start fresh without pre-set account
  }, []);

  // Update theme class on HTML element & color scheme
  useEffect(() => {
    const root = document.documentElement;
    const isDark = preferences.theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [preferences.theme]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    const userTasks = getUserTasks(user.id);
    setTasks(userTasks);
    setPreferences(getUserPreferences(user.id));
  };

  const handleLogout = async () => {
    setActiveUser(null);
    setCurrentUser(null);
    setTasks([]);
    try {
      await signOut(auth);
    } catch (err) {
      // ignore
    }
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    if (!currentUser) return;
    const updated = saveUserPreferences(currentUser.id, newPrefs);
    setPreferences(updated);
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUserProfile(updatedUser);
    setCurrentUser(updatedUser);
  };

  const refreshTasks = () => {
    if (!currentUser) return;
    setTasks(getUserTasks(currentUser.id));
  };

  // Task Mutations
  const handleToggleComplete = (task: Task) => {
    if (!currentUser) return;
    const newStatus: Task['status'] = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTasks: Task[] = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    saveUserTasks(currentUser.id, updatedTasks);

    if (detailsTask && detailsTask.id === task.id) {
      setDetailsTask({ ...detailsTask, status: newStatus });
    }
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser) return;

    if (editingTask) {
      // Update existing
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id
          ? { ...t, ...taskData, updatedAt: new Date().toISOString() }
          : t
      );
      setTasks(updatedTasks);
      saveUserTasks(currentUser.id, updatedTasks);
      setEditingTask(null);
    } else {
      // Create new
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveUserTasks(currentUser.id, updatedTasks);
    }
  };

  const handleDuplicateTask = (task: Task) => {
    if (!currentUser) return;
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Cópia)`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTasks = [duplicated, ...tasks];
    setTasks(updatedTasks);
    saveUserTasks(currentUser.id, updatedTasks);
  };

  const handleDeleteTaskConfirm = () => {
    if (!currentUser || !taskToDelete) return;
    const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
    setTasks(updatedTasks);
    saveUserTasks(currentUser.id, updatedTasks);
    setTaskToDelete(null);
    if (detailsTask && detailsTask.id === taskToDelete.id) {
      setDetailsTask(null);
    }
  };

  const handleEmptySlotClick = (timeStr: string) => {
    setEditingTask(null);
    setDefaultSlotTime(timeStr);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setDefaultSlotTime(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={(mode) => {
          setAuthInitialMode(mode);
          setShowOnboarding(false);
        }}
        onClose={() => setShowOnboarding(false)}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />
    );
  }

  // Filter tasks for selected day to show in progress bar
  const selectedDateISO = formatDateToISO(selectedDate);
  const dayTasks = tasks.filter((t) => t.date === selectedDateISO);

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${
        preferences.theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-[#F7F7F7] text-[#0A0A0A]'
      } flex flex-col`}
    >
      {/* Top Device Bar for Desktop: Switch between Responsive view and exact Phone Frame */}
      <div className="shrink-0 hidden lg:flex items-center justify-between px-6 py-2 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#141414] text-xs text-[#737373] dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A0A0A] dark:text-white">Simpls Agenda</span>
          <span>·</span>
          <span>Usuário: {currentUser.name} ({currentUser.email})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Visualização:</span>
          <button
            type="button"
            onClick={() => setDesktopViewMode('responsive')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              desktopViewMode === 'responsive'
                ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]'
                : 'hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Tela Ampla
          </button>
          <button
            type="button"
            onClick={() => setDesktopViewMode('phoneFrame')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              desktopViewMode === 'phoneFrame'
                ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]'
                : 'hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Moldura Mobile
          </button>
        </div>
      </div>

      {/* Main Container Wrapper / Centering area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
        {/* Main App Container */}
        <div
          className={`flex flex-col w-full transition-all ${
            desktopViewMode === 'phoneFrame'
              ? 'max-w-[430px] h-full lg:h-[880px] bg-white dark:bg-[#0A0A0A] lg:border border-[#E5E5E5] dark:border-[#262626] lg:rounded-[44px] shadow-2xl overflow-hidden relative'
              : 'max-w-2xl h-full lg:h-[90vh] lg:max-h-[920px] bg-white dark:bg-[#0A0A0A] border-x lg:border border-[#E5E5E5] dark:border-[#262626] lg:rounded-3xl overflow-hidden relative shadow-xl'
          }`}
        >
          {/* Header */}
          <div className="shrink-0">
            <TimelineHeader
              onOpenNewTask={handleOpenNewTask}
              onOpenClock={() => setActiveTab('relogio')}
              onOpenCalendar={() => setActiveTab('calendario')}
              onGoHome={() => setActiveTab('agenda')}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            {/* Tab 1: Agenda (Timeline) */}
            {activeTab === 'agenda' && (
              <div className="flex flex-col">
                <DateStrip
                  selectedDate={selectedDate}
                  onSelectDate={(d) => setSelectedDate(d)}
                  onOpenMonthView={() => setActiveTab('calendario')}
                  tasks={tasks}
                />

                <DayProgressSummary tasks={dayTasks} />

                <VerticalTimeline
                  selectedDate={selectedDate}
                  tasks={tasks}
                  startHour={preferences.startHour}
                  endHour={preferences.endHour}
                  onToggleComplete={handleToggleComplete}
                  onOpenTaskDetails={(t) => setDetailsTask(t)}
                  onEditTask={handleEditTask}
                  onDuplicateTask={handleDuplicateTask}
                  onDeleteTask={(t) => setTaskToDelete(t)}
                  onEmptySlotClick={handleEmptySlotClick}
                  onOpenNewTask={handleOpenNewTask}
                />
              </div>
            )}

            {/* Tab 2: Modo Foco */}
            {activeTab === 'foco' && <FocusScreen />}

            {/* Tab 3: Respirar */}
            {activeTab === 'respirar' && <BoxBreatheScreen />}

            {/* Independent Module: Relógio de Mesa */}
            {activeTab === 'relogio' && <ClockScreen />}

            {/* Independent Module: Calendário Mensal */}
            {activeTab === 'calendario' && (
              <MonthCalendarView
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setActiveTab('agenda');
                }}
                tasks={tasks}
                onOpenNewTask={handleOpenNewTask}
                onOpenTaskDetails={(t) => setDetailsTask(t)}
                onToggleComplete={handleToggleComplete}
              />
            )}

            {/* Tab 4: Conta / Ajustes */}
            {activeTab === 'ajustes' && (
              <SettingsScreen
                user={currentUser}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                onTasksChanged={refreshTasks}
                onReplayOnboarding={() => setShowOnboarding(true)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}
          </div>

          {/* Bottom Tab Navigation */}
          <div className="shrink-0">
            <BottomNav activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} user={currentUser} />
          </div>
        </div>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setDefaultSlotTime(undefined);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={selectedDate}
        defaultStartTime={defaultSlotTime}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={Boolean(detailsTask)}
        task={detailsTask}
        onClose={() => setDetailsTask(null)}
        onToggleComplete={handleToggleComplete}
        onEdit={(task) => {
          setDetailsTask(null);
          handleEditTask(task);
        }}
        onDuplicate={handleDuplicateTask}
        onDelete={(task) => {
          setDetailsTask(null);
          setTaskToDelete(task);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        onSelectTask={(task) => {
          setSelectedDate(new Date(task.date + 'T12:00:00'));
          setDetailsTask(task);
        }}
        onToggleComplete={handleToggleComplete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTaskConfirm}
      />
    </div>
  );
}
