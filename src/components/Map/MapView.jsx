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

  const userIcon = L.divIcon({
    className: 'bg-blue-500 rounded-full w-4 h-4 -ml-2 -mt-2',
    iconSize: [16, 16],
  });

  const deliveryIcon = L.divIcon({
    className: 'bg-green-500 rounded-full w-4 h-4 -ml-2 -mt-2',
    iconSize: [16, 16],
  });

  const getUserIcon = (user) => {
    return user?.role === 'delivery' ? deliveryIcon : userIcon;
  };

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

  useEffect(() => {
    if (selectedOrder) {
      const targetNode = graph.nodes.find((n) => n.id === selectedOrder.targetAddressId);
      if (targetNode) {
        setMapCenter([targetNode.latitude, targetNode.longitude]);
      }
    }
  }, [selectedOrder, graph.nodes]);

  const renderNodes = () => {
    const deliveryNodeIds = new Set(orders.map((order) => order.targetAddressId));

    if (highlightUser?.role === 'delivery') {
      deliveryNodeIds.add(highlightUser.addressId);
    }

    return graph.nodes
      .filter((node) => deliveryNodeIds.has(node.id))
      .map((node) => {
        const ordersAtNode = orders.filter((order) => order.targetAddressId === node.id);
        const usersAtNode = ordersAtNode
          .map((order) => users.find((u) => u.id === order.userId))
          .filter((user) => user);

        return (
          <Marker
            key={node.id}
            position={[node.latitude, node.longitude]}
            icon={
              node.id === highlightUser?.addressId
                ? getUserIcon(highlightUser)
                : usersAtNode.length > 0
                ? getUserIcon(usersAtNode[0])
                : userIcon
            }
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{node.name}</h3>
                {node.id === highlightUser?.addressId && highlightUser && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Delivery Guy:</p>
                    <p className="text-sm">{highlightUser.name}</p>
                  </div>
                )}
                {usersAtNode.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Ordered by:</p>
                    <ul className="list-disc list-inside text-sm">
                      {usersAtNode.map((user) => (
                        <li key={user.id}>{user.name}</li>
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