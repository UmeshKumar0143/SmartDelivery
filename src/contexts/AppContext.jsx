import React, { createContext, useContext, useReducer } from 'react';
import { graphData, usersData, ordersData } from '../data/demoData';
import { findShortestPath } from '../utils/dijkstra';

// Initial state
const initialState = {
  users: usersData,
  graph: graphData,
  orders: ordersData,
  currentUser: null,
};

// Create the context
const AppContext = createContext({
  state: initialState,
  dispatch: () => null,
});

// Reducer function
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
      
      // Find shortest path using Dijkstra's algorithm
      const { path, distance, estimatedTime } = findShortestPath(
        state.graph,
        sourceAddressId,
        targetAddressId
      );

      // Create a new order
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
    
    case 'TOGGLE_OBSTACLE': {
      const { edgeId } = action.payload;
      
      // Update the edge's blocked status
      const updatedEdges = state.graph.edges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, isBlocked: !edge.isBlocked };
        }
        return edge;
      });

      const updatedGraph = {
        ...state.graph,
        edges: updatedEdges,
      };

      // Recalculate paths for all orders
      const recalculatedOrders = state.orders.map((order) => {
        if (order.status !== 'delivered') {
          const { path, distance, estimatedTime } = findShortestPath(
            updatedGraph,
            order.sourceAddressId,
            order.targetAddressId
          );
          
          return {
            ...order,
            path,
            distance,
            estimatedDeliveryTime: estimatedTime,
          };
        }
        
        return order;
      });

      return {
        ...state,
        graph: updatedGraph,
        orders: recalculatedOrders,
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

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);