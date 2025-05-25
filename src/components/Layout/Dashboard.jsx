import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LogOut, Menu, X, Map, Package, Truck, Settings, AlertTriangle } from 'lucide-react';

const Dashboard = ({ children }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const getNavOptions = (role) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: <Map className="w-5 h-5" />, id: 'dashboard' },
        ];
      case 'user':
        return [
          { name: 'Dashboard', icon: <Map className="w-5 h-5" />, id: 'dashboard' },
        ];
      case 'delivery':
        return [
          { name: 'Dashboard', icon: <Map className="w-5 h-5" />, id: 'dashboard' },
        ];
      default:
        return [];
    }
  };

  const navOptions = getNavOptions(currentUser.role);
  const [activeNav, setActiveNav] = useState(navOptions[0]?.id || '');

  return (
    <div className="flex h-screen bg-gray-100">
      <div 
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } p-4 flex flex-col`}
      >
        <div className="flex items-center justify-between mb-8">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <Map className="h-8 w-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-800">DeliveryRoute</h1>
            </div>
          ) : (
            <Map className="h-8 w-8 text-blue-500 mx-auto" />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col space-y-2 flex-1">
          {navOptions.map((option) => (
            <button
              key={option.id}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                activeNav === option.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveNav(option.id)}
            >
              {option.icon}
              {sidebarOpen && <span className="ml-3">{option.name}</span>}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-4`}>
            <div className={`flex items-center ${!sidebarOpen && 'hidden'}`}>
              <div className="bg-blue-100 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors p-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 