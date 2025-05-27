import React, { createContext, useContext, useReducer } from 'react';
import { graphData, usersData, ordersData } from '../data/demoData';
import { findShortestPath } from '../utils/dijkstra';

const initialState = {
  users: usersData,
  graph: graphData,
  orders: ordersData,
  currentUser: null,
};

const AppContext = createContext({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId) || null;
      return {
        ...state,
        currentUser: user,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
      };
    
    case 'PLACE_ORDER': {
      const { userId, targetAddressId, deliveryGuyId } = action.payload;
      const deliveryGuy = state.users.find((u) => u.id === deliveryGuyId);
      
      if (!deliveryGuy) {
        return state;
      }

      const sourceAddressId = deliveryGuy.addressId;
      
      const { path, distance, estimatedTime } = findShortestPath(
        state.graph,
        sourceAddressId,
        targetAddressId
      );

      const newOrder = {
        id: `o${state.orders.length + 1}`,
        userId,
        deliveryGuyId,
        sourceAddressId,
        targetAddressId,
        status: 'placed',
        createdAt: new Date(),
        path,
        distance,
        estimatedDeliveryTime: estimatedTime,
      };

      return {
        ...state,
        orders: [...state.orders, newOrder],
      };
    }
    
    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status } = action.payload;
      
      const updatedOrders = state.orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status };
        }
        return order;
      });

      return {
        ...state,
        orders: updatedOrders,
      };
    }
    
    
    
    case 'SELECT_NODE': {
      return {
        ...state,
        selectedNodeId: action.payload,
      };
    }
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);