export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface ChatSession {
  id?: string;
  phone: string;
  name?: string;
  expiration: number;
  isCompleted: boolean;
  retries: number;
}
 