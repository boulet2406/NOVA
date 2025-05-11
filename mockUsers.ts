// mockUsers.ts

// Les rôles possibles
export type Role = 'user' | 'analyst' | 'admin';

// Le type d’un utilisateur
export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
}

// Génération de 5 utilisateurs factices
export function generateMockUsers(): User[] {
  return [
    { id: 'U001', username: 'alice',   password: 'alice123',   role: 'admin'   },
    { id: 'U002', username: 'bob',     password: 'bob123',     role: 'analyst' },
    { id: 'U003', username: 'charlie', password: 'charlie123', role: 'user'    },
    { id: 'U004', username: 'diana',   password: 'diana123',   role: 'user'    },
    { id: 'U005', username: 'eve',     password: 'eve123',     role: 'analyst' },
  ];
}
