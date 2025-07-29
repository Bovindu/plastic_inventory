export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          role: 'owner' | 'worker';
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          role: 'owner' | 'worker';
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'owner' | 'worker';
          name?: string;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          item_name: string;
          type: 'virgin' | 'recycled' | 'master' | 'special added' | null;
          price: number;
          stock: number;
          status: 'in stock' | 'repurchase needed' | 'temporarily unavailable';
          note: string;
          location: 'location-1' | 'location-2';
          category: 'material' | 'product' | 'asset';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          item_name: string;
          type?: 'virgin' | 'recycled' | 'master' | 'special added' | null;
          price?: number;
          stock?: number;
          status?: 'in stock' | 'repurchase needed' | 'temporarily unavailable';
          note?: string;
          location?: 'location-1' | 'location-2';
          category?: 'material' | 'product' | 'asset';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          type?: 'virgin' | 'recycled' | 'master' | 'special added' | null;
          price?: number;
          stock?: number;
          status?: 'in stock' | 'repurchase needed' | 'temporarily unavailable';
          note?: string;
          location?: 'location-1' | 'location-2';
          category?: 'material' | 'product' | 'asset';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}