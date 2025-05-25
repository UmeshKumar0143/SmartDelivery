import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../../contexts/AppContext';
import { getRouteGeometry } from '../../utils/dijkstra';

const DEFAULT_CENTER = [40.7580, -73.9855]; // Times Square, NY
const DEFAULT_ZOOM = 13;

// Utility to update the map view
const MapUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const MapView = ({ showEdges = false, selectedOrder = null, highlightUser = null }) => {
  const { state } = useAppContext();
  const { graph, users, orders } = state;
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [allRoutes, setAllRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Create custom icons for different user roles
  const userIcon = L.divIcon({
    className: 'bg-blue-500 rounded-full w-4 h-4 -ml-2 -mt-2',
    iconSize: [16, 16],
  });

  const adminIcon = L.divIcon({
    className: 'bg-purple-500 rounded-full w-4 h-4 -ml-2 -mt-2',
    iconSize: [16, 16],
  });

  const deliveryIcon = L.divIcon({
    className: 'bg-green-500 rounded-full w-4 h-4 -ml-2 -mt-2',
    iconSize: [16, 16],
  });

  // Get icon based on user role
  const getUserIcon = (user) => {
    switch (user.role) {
      case 'admin':
        return adminIcon;
      case 'delivery':
        return deliveryIcon;
      default:
        return userIcon;
    }
  };

  // Load routes for all delivery orders
  useEffect(() => {
    const loadAllRoutes = async () => {
      if (!highlightUser) return;

      setIsLoadingRoutes(true);
      try {
        const deliveryOrders = orders.filter(
          (order) => order.deliveryGuyId === highlightUser.id && order.status !== 'delivered'
        );

        const routes = await Promise.all(
          deliveryOrders.map(async (order) => {
            if (order.path && order.path.length > 1) {
              try {
                const geometry = await getRouteGeometry(graph, order.path);
                return { orderId: order.id, geometry, status: order.status };
              } catch (error) {
                console.error(`Failed to load route for order ${order.id}:`, error);
                const pathNodes = order.path
                  .map((nodeId) => graph.nodes.find((n) => n.id === nodeId))
                  .filter(Boolean);
                return {
                  orderId: order.id,
                  geometry: pathNodes.map((node) => [node.latitude, node.longitude]),
                  status: order.status,
                };
              }
            }
            return null;
          })
        );

        setAllRoutes(routes.filter((route) => route !== null));

        // Update map center to delivery guy's location if no order is selected
        if (!selectedOrder && highlightUser) {
          const userNode = graph.nodes.find((n) => n.id === highlightUser.addressId);
          if (userNode) {
            setMapCenter([userNode.latitude, userNode.longitude]);
          }
        }
      } catch (error) {
        console.error('Failed to load routes:', error);
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    loadAllRoutes();
  }, [orders, graph, highlightUser, selectedOrder]);

  // Update map center when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      const targetNode = graph.nodes.find((n) => n.id === selectedOrder.targetAddressId);
      if (targetNode) {
        setMapCenter([targetNode.latitude, targetNode.longitude]);
      }
    }
  }, [selectedOrder, graph.nodes]);

  // Render graph nodes as markers (only for users with orders or delivery guys)
  const renderNodes = () => {
    // Get user IDs who have placed orders
    const userIdsWithOrders = new Set(orders.map((order) => order.userId));

    // Filter users to include only those with orders or delivery guys
    const relevantUsers = users.filter(
      (user) => userIdsWithOrders.has(user.id) || user.role === 'delivery'
    );

    // Get nodes associated with these users
    const relevantNodeIds = new Set(relevantUsers.map((user) => user.addressId));

    return graph.nodes
      .filter((node) => relevantNodeIds.has(node.id))
      .map((node) => {
        const usersAtNode = relevantUsers.filter((u) => u.addressId === node.id);

        return (
          <Marker
            key={node.id}
            position={[node.latitude, node.longitude]}
            icon={usersAtNode.length > 0 ? getUserIcon(usersAtNode[0]) : userIcon}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{node.name}</h3>
                {usersAtNode.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Users at this location:</p>
                    <ul className="list-disc list-inside text-sm">
                      {usersAtNode.map((user) => (
                        <li key={user.id}>
                          {user.name} ({user.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      });
  };

  // Render graph edges as polylines
  const renderEdges = () => {
    if (!showEdges) return null;

    return graph.edges.map((edge) => {
      const sourceNode = graph.nodes.find((n) => n.id === edge.source);
      const targetNode = graph.nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      return (
        <Polyline
          key={edge.id}
          positions={[
            [sourceNode.latitude, sourceNode.longitude],
            [targetNode.latitude, targetNode.longitude],
          ]}
          color={edge.isBlocked ? 'red' : 'gray'}
          weight={2}
          opacity={0.7}
          dashArray={edge.isBlocked ? '5, 10' : ''}
        >
          <Popup>
            <div>
              <p>Distance: {edge.weight} km</p>
              <p>Status: {edge.isBlocked ? 'Blocked' : 'Open'}</p>
            </div>
          </Popup>
        </Polyline>
      );
    });
  };

  // Render delivery routes
  const renderPaths = () => {
    const inProgressOrder = allRoutes.find((route) => route.status === 'in-progress');

    if (inProgressOrder) {
      return (
        <Polyline
          key={inProgressOrder.orderId}
          positions={inProgressOrder.geometry}
          color="green"
          weight={4}
          opacity={0.8}
        />
      );
    }

    return allRoutes.map((route) => (
      <Polyline
        key={route.orderId}
        positions={route.geometry}
        color="blue"
        weight={4}
        opacity={0.8}
      />
    ));
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {renderNodes()}
        {renderEdges()}
        {renderPaths()}

        <MapUpdater center={mapCenter} />
      </MapContainer>

      {isLoadingRoutes && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-10">
          <span className="text-sm text-gray-600">Loading routes...</span>
        </div>
      )}
    </div>
  );
};

export default MapView;