import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Package, MapPin, Truck, ArrowRight } from 'lucide-react';

const OrderForm = ({ onOrderPlaced }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser, graph, users } = state;
  
  const [targetAddressId, setTargetAddressId] = useState('');
  const [deliveryGuyId, setDeliveryGuyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  // Get all addresses excluding the current user's address
  const availableAddresses = graph.nodes.filter(node => node.id !== currentUser.addressId);

  // Get all delivery guys
  const deliveryGuys = users.filter(user => user.role === 'delivery');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (targetAddressId && deliveryGuyId && currentUser) {
      setIsSubmitting(true);
      
      // Create a new order
      dispatch({
        type: 'PLACE_ORDER',
        payload: {
          userId: currentUser.id,
          targetAddressId,
          deliveryGuyId,
        },
      });
      
      // Reset form and show success message
      setTimeout(() => {
        setTargetAddressId('');
        setDeliveryGuyId('');
        setIsSubmitting(false);
        
        if (onOrderPlaced) {
          onOrderPlaced();
        }
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Package className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">Place New Order</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Address
          </label>
          <div className="relative">
            <input
              type="text"
              id="currentAddress"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              value={currentUser.address}
              disabled
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Address
          </label>
          <div className="relative">
            <select
              id="targetAddress"
              value={targetAddressId}
              onChange={(e) => setTargetAddressId(e.target.value)}
              className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              required
            >
              <option value="">Select delivery address</option>
              {availableAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="deliveryGuy" className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Person
          </label>
          <div className="relative">
            <select
              id="deliveryGuy"
              value={deliveryGuyId}
              onChange={(e) => setDeliveryGuyId(e.target.value)}
              className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              required
            >
              <option value="">Select delivery person</option>
              {deliveryGuys.map((deliveryGuy) => (
                <option key={deliveryGuy.id} value={deliveryGuy.id}>
                  {deliveryGuy.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Truck className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm; 