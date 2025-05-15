import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import MapView from '../Map/MapView';
import OrdersTable from '../Orders/OrdersTable';
import ObstacleManager from './ObstacleManager';

const AdminDashboard = () => {
  const { state } = useAppContext();
  const { orders } = state;
  const [activeTab, setActiveTab] = useState('map');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Count orders by status
  const orderCounts = {
    total: orders.length,
    placed: orders.filter(o => o.status === 'placed').length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage orders, obstacles, and view delivery paths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-semibold">{orderCounts.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Placed</p>
          <p className="text-2xl font-semibold text-blue-500">{orderCounts.placed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-semibold text-amber-500">{orderCounts.inProgress + orderCounts.assigned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Delivered</p>
          <p className="text-2xl font-semibold text-green-500">{orderCounts.delivered}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-grow flex flex-col overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('map')}
            >
              Map View
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'obstacles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('obstacles')}
            >
              Obstacles
            </button>
          </nav>
        </div>

        <div className="flex-grow p-4 overflow-auto">
          {activeTab === 'map' && (
            <div className="h-full">
              <MapView selectedOrder={selectedOrder} showEdges={true} />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="h-full overflow-auto">
              <OrdersTable 
                orders={orders} 
                onSelectOrder={setSelectedOrder}
                selectedOrderId={selectedOrder?.id}
                isAdmin={true}
              />
            </div>
          )}
          
          {activeTab === 'obstacles' && (
            <div className="h-full flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                <ObstacleManager />
              </div>
              <div className="md:w-2/3 h-[400px] md:h-auto">
                <MapView showEdges={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 