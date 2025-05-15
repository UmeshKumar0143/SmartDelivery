import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Login from './components/Login';
import Dashboard from './components/Layout/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserDashboard from './components/User/UserDashboard';
import DeliveryDashboard from './components/Delivery/DeliveryDashboard';
import './App.css';

const AppContent = () => {
  const { state } = useAppContext();
  const { currentUser } = state;

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <Login />;
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <Dashboard>
      {renderDashboard()}
    </Dashboard>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;