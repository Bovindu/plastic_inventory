export interface User {
  id: string;
  username: string;
  role: 'owner' | 'worker';
  name: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  type?: 'virgin' | 'recycled' | 'master' | 'special added';
  price: number;
  stock: number;
  status: 'in stock' | 'repurchase needed' | 'temporarily unavailable';
  note: string;
  location: 'location-1' | 'location-2';
  category: 'material' | 'product' | 'asset';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}