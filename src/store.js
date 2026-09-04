// GiveForward — State Management Store
// localStorage-backed with pub/sub for reactivity

import { seedUsers, seedEntries, seedChains, seedStats } from './data/seed.js';

const STORAGE_KEY = 'giveforward_store';

// Simple pub/sub event system
const listeners = {};

function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach((fn) => fn(data));
  }
}

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
  return () => {
    listeners[event] = listeners[event].filter((f) => f !== fn);
  };
}

// State
let state = null;

function getDefaultState() {
  return {
    users: [...seedUsers],
    entries: [...seedEntries],
    chains: JSON.parse(JSON.stringify(seedChains)),
    stats: { ...seedStats },
    currentUser: seedUsers.find((u) => u.id === 'u15'), // Dhruv Jani as default user
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
      // Ensure all keys exist (in case of schema changes)
      const defaults = getDefaultState();
      for (const key of Object.keys(defaults)) {
        if (!(key in state)) {
          state[key] = defaults[key];
        }
      }
    } else {
      state = getDefaultState();
    }
  } catch {
    state = getDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

// Initialize
export function initStore() {
  loadState();
  emit('init', state);
  return state;
}

// Reset to seed data
export function resetStore() {
  state = getDefaultState();
  saveState();
  emit('reset', state);
  return state;
}

// ========== GETTERS ==========

export function getState() {
  if (!state) loadState();
  return state;
}

export function getUsers() {
  return getState().users;
}

export function getUserById(id) {
  return getState().users.find((u) => u.id === id);
}

export function getCurrentUser() {
  return getState().currentUser;
}

export function getEntries(filter = {}) {
  let entries = getState().entries;

  if (filter.type) {
    entries = entries.filter((e) => e.type === filter.type);
  }
  if (filter.category) {
    entries = entries.filter((e) => e.category === filter.category);
  }
  if (filter.status) {
    entries = entries.filter((e) => e.status === filter.status);
  }
  if (filter.userId) {
    entries = entries.filter((e) => e.userId === filter.userId);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort by newest first
  return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getEntryById(id) {
  return getState().entries.find((e) => e.id === id);
}

export function getChains() {
  return getState().chains;
}

export function getStats() {
  return getState().stats;
}

// ========== MUTATIONS ==========

export function addEntry(entry) {
  const newEntry = {
    ...entry,
    id: `e${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  state.entries.unshift(newEntry);
  saveState();
  emit('entry:added', newEntry);
  return newEntry;
}

export function updateEntry(id, updates) {
  const idx = state.entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  state.entries[idx] = { ...state.entries[idx], ...updates };
  saveState();
  emit('entry:updated', state.entries[idx]);
  return state.entries[idx];
}

export function completeMatch(fromUserId, toUserId, action, category) {
  // Add to the most relevant chain, or create a new one
  const act = {
    from: fromUserId,
    to: toUserId,
    action,
    category,
    completedAt: new Date().toISOString(),
  };

  // Try to extend an existing chain
  let added = false;
  for (const chain of state.chains) {
    const lastAct = chain.acts[chain.acts.length - 1];
    if (lastAct.to === fromUserId || lastAct.from === fromUserId) {
      chain.acts.push(act);
      added = true;
      break;
    }
  }

  // If no matching chain, create a new one
  if (!added) {
    state.chains.push({
      id: `chain${Date.now()}`,
      name: 'New Generosity Chain',
      acts: [act],
    });
  }

  // Update stats
  state.stats.totalActs++;
  state.stats.peopleHelped = new Set(
    state.chains.flatMap((c) => c.acts.flatMap((a) => [a.from, a.to]))
  ).size;
  state.stats.chainsStarted = state.chains.length;
  state.stats.longestChain = Math.max(...state.chains.map((c) => c.acts.length));

  saveState();
  emit('chain:updated', { act, chains: state.chains });
  return act;
}

// Build the network graph data from chains
export function getNetworkData() {
  const nodesMap = new Map();
  const links = [];

  for (const chain of getState().chains) {
    for (const act of chain.acts) {
      // Add nodes
      if (!nodesMap.has(act.from)) {
        const user = getUserById(act.from);
        nodesMap.set(act.from, {
          id: act.from,
          name: user?.name || 'Unknown',
          initials: user?.initials || '??',
          color: user?.color || '#6C5CE7',
          actCount: 0,
        });
      }
      if (!nodesMap.has(act.to)) {
        const user = getUserById(act.to);
        nodesMap.set(act.to, {
          id: act.to,
          name: user?.name || 'Unknown',
          initials: user?.initials || '??',
          color: user?.color || '#6C5CE7',
          actCount: 0,
        });
      }

      nodesMap.get(act.from).actCount++;
      nodesMap.get(act.to).actCount++;

      // Add link
      links.push({
        source: act.from,
        target: act.to,
        action: act.action,
        category: act.category,
        chainId: chain.id,
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}

// Get chains involving a specific user
export function getUserChains(userId) {
  return getState().chains.filter((chain) =>
    chain.acts.some((act) => act.from === userId || act.to === userId)
  );
}

// Get user-specific stats
export function getUserStats(userId) {
  const chains = getUserChains(userId);
  const acts = chains.flatMap((c) => c.acts);
  const givenActs = acts.filter((a) => a.from === userId);
  const receivedActs = acts.filter((a) => a.to === userId);

  // Calculate chain reach — how many unique people are downstream
  const reached = new Set();
  for (const chain of chains) {
    let foundUser = false;
    for (const act of chain.acts) {
      if (act.from === userId) foundUser = true;
      if (foundUser) {
        reached.add(act.to);
      }
    }
  }

  return {
    actsCompleted: givenActs.length,
    actsReceived: receivedActs.length,
    peopleReached: reached.size,
    chainsStarted: chains.filter((c) => c.acts[0]?.from === userId).length,
    longestChain: chains.length > 0
      ? Math.max(...chains.map((c) => c.acts.length))
      : 0,
  };
}
