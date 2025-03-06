/**
 * Servizio API principale che gestisce le richieste HTTP
 * In un ambiente reale, questo servizio si connetterebbe a un backend.
 * Per questa demo, simula le chiamate API con dati locali.
 */

// Dati di esempio
const resourceTypes = [
  { id: 1, name: 'Server', color: '#1976d2' },
  { id: 2, name: 'GPU', color: '#4caf50' },
  { id: 3, name: 'Switch P4', color: '#ff9800' }
];

const resources = [
  { id: 1, name: 'Server 1', type: 1, specs: '16GB RAM, 4 CPUs', location: 'DC1', status: 'active' },
  { id: 2, name: 'Server 2', type: 1, specs: '32GB RAM, 8 CPUs', location: 'DC1', status: 'active' },
  { id: 3, name: 'NVIDIA Tesla', type: 2, specs: '16GB VRAM', location: 'DC2', status: 'active' },
  { id: 4, name: 'Switch P4 Alpha', type: 3, specs: '100Gbps', location: 'DC1', status: 'maintenance' }
];

const users = [
  { id: 1, name: 'Mario Rossi', email: 'mario.rossi@example.com', role: 'admin', avatar: 'MR' },
  { id: 2, name: 'Luigi Bianchi', email: 'luigi.bianchi@example.com', role: 'user', avatar: 'LB' },
  { id: 3, name: 'Giovanna Verdi', email: 'giovanna.verdi@example.com', role: 'user', avatar: 'GV' }
];

const events = [
  {
    id: 1,
    title: 'Prenotazione Server 1',
    resourceId: 1,
    start: new Date(2025, 2, 5, 10, 0),
    end: new Date(2025, 2, 5, 16, 0),
    user: 'Mario Rossi',
    userId: 1,
    description: 'Test di carico per nuova applicazione'
  },
  {
    id: 2,
    title: 'Test GPU',
    resourceId: 3,
    start: new Date(2025, 2, 6, 9, 0),
    end: new Date(2025, 2, 7, 18, 0),
    user: 'Luigi Bianchi',
    userId: 2,
    description: 'Addestramento modello ML'
  }
];

// Simulazione di ritardo di rete
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Funzione di utilità per generare ID univoci
const generateId = (collection) => {
  const maxId = collection.reduce((max, item) => Math.max(max, item.id), 0);
  return maxId + 1;
};

/**
 * Funzione generica per simulare una chiamata API
 * @param {string} endpoint - Endpoint API
 * @param {string} method - Metodo HTTP
 * @param {Object} data - Dati da inviare (per POST/PUT)
 * @returns {Promise<any>} - Risposta API
 */
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  await simulateNetworkDelay();
  
  // In un'app reale, qui si effettuerebbe la chiamata fetch() al backend
  console.log(`API ${method} request to ${endpoint}`, data);
  
  // Simula vari endpoint API
  if (endpoint.startsWith('/api/resources')) {
    return handleResourcesEndpoint(endpoint, method, data);
  } else if (endpoint.startsWith('/api/users')) {
    return handleUsersEndpoint(endpoint, method, data);
  } else if (endpoint.startsWith('/api/events')) {
    return handleEventsEndpoint(endpoint, method, data);
  } else if (endpoint.startsWith('/api/resource-types')) {
    return handleResourceTypesEndpoint(endpoint, method, data);
  }
  
  throw new Error(`Endpoint non supportato: ${endpoint}`);
};

// Gestione endpoint risorse
const handleResourcesEndpoint = (endpoint, method, data) => {
  // GET /api/resources
  if (endpoint === '/api/resources' && method === 'GET') {
    return [...resources];
  }
  
  // GET /api/resources/:id
  if (endpoint.match(/\/api\/resources\/\d+$/) && method === 'GET') {
    const id = parseInt(endpoint.split('/').pop());
    const resource = resources.find(r => r.id === id);
    if (!resource) throw new Error('Risorsa non trovata');
    return { ...resource };
  }
  
  // POST /api/resources
  if (endpoint === '/api/resources' && method === 'POST') {
    const newResource = {
      ...data,
      id: generateId(resources),
      type: parseInt(data.type)
    };
    resources.push(newResource);
    return { ...newResource };
  }
  
  // PUT /api/resources/:id
  if (endpoint.match(/\/api\/resources\/\d+$/) && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop());
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Risorsa non trovata');
    
    const updatedResource = {
      ...resources[index],
      ...data,
      id,
      type: parseInt(data.type)
    };
    resources[index] = updatedResource;
    return { ...updatedResource };
  }
  
  // DELETE /api/resources/:id
  if (endpoint.match(/\/api\/resources\/\d+$/) && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop());
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Risorsa non trovata');
    
    const deletedResource = resources[index];
    resources.splice(index, 1);
    return { ...deletedResource };
  }
  
  throw new Error(`Operazione non supportata per ${endpoint}`);
};

// Gestione endpoint utenti
const handleUsersEndpoint = (endpoint, method, data) => {
  // GET /api/users
  if (endpoint === '/api/users' && method === 'GET') {
    return [...users];
  }
  
  // GET /api/users/:id
  if (endpoint.match(/\/api\/users\/\d+$/) && method === 'GET') {
    const id = parseInt(endpoint.split('/').pop());
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Utente non trovato');
    return { ...user };
  }
  
  // POST /api/users
  if (endpoint === '/api/users' && method === 'POST') {
    const newUser = {
      ...data,
      id: generateId(users)
    };
    users.push(newUser);
    return { ...newUser };
  }
  
  // PUT /api/users/:id
  if (endpoint.match(/\/api\/users\/\d+$/) && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop());
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Utente non trovato');
    
    const updatedUser = {
      ...users[index],
      ...data,
      id
    };
    users[index] = updatedUser;
    return { ...updatedUser };
  }
  
  // DELETE /api/users/:id
  if (endpoint.match(/\/api\/users\/\d+$/) && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop());
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Utente non trovato');
    
    const deletedUser = users[index];
    users.splice(index, 1);
    return { ...deletedUser };
  }
  
  throw new Error(`Operazione non supportata per ${endpoint}`);
};

// Gestione endpoint eventi
const handleEventsEndpoint = (endpoint, method, data) => {
  // GET /api/events
  if (endpoint === '/api/events' && method === 'GET') {
    return [...events];
  }
  
  // GET /api/events/:id
  if (endpoint.match(/\/api\/events\/\d+$/) && method === 'GET') {
    const id = parseInt(endpoint.split('/').pop());
    const event = events.find(e => e.id === id);
    if (!event) throw new Error('Evento non trovato');
    return { ...event };
  }
  
  // POST /api/events
  if (endpoint === '/api/events' && method === 'POST') {
    // Ottieni l'utente per aggiungere il nome insieme all'ID
    const user = users.find(u => u.id === data.userId);
    
    const newEvent = {
      ...data,
      id: generateId(events),
      resourceId: parseInt(data.resourceId),
      user: user ? user.name : 'Utente sconosciuto'
    };
    events.push(newEvent);
    return { ...newEvent };
  }
  
  // PUT /api/events/:id
  if (endpoint.match(/\/api\/events\/\d+$/) && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop());
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento non trovato');
    
    // Ottieni l'utente se l'ID utente è cambiato
    let userName = events[index].user;
    if (data.userId !== events[index].userId) {
      const user = users.find(u => u.id === data.userId);
      userName = user ? user.name : 'Utente sconosciuto';
    }
    
    const updatedEvent = {
      ...events[index],
      ...data,
      id,
      resourceId: parseInt(data.resourceId),
      user: userName
    };
    events[index] = updatedEvent;
    return { ...updatedEvent };
  }
  
  // DELETE /api/events/:id
  if (endpoint.match(/\/api\/events\/\d+$/) && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop());
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento non trovato');
    
    const deletedEvent = events[index];
    events.splice(index, 1);
    return { ...deletedEvent };
  }
  
  throw new Error(`Operazione non supportata per ${endpoint}`);
};

// Gestione endpoint tipi di risorse
const handleResourceTypesEndpoint = (endpoint, method) => {
  // GET /api/resource-types
  if (endpoint === '/api/resource-types' && method === 'GET') {
    return [...resourceTypes];
  }
  
  throw new Error(`Operazione non supportata per ${endpoint}`);
};
