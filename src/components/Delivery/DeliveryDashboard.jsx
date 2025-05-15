import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import MapView from '../Map/MapView';
import { Truck, Clock, Package, MapPin, Navigation } from 'lucide-react';

const DeliveryDashboard = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser, orders, graph } = state;
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders for the current delivery guy
  useEffect(() => {
    if (currentUser) {
      const filteredOrders = orders.filter(order => 
        order.deliveryGuyId === currentUser.id && 
        order.status !== 'delivered'
      );
      setDeliveryOrders(filteredOrders);
      
      // Select the first order if we have any
      if (filteredOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(filteredOrders[0]);
      }
    }
  }, [currentUser, orders, selectedOrder]);

  // Function to update order status
  const handleUpdateStatus = (order) => {
    let nextStatus;
    
    switch (order.status) {
      case 'placed':
        nextStatus = 'assigned';
        break;
      case 'assigned':
        nextStatus = 'in-progress';
        break;
      case 'in-progress':
        nextStatus = 'delivered';
        break;
      default:
        return;
    }
    
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId: order.id, status: nextStatus },
    });
  };

  // Get next action text
  const getNextActionText = (status) => {
    switch (status) {
      case 'placed':
        return 'Accept Order';
      case 'assigned':
        return 'Start Delivery';
      case 'in-progress':
        return 'Mark as Delivered';
      default:
        return '';
    }
  };

  // Get node name by ID
  const getNodeName = (nodeId) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node?.name || 'Unknown';
  };

  if (!currentUser) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Delivery Dashboard</h1>
        <p className="text-gray-600">
          Manage and track your assigned deliveries.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-1/3 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Orders</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {deliveryOrders.length} orders
              </span>
            </div>

            <div className="space-y-3">
              {deliveryOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium">Order {order.id}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <Truck className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Pickup from:</p>
                        <p className="font-medium">{getNodeName(order.sourceAddressId)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Deliver to:</p>
                        <p className="font-medium">{getNodeName(order.targetAddressId)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{order.distance} km</span>
                      <span>{order.estimatedDeliveryTime} min</span>
                    </div>

                    <button
                      className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order);
                      }}
                    >
                      {getNextActionText(order.status)}
                    </button>
                  </div>
                </div>
              ))}

              {deliveryOrders.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No active orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200">
          <MapView selectedOrder={selectedOrder} highlightUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard; 