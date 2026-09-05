// GiveForward — Enhanced Seed Data
// Simulating real-world generosity chains

export const seedUsers = [
  { id: 'u1', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@example.com', password: 'password123', initials: 'SJ', color: '#FF6B6B' }, 
  { id: 'u2', name: 'Marcus Torres', email: 'marcus.t@example.com', password: 'password123', initials: 'MT', color: '#4ECDC4' },     
  { id: 'u3', name: 'Elena Rostova', email: 'elena.r@example.com', password: 'password123', initials: 'ER', color: '#9B59B6' },     
  { id: 'u4', name: 'James Kim', email: 'james.kim@example.com', password: 'password123', initials: 'JK', color: '#F1C40F' },         
  { id: 'u5', name: 'Priya Patel', email: 'priya.p@example.com', password: 'password123', initials: 'PP', color: '#3498DB' },       
  
  { id: 'u6', name: 'David Chen', email: 'david.chen@example.com', password: 'password123', initials: 'DC', color: '#E67E22' },        
  { id: 'u7', name: 'Anita Smith', email: 'anita.s@example.com', password: 'password123', initials: 'AS', color: '#1ABC9C' },       
  { id: 'u8', name: 'Tom Hardy', email: 'tom.hardy@example.com', password: 'password123', initials: 'TH', color: '#34495E' },         
  
  { id: 'u15', name: 'Demo User', email: 'demo@giveforward.app', password: 'password123', initials: 'DU', color: '#6C5CE7' },        
];

export const seedEntries = [
  // Needs
  {
    id: 'n1', userId: 'u5', type: 'need', category: 'education',
    title: 'Need help passing Calculus',
    description: 'I am struggling with my college calculus class and cannot afford a tutor. Is anyone willing to help me for 2 hours a week?',
    tags: ['calculus', 'tutoring', 'math'], location: 'Online', availability: 'Evenings', estimatedTime: '2 hrs/week', createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'n2', userId: 'u3', type: 'need', category: 'tech',
    title: 'Need a working laptop for my startup',
    description: 'My old laptop completely died and I am trying to launch a small community business. Any old working laptop would be a lifesaver.',
    tags: ['laptop', 'business', 'tech'], location: 'Austin, TX', availability: 'Anytime', estimatedTime: null, createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'n3', userId: 'u8', type: 'need', category: 'transport',
    title: 'Need a ride to physical therapy',
    description: 'I broke my leg and cannot drive. I need a ride to the clinic twice a week.',
    tags: ['driving', 'medical', 'transport'], location: 'Denver, CO', availability: 'Tuesdays & Thursdays', estimatedTime: '1 hr/trip', createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  
  // Offers
  {
    id: 'o1', userId: 'u1', type: 'offer', category: 'skills',
    title: 'Free Web Development Bootcamp',
    description: 'I am a senior engineer offering a free 4-week intensive web development course for 5 dedicated beginners.',
    tags: ['coding', 'mentorship', 'web-dev'], location: 'Online', availability: 'Weekends', estimatedTime: '4 weeks', createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'o2', userId: 'u6', type: 'offer', category: 'skills',
    title: 'Pro-bono Mechanic Work',
    description: 'I have my own garage and I am willing to do free labor for basic car repairs for families in need.',
    tags: ['mechanic', 'car', 'repair'], location: 'Denver, CO', availability: 'Saturdays', estimatedTime: 'Varies', createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'o3', userId: 'u15', type: 'offer', category: 'items',
    title: 'Giving away a bunch of winter coats',
    description: 'I have 5 gently used winter coats (sizes M and L) that I want to give to someone who needs them for the upcoming cold season.',
    tags: ['clothes', 'winter', 'coats'], location: 'Local', availability: 'Evenings', estimatedTime: 'Drop off', createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const seedChains = [
  {
    id: 'c1',
    name: 'The Tech Empowerment Ripple',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    acts: [
      { from: 'u1', to: 'u2', action: 'Taught web development from scratch', category: 'skills', completedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
      { from: 'u2', to: 'u3', action: 'Donated first paycheck to buy Elena a laptop', category: 'tech', completedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
      { from: 'u3', to: 'u4', action: 'Used business profits to cater free meals', category: 'food', completedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { from: 'u4', to: 'u5', action: 'Paid it forward by giving free calculus tutoring', category: 'education', completedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ]
  },
  {
    id: 'c2',
    name: 'The Denver Mobility Chain',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    acts: [
      { from: 'u6', to: 'u7', action: 'Repaired Anita\'s car engine for free', category: 'skills', completedAt: new Date(Date.now() - 86400000 * 18).toISOString() },
      { from: 'u7', to: 'u8', action: 'Used working car to drive Tom to physical therapy', category: 'transport', completedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    ]
  }
];
