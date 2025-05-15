import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import MapView from '../Map/MapView';
import OrderForm from './OrderForm';
import OrdersTable from '../Orders/OrdersTable';
import { Package, MapPin } from 'lucide-react';

const UserDashboard = () => {
  const { state } = useAppContext();
  const { currentUser, orders } = state;
  const [activeTab, setActiveTab] = useState('map');
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders for the current user
  useEffect(() => {
    if (currentUser) {
      const filteredOrders = orders.filter(order => order.userId === currentUser.id);
      setUserOrders(filteredOrders);
      
      // Select the first order if we have any
      if (filteredOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(filteredOrders[0]);
      }
    }
  }, [currentUser, orders, selectedOrder]);

  // Set active tab when data changes
  useEffect(() => {
    if (userOrders.length === 0) {
      setActiveTab('placeOrder');
    }
  }, [userOrders]);

  if (!currentUser) return null;

  // Count orders by status
  const orderCounts = {
    total: userOrders.length,
    placed: userOrders.filter(o => o.status === 'placed').length,
    inProgress: userOrders.filter(o => ['assigned', 'in-progress'].includes(o.status)).length,
    delivered: userOrders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Dashboard</h1>
        <p className="text-gray-600">
          Track your orders and place new deliveries.
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
          <p className="text-2xl font-semibold text-amber-500">{orderCounts.inProgress}</p>
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
              My Orders
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'placeOrder'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('placeOrder')}
            >
              Place Order
            </button>
          </nav>
        </div>

        <div className="flex-grow p-4 overflow-auto">
          {activeTab === 'map' && (
            <div className="h-full">
              <MapView selectedOrder={selectedOrder} />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="h-full overflow-auto">
              <OrdersTable 
                orders={userOrders} 
                onSelectOrder={setSelectedOrder}
                selectedOrderId={selectedOrder?.id}
              />
            </div>
          )}
          
          {activeTab === 'placeOrder' && (
            <div className="max-w-2xl mx-auto">
              <OrderForm onOrderPlaced={() => setActiveTab('orders')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 