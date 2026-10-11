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
  syncUserTasksWithRemote,
} from './services/storage';
import { AuthScreen } from './components/AuthScreen';
import { TimelineHeader } from './components/TimelineHeader';
import { DateStrip } from './components/DateStrip';
import { DayProgressSummary } from './components/DayProgressSummary';
import { VerticalTimeline } from './components/VerticalTimeline';
import { MonthCalendarView } from './components/MonthCalendarView';
import { SettingsScreen } from './components/SettingsScreen';
import { FocusScreen, FocusColorTheme } from './components/FocusScreen';
import { Plus } from 'lucide-react';
import { BoxBreatheScreen } from './components/BoxBreatheScreen';
import { ClockScreen } from './components/ClockScreen';
import { BottomNav } from './components/BottomNav';
import { TaskModal } from './components/TaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { SearchModal } from './components/SearchModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { formatDateToISO } from './utils/dateUtils';
import { OnboardingScreen, hasCompletedOnboarding } from './components/Onboarding/OnboardingScreen';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { usePushNotifications } from './hooks/usePushNotifications';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  usePushNotifications(currentUser?.id ?? null);
  const [focusTheme, setFocusTheme] = useState<FocusColorTheme>('black');
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

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultSlotTime, setDefaultSlotTime] = useState<string | undefined>(undefined);

  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Restore the Firebase session on load so a refresh or reopening the app keeps the user signed in.
  // Only the first auth state is handled here; later sign-ins go through AuthScreen.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        const stored = getActiveUser();
        const user: User =
          stored?.id === firebaseUser.uid
            ? stored
            : {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
                email: firebaseUser.email || '',
                ...(firebaseUser.photoURL ? { photoUrl: firebaseUser.photoURL } : {}),
              };
        setActiveUser(user);
        handleLoginSuccess(user);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Esc closes the topmost open modal (useful on desktop).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (taskToDelete) setTaskToDelete(null);
      else if (isTaskModalOpen) {
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setDefaultSlotTime(undefined);
      } else if (detailsTask) setDetailsTask(null);
      else if (isSearchOpen) setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [taskToDelete, isTaskModalOpen, detailsTask, isSearchOpen]);

  // Resolve the theme ("system" follows the phone's setting) and apply it to the HTML element.
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const isDark = preferences.theme === 'dark' || (preferences.theme === 'system' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Coming back to the app (e.g. switching from the phone to the computer) pulls the latest tasks.
  const currentUserId = currentUser?.id;
  useEffect(() => {
    if (!currentUserId) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      syncUserTasksWithRemote(currentUserId).then((merged) => {
        if (auth.currentUser?.uid === currentUserId) setTasks(merged);
      });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [currentUserId]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    const userTasks = getUserTasks(user.id);
    setTasks(userTasks);
    setPreferences(getUserPreferences(user.id));

    // Pull tasks saved from other devices.
    syncUserTasksWithRemote(user.id).then((merged) => {
      if (auth.currentUser?.uid === user.id) setTasks(merged);
    });
  };

  const handleLogout = async () => {
    setActiveUser(null);
    setCurrentUser(null);
    setTasks([]);
    setActiveTab('agenda');
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

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center text-sm text-[#737373]">
        Carregando…
      </div>
    );
  }

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

  // Task shown on the Foco screen: the pending task happening now, else the next one today.
  const focusTaskTitle = (() => {
    const todayISO = formatDateToISO(new Date());
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const today = tasks
      .filter((t) => t.date === todayISO && t.status !== 'completed' && t.hasSpecificTime)
      .sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
    const current = today.find((t) => toMin(t.startTime) <= now && now < toMin(t.endTime));
    if (current) return `Agora: ${current.title}`;
    const next = today.find((t) => toMin(t.startTime) > now);
    return next ? `Próxima: ${next.title} às ${next.startTime}` : undefined;
  })();

  // Filter tasks for selected day to show in progress bar
  const selectedDateISO = formatDateToISO(selectedDate);
  const dayTasks = tasks.filter((t) => t.date === selectedDateISO);

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${
        isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F7F7F7] text-[#0A0A0A]'
      } flex flex-col`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Main Container Wrapper / Centering area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
        {/* Main App Container */}
        <div
          className="flex flex-col w-full transition-all max-w-2xl h-full lg:h-[90vh] lg:max-h-[920px] bg-white dark:bg-[#0A0A0A] border-x lg:border border-[#E5E5E5] dark:border-[#262626] lg:rounded-3xl overflow-hidden relative shadow-xl"
        >
          {/* Header (hidden in Foco, which is full screen) */}
          {activeTab !== 'foco' && (
            <div className="shrink-0">
              <TimelineHeader
                onOpenClock={() => setActiveTab('relogio')}
                onOpenCalendar={() => setActiveTab('calendario')}
                onGoHome={() => setActiveTab('agenda')}
              />
            </div>
          )}

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
            {activeTab === 'foco' && (
              <FocusScreen currentTaskTitle={focusTaskTitle} onThemeChange={setFocusTheme} />
            )}

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

          {/* Floating new-task button on the agenda */}
          {activeTab === 'agenda' && (
            <button
              type="button"
              onClick={handleOpenNewTask}
              aria-label="Nova tarefa"
              title="Nova tarefa"
              className="absolute right-4 bottom-24 z-30 w-14 h-14 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6 stroke-[2.4]" />
            </button>
          )}

          {/* Bottom Tab Navigation (dark while the Foco screen uses a dark theme) */}
          <div className={`shrink-0 ${activeTab === 'foco' && focusTheme !== 'paper' ? 'dark' : ''}`}>
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
