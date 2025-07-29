import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, BarChart3, Package, AlertTriangle } from 'lucide-react';
import { Header } from './Header';
import { InventoryTable } from './InventoryTable';
import { AddItemModal } from './AddItemModal';
import { EditQuantityModal } from './EditQuantityModal';
import { InventoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demonstration
const mockItems: InventoryItem[] = [
  {
    id: 'MAT001',
    itemName: 'HDPE Pellets',
    type: 'virgin',
    price: 1.25,
    stock: 5000,
    status: 'in stock',
    note: 'High density polyethylene for bottles',
    location: 'location-1',
    category: 'material',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'MAT002',
    itemName: 'PET Recycled Flakes',
    type: 'recycled',
    price: 0.85,
    stock: 25,
    status: 'repurchase needed',
    note: 'Low stock - reorder soon',
    location: 'location-1',
    category: 'material',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'PRD001',
    itemName: 'Water Bottles 500ml',
    price: 0.15,
    stock: 10000,
    status: 'in stock',
    note: 'Clear bottles with standard cap',
    location: 'location-1',
    category: 'product',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'AST001',
    itemName: 'Injection Molding Machine #3',
    price: 45000,
    stock: 1,
    status: 'temporarily unavailable',
    note: 'Under maintenance',
    location: 'location-2',
    category: 'asset',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'MAT003',
    itemName: 'Masterbatch Blue',
    type: 'master',
    price: 3.50,
    stock: 150,
    status: 'in stock',
    note: 'For coloring plastic products',
    location: 'location-2',
    category: 'material',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16')
  }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [currentLocation, setCurrentLocation] = useState<'location-1' | 'location-2'>('location-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const locationItems = items.filter(item => item.location === currentLocation);

  const stats = {
    totalItems: locationItems.length,
    lowStock: locationItems.filter(item => item.stock <= 50).length,
    outOfStock: locationItems.filter(item => item.stock === 0).length,
    totalValue: locationItems.reduce((sum, item) => sum + (item.price * item.stock), 0)
  };

  const handleAddItem = (newItemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: `${newItemData.category.toUpperCase().slice(0,3)}${String(items.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setItems([...items, newItem]);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, stock: newQuantity, updatedAt: new Date() }
        : item
    ));
  };

  const handleEditQuantity = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentLocation={currentLocation} onLocationChange={setCurrentLocation} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="bg-red-100 rounded-lg p-3">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {user?.role === 'owner' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="material">Materials</option>
                  <option value="product">Products</option>
                  <option value="asset">Assets</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          items={locationItems}
          onEditQuantity={handleEditQuantity}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
        />
      </main>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        location={currentLocation}
      />

      <EditQuantityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={selectedItem}
        onUpdate={handleUpdateQuantity}
      />
    </div>
  );
};