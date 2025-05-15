import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Clock, Package, ChevronRight, CheckCircle, Truck, MapPin } from 'lucide-react';

const OrdersTable = ({ 
  orders, 
  onSelectOrder, 
  selectedOrderId,
  isAdmin = false,
}) => {
  const { state, dispatch } = useAppContext();
  const { graph, users } = state;

  // Get node name by ID
  const getNodeName = (nodeId) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node?.name || 'Unknown';
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  // Handle order status update
  const handleUpdateStatus = (orderId, newStatus) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: newStatus },
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-amber-100 text-amber-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get next status options
  const getNextStatus = (status) => {
    switch (status) {
      case 'placed':
        return { value: 'assigned', label: 'Assign Order' };
      case 'assigned':
        return { value: 'in-progress', label: 'Start Delivery' };
      case 'in-progress':
        return { value: 'delivered', label: 'Mark Delivered' };
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr 
              key={order.id} 
              className={`hover:bg-gray-50 ${selectedOrderId === order.id ? 'bg-blue-50' : ''}`}
              onClick={() => onSelectOrder && onSelectOrder(order)}
            >
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{order.id}</span>
                </div>
              </td>
              
              {isAdmin && (
                <td className="px-4 py-4">
                  {getUserName(order.userId)}
                </td>
              )}
              
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-gray-400 mr-2" />
                  {getNodeName(order.sourceAddressId)}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  {getNodeName(order.targetAddressId)}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(order.createdAt)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable; 