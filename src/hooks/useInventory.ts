import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems: InventoryItem[] = data.map(item => ({
        id: item.id,
        itemName: item.item_name,
        type: item.type,
        price: item.price,
        stock: item.stock,
        status: item.status,
        note: item.note || '',
        location: item.location,
        category: item.category,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setItems(formattedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Generate ID based on category
      const prefix = newItemData.category.toUpperCase().slice(0, 3);
      const count = items.filter(item => item.category === newItemData.category).length + 1;
      const id = `${prefix}${String(count).padStart(3, '0')}`;

      const { error } = await supabase
        .from('inventory_items')
        .insert({
          id,
          item_name: newItemData.itemName,
          type: newItemData.type,
          price: newItemData.price,
          stock: newItemData.stock,
          status: newItemData.status,
          note: newItemData.note,
          location: newItemData.location,
          category: newItemData.category
        });

      if (error) throw error;
      
      await fetchItems(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          stock: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state immediately for better UX
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, stock: newQuantity, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    updateQuantity,
    refetch: fetchItems
  };
};