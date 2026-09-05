// GiveForward — API-based State Management Store

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
let state = {
  currentUser: null,
  entries: [],
  chains: [],
  users: [],
  stats: {
    totalActs: 0,
    peopleHelped: 0,
    chainsStarted: 0,
    longestChain: 0,
    hoursGiven: 0 // Mocked stat or could be calculated
  }
};

// Initialize by fetching current user and global data
export async function initStore() {
  try {
    // 1. Fetch current user session
    const meRes = await fetch('/api/auth/me');
    if (meRes.ok) {
      const data = await meRes.json();
      state.currentUser = data.user;
    } else {
      state.currentUser = null;
    }

    // 2. Fetch chains (which also returns users)
    const chainsRes = await fetch('/api/chains');
    if (chainsRes.ok) {
      const { chains, users } = await chainsRes.json();
      state.chains = chains;
      state.users = users; // Map of users involved in chains
      calculateGlobalStats();
    }

    // 3. Fetch recent entries
    const entriesRes = await fetch('/api/entries');
    if (entriesRes.ok) {
      state.entries = await entriesRes.json();
    }

    emit('init', state);
    return state;
  } catch (error) {
    console.error('Failed to initialize store from APIs', error);
  }
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  state.currentUser = null;
  emit('auth:change', null);
  window.location.hash = '#/';
}

function calculateGlobalStats() {
  state.stats.totalActs = state.chains.reduce((acc, chain) => acc + chain.acts.length, 0);
  
  const uniqueUsers = new Set();
  state.chains.forEach(c => {
    c.acts.forEach(act => {
      uniqueUsers.add(act.from);
      uniqueUsers.add(act.to);
    });
  });
  
  state.stats.peopleHelped = uniqueUsers.size;
  state.stats.chainsStarted = state.chains.length;
  state.stats.longestChain = state.chains.length > 0 ? Math.max(...state.chains.map(c => c.acts.length)) : 0;
  state.stats.hoursGiven = state.stats.totalActs * 2; // Rough estimate for UI flair
}

// ========== GETTERS ==========

export function getState() {
  return state;
}

export function getUsers() {
  return state.users;
}

export function getUserById(id) {
  // If id is a fully populated user object, just return it
  if (id && typeof id === 'object' && id._id) return id;
  
  // Try to find in state.users, or if it's the current user
  if (state.currentUser && state.currentUser._id === id) return state.currentUser;
  return state.users.find((u) => u._id === id);
}

export function getCurrentUser() {
  return state.currentUser;
}

export function getEntries(filter = {}) {
  let entries = state.entries;

  if (filter.type) entries = entries.filter((e) => e.type === filter.type);
  if (filter.category && filter.category !== 'all') entries = entries.filter((e) => e.category === filter.category);
  if (filter.status) entries = entries.filter((e) => e.status === filter.status);
  
  if (filter.search) {
    const q = filter.search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  return entries;
}

export function getChains() {
  return state.chains;
}

export function getStats() {
  return state.stats;
}

// ========== MUTATIONS (API Calls) ==========

export async function addEntry(entryData) {
  try {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    
    if (!res.ok) throw new Error('Failed to create entry');
    
    const newEntry = await res.json();
    state.entries.unshift(newEntry);
    emit('entry:added', newEntry);
    return newEntry;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function completeMatch(fromUserId, toUserId, action, category) {
  try {
    const res = await fetch('/api/chains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId, toUserId, action, category })
    });
    
    if (!res.ok) throw new Error('Failed to log act');
    
    const { act, chain } = await res.json();
    
    // Update local chains state
    const existingChainIdx = state.chains.findIndex(c => c._id === chain._id);
    if (existingChainIdx > -1) {
      state.chains[existingChainIdx] = chain;
    } else {
      state.chains.push(chain);
    }
    
    calculateGlobalStats();
    emit('chain:updated', { act, chains: state.chains });
    return act;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Build the network graph data from chains
export function getNetworkData() {
  const nodesMap = new Map();
  const links = [];

  for (const chain of state.chains) {
    for (const act of chain.acts) {
      // Handle missing/unpopulated users safely
      const fromId = typeof act.from === 'object' ? act.from._id : act.from;
      const toId = typeof act.to === 'object' ? act.to._id : act.to;

      if (!nodesMap.has(fromId)) {
        const user = getUserById(fromId);
        nodesMap.set(fromId, {
          id: fromId,
          name: user?.name || 'User',
          initials: user?.initials || 'U',
          color: user?.color || '#6C5CE7',
          actCount: 0,
        });
      }
      if (!nodesMap.has(toId)) {
        const user = getUserById(toId);
        nodesMap.set(toId, {
          id: toId,
          name: user?.name || 'User',
          initials: user?.initials || 'U',
          color: user?.color || '#6C5CE7',
          actCount: 0,
        });
      }

      nodesMap.get(fromId).actCount++;
      nodesMap.get(toId).actCount++;

      links.push({
        source: fromId,
        target: toId,
        action: act.action,
        category: act.category,
        chainId: chain._id,
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}

export function getUserChains(userId) {
  if (!userId) return [];
  return state.chains.filter((chain) =>
    chain.acts.some((act) => {
      const fromId = typeof act.from === 'object' ? act.from._id : act.from;
      const toId = typeof act.to === 'object' ? act.to._id : act.to;
      return fromId === userId || toId === userId;
    })
  );
}

export function getUserStats(userId) {
  if (!userId) return { actsCompleted: 0, actsReceived: 0, peopleReached: 0, chainsStarted: 0, longestChain: 0 };
  
  const chains = getUserChains(userId);
  const acts = chains.flatMap((c) => c.acts);
  
  const givenActs = acts.filter((act) => {
    const fromId = typeof act.from === 'object' ? act.from._id : act.from;
    return fromId === userId;
  });
  
  const receivedActs = acts.filter((act) => {
    const toId = typeof act.to === 'object' ? act.to._id : act.to;
    return toId === userId;
  });

  const reached = new Set();
  for (const chain of chains) {
    let foundUser = false;
    for (const act of chain.acts) {
      const fromId = typeof act.from === 'object' ? act.from._id : act.from;
      const toId = typeof act.to === 'object' ? act.to._id : act.to;
      
      if (fromId === userId) foundUser = true;
      if (foundUser) reached.add(toId);
    }
  }

  return {
    actsCompleted: givenActs.length,
    actsReceived: receivedActs.length,
    peopleReached: reached.size,
    chainsStarted: chains.filter((c) => {
      const firstActFrom = typeof c.acts[0]?.from === 'object' ? c.acts[0].from._id : c.acts[0]?.from;
      return firstActFrom === userId;
    }).length,
    longestChain: chains.length > 0 ? Math.max(...chains.map((c) => c.acts.length)) : 0,
  };
}
