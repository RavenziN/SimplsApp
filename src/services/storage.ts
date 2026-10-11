import { Task, User, UserPreferences } from '../types';
import { formatDateToISO } from '../utils/dateUtils';
import { db } from './firebase';
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

const USERS_KEY = 'day_users_registry';
const ACTIVE_USER_KEY = 'day_active_user';
const PREFS_KEY_PREFIX = 'day_prefs_';
const TASKS_KEY_PREFIX = 'day_tasks_';
// Ids this browser has seen in Firestore. A local task missing from Firestore
// that is in this set was deleted on another device; one that isn't is new here.
const SYNCED_IDS_KEY_PREFIX = 'day_synced_ids_';

function readSyncedIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${SYNCED_IDS_KEY_PREFIX}${userId}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function updateSyncedIds(userId: string, update: (ids: Set<string>) => void): void {
  const ids = readSyncedIds(userId);
  update(ids);
  try {
    localStorage.setItem(`${SYNCED_IDS_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  startHour: 7,
  endHour: 23,
  autoScrollToCurrentTime: true,
};

// Task ids are only unique per user (e.g. the demo seed uses "task-1"),
// so the Firestore document id is namespaced by the owner.
function taskDocRef(userId: string, taskId: string) {
  return doc(db, 'tasks', `${userId}_${taskId}`);
}

export async function syncTaskToFirestore(task: Task) {
  try {
    await setDoc(taskDocRef(task.userId, task.id), task, { merge: true });
    updateSyncedIds(task.userId, (ids) => ids.add(task.id));
  } catch (err) {
    console.error('Error syncing task to Firestore:', err);
  }
}

async function deleteTaskFromFirestore(userId: string, taskId: string) {
  try {
    await deleteDoc(taskDocRef(userId, taskId));
    updateSyncedIds(userId, (ids) => ids.delete(taskId));
  } catch (err) {
    console.error('Error deleting task from Firestore:', err);
  }
}

export async function fetchRemoteTasks(userId: string): Promise<Task[] | null> {
  try {
    const snap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', userId)));
    return snap.docs.map((d) => d.data() as Task);
  } catch (err) {
    console.error('Error loading tasks from Firestore:', err);
    return null;
  }
}

// Merges tasks saved in this browser with the ones in Firestore (newest
// updatedAt wins) so the agenda follows the user across devices.
export async function syncUserTasksWithRemote(userId: string): Promise<Task[]> {
  const local = readLocalTasks(userId) ?? [];
  const remote = await fetchRemoteTasks(userId);
  if (!remote) return local;

  const syncedIds = readSyncedIds(userId);
  const byId = new Map<string, Task>();
  for (const task of remote) byId.set(task.id, task);
  for (const task of local) {
    const other = byId.get(task.id);
    if (!other && syncedIds.has(task.id)) continue; // deleted on another device
    if (!other || (task.updatedAt || '') > (other.updatedAt || '')) {
      byId.set(task.id, task);
      syncTaskToFirestore(task);
    }
  }

  const merged = Array.from(byId.values());
  writeLocalTasks(userId, merged);
  updateSyncedIds(userId, (ids) => {
    ids.clear();
    remote.forEach((task) => ids.add(task.id));
  });
  return merged;
}

export async function syncUserToFirestore(user: User) {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (err) {
    console.error('Error syncing user to Firestore:', err);
  }
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading users from localStorage', err);
    return [];
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage', err);
  }
}

export function getActiveUser(): User | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading active user', err);
    return null;
  }
}

export function setActiveUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (err) {
    console.error('Error setting active user', err);
  }
}

export function saveUserProfile(updatedUser: User): void {
  const users = getStoredUsers();

  const index = users.findIndex(
    (user) => user.id === updatedUser.id
  );

  if (index >= 0) {
    users[index] = updatedUser;
    saveStoredUsers(users);
  }

  const activeUser = getActiveUser();

  if (activeUser?.id === updatedUser.id) {
    setActiveUser(updatedUser);
  }

  syncUserToFirestore(updatedUser);
}

export function getUserPreferences(userId: string): UserPreferences {
  try {
    const raw = localStorage.getItem(`${PREFS_KEY_PREFIX}${userId}`);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch (err) {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences(userId);
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(`${PREFS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving preferences', err);
  }
  return updated;
}

export function generateInitialTasks(userId: string): Task[] {
  const todayISO = formatDateToISO(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = formatDateToISO(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = formatDateToISO(tomorrow);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterISO = formatDateToISO(dayAfter);

  return [
    {
      id: 'task-1',
      userId,
      title: 'Academia',
      description: 'Treino de pernas e 20 minutos de cardio na esteira.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '08:00',
      endTime: '09:00',
      category: 'Saúde',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      userId,
      title: 'Reunião equipe',
      description: 'Alinhamento das metas semanais de produto e cronograma.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '09:00',
      endTime: '10:00',
      category: 'Trabalho',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      userId,
      title: 'Analisar produtos',
      description: 'Pesquisar novos produtos para o Mercado Livre e analisar margem de lucro.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '10:00',
      endTime: '12:00',
      category: 'Marketplace',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      userId,
      title: 'Almoço',
      description: 'Pausa para alimentação saudável e descanso.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '12:00',
      endTime: '13:00',
      category: 'Pessoal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      userId,
      title: 'Responder e-mails',
      description: 'Limpar caixa de entrada e responder solicitações urgentes de clientes.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '14:00',
      endTime: '15:00',
      category: 'Trabalho',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      userId,
      title: 'Revisão de planejamento',
      description: 'Conferir entregas do dia e organizar prioridades de amanhã.',
      date: todayISO,
      hasSpecificTime: true,
      startTime: '17:00',
      endTime: '18:00',
      category: 'Foco',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      userId,
      title: 'Leitura diária',
      description: 'Ler 20 páginas do livro sobre hábitos atômicos e produtividade.',
      date: todayISO,
      hasSpecificTime: false,
      startTime: '00:00',
      endTime: '00:00',
      category: 'Estudos',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      userId,
      title: 'Treino de natação',
      description: 'Treino de resistência 1000m.',
      date: yesterdayISO,
      hasSpecificTime: true,
      startTime: '07:30',
      endTime: '08:30',
      category: 'Saúde',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-9',
      userId,
      title: 'Apresentação para investidores',
      description: 'Pitch deck e demonstração da nova versão do sistema.',
      date: tomorrowISO,
      hasSpecificTime: true,
      startTime: '10:30',
      endTime: '12:00',
      category: 'Trabalho',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-10',
      userId,
      title: 'Compras de supermercado',
      description: 'Frutas, vegetais e itens para o café da manhã.',
      date: dayAfterISO,
      hasSpecificTime: true,
      startTime: '18:00',
      endTime: '19:30',
      category: 'Pessoal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function readLocalTasks(userId: string): Task[] | null {
  try {
    const raw = localStorage.getItem(`${TASKS_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error reading tasks', err);
    return null;
  }
}

function writeLocalTasks(userId: string, tasks: Task[]): void {
  try {
    localStorage.setItem(`${TASKS_KEY_PREFIX}${userId}`, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
}

export function getUserTasks(userId: string): Task[] {
  return readLocalTasks(userId) ?? [];
}

export function saveUserTasks(userId: string, tasks: Task[]): void {
  const previous = readLocalTasks(userId) ?? [];
  writeLocalTasks(userId, tasks);

  // Only write what changed, and remove deleted tasks from Firestore too.
  const prevById = new Map(previous.map((t) => [t.id, t]));
  const nextIds = new Set(tasks.map((t) => t.id));
  tasks.forEach((task) => {
    const prev = prevById.get(task.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(task)) {
      syncTaskToFirestore({ ...task, userId });
    }
  });
  previous.forEach((task) => {
    if (!nextIds.has(task.id)) deleteTaskFromFirestore(userId, task.id);
  });
}

export function clearUserTasks(userId: string): void {
  saveUserTasks(userId, []);
}

export function resetDemoTasks(userId: string): Task[] {
  const tasks = generateInitialTasks(userId);
  saveUserTasks(userId, tasks);
  return tasks;
}

export function exportTasksAsJSON(userId: string): string {
  const tasks = getUserTasks(userId);
  const data = {
    app: 'Simpls',
    version: '1.0',
    userId,
    exportedAt: new Date().toISOString(),
    tasks,
  };
  return JSON.stringify(data, null, 2);
}

export function importTasksFromJSON(userId: string, jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.tasks || !Array.isArray(data.tasks)) {
      return { success: false, count: 0, error: 'Formato de arquivo JSON inválido. Chave "tasks" não encontrada.' };
    }

    const currentTasks = getUserTasks(userId);
    const validImported: Task[] = data.tasks.map((t: any, index: number) => ({
      id: t.id || `imported-${Date.now()}-${index}`,
      userId,
      title: String(t.title || 'Tarefa Importada'),
      description: t.description ? String(t.description) : undefined,
      date: String(t.date || formatDateToISO(new Date())),
      hasSpecificTime: Boolean(t.hasSpecificTime),
      startTime: String(t.startTime || '09:00'),
      endTime: String(t.endTime || '10:00'),
      category: t.category ? String(t.category) : undefined,
      status: t.status === 'completed' ? 'completed' : 'pending',
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Merge or replace
    const merged = [...validImported, ...currentTasks.filter(ct => !validImported.some(it => it.id === ct.id))];
    saveUserTasks(userId, merged);
    return { success: true, count: validImported.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Erro ao processar JSON.' };
  }
}
