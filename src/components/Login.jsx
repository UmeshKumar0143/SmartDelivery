import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MapPin, UserCog, Package, Truck } from 'lucide-react';

const Login = () => {
  const { state, dispatch } = useAppContext();
  const [selectedRole, setSelectedRole] = useState('user');

  // Filter users by the selected role
  const filteredUsers = state.users.filter((user) => user.role === selectedRole);

  const handleLogin = (userId) => {
    dispatch({ type: 'LOGIN', payload: userId });
  };

  const renderRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <UserCog className="w-5 h-5" />;
      case 'user':
        return <Package className="w-5 h-5" />;
      case 'delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <MapPin className="h-12 w-12 text-blue-500" />
          <h1 className="text-3xl font-bold ml-2 text-gray-800">DeliveryRoute</h1>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Select Your Role
        </h2>
        
        <div className="flex justify-between mb-8">
          {(['admin', 'user', 'delivery']).map((role) => (
            <button
              key={role}
              className={`py-3 px-4 rounded-lg transition-all flex-1 mx-1 flex flex-col items-center ${
                selectedRole === role
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <div className="mb-2">
                {renderRoleIcon(role)}
              </div>
              <span className="capitalize">{role}</span>
            </button>
          ))}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
            Select Account
          </h3>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className="w-full text-left px-4 py-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center group"
                onClick={() => handleLogin(user.id)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Login →
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Demo Application - No authentication required</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 