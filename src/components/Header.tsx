import React from 'react';
import { Factory, LogOut, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentLocation: 'location-1' | 'location-2';
  onLocationChange: (location: 'location-1' | 'location-2') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLocation, onLocationChange }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-sm text-gray-600">Plastic Production Factory</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <select
                value={currentLocation}
                onChange={(e) => onLocationChange(e.target.value as 'location-1' | 'location-2')}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="location-1">Production Line A</option>
                <option value="location-2">Production Line B</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">{user?.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'owner' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};