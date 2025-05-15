import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../../contexts/AppContext';

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

const MapView = ({ 
  showEdges = false,
  selectedOrder = null,
  highlightUser = null,
}) => {
  const { state } = useAppContext();
  const { graph, users, orders } = state;
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

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

  // Update map center when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      const targetNode = graph.nodes.find(n => n.id === selectedOrder.targetAddressId);
      if (targetNode) {
        setMapCenter([targetNode.latitude, targetNode.longitude]);
      }
    } else if (highlightUser) {
      const userNode = graph.nodes.find(n => n.id === highlightUser.addressId);
      if (userNode) {
        setMapCenter([userNode.latitude, userNode.longitude]);
      }
    }
  }, [selectedOrder, highlightUser, graph.nodes]);

  // Render graph nodes as markers
  const renderNodes = () => {
    return graph.nodes.map((node) => {
      // Find users at this node
      const usersAtNode = users.filter(u => u.addressId === node.id);
      
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
                    {usersAtNode.map(user => (
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
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      
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

  // Render delivery paths
  const renderPaths = () => {
    if (!selectedOrder) return null;

    const order = selectedOrder;
    const path = order.path || [];

    if (path.length < 2) return null;

    const pathNodes = path.map(nodeId => 
      graph.nodes.find(n => n.id === nodeId)
    ).filter(Boolean);

    const positions = pathNodes.map(node => [node.latitude, node.longitude]);

    return (
      <Polyline
        positions={positions}
        color="blue"
        weight={3}
        opacity={0.8}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {renderNodes()}
        {renderEdges()}
        {renderPaths()}
        
        <MapUpdater center={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default MapView; 