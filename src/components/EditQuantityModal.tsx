import React, { useState } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { InventoryItem } from '../types';

interface EditQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onUpdate: (itemId: string, newQuantity: number) => void;
}

export const EditQuantityModal: React.FC<EditQuantityModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdate
}) => {
  const [quantity, setQuantity] = useState('');
  const [operation, setOperation] = useState<'add' | 'remove'>('add');

  React.useEffect(() => {
    if (item) {
      setQuantity('');
      setOperation('add');
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !quantity) return;

    const quantityChange = parseInt(quantity);
    const newStock = operation === 'add' 
      ? item.stock + quantityChange 
      : Math.max(0, item.stock - quantityChange);

    onUpdate(item.id, newStock);
    onClose();
  };

  const quickAdjust = (amount: number, op: 'add' | 'remove') => {
    if (!item) return;
    
    const newStock = op === 'add' 
      ? item.stock + amount 
      : Math.max(0, item.stock - amount);

    onUpdate(item.id, newStock);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Quantity</h2>
              <p className="text-sm text-gray-600">{item.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Stock:</span>
              <span className="text-2xl font-bold text-gray-900">{item.stock.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickAdjust(1, 'add')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                +1
              </button>
              <button
                onClick={() => quickAdjust(1, 'remove')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <Minus className="w-4 h-4" />
                -1
              </button>
              <button
                onClick={() => quickAdjust(10, 'add')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                +10
              </button>
              <button
                onClick={() => quickAdjust(10, 'remove')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <Minus className="w-4 h-4" />
                -10
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Custom Amount</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOperation('add')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      operation === 'add' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('remove')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      operation === 'remove' 
                        ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Remove
                  </button>
                </div>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter quantity"
                  required
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                      operation === 'add'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {operation === 'add' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    {operation === 'add' ? 'Add' : 'Remove'} {quantity || '0'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};