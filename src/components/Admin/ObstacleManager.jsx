import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { AlertTriangle } from 'lucide-react';

const ObstacleManager = () => {
  const { state, dispatch } = useAppContext();
  const { graph } = state;

  const handleToggleObstacle = (edgeId) => {
    dispatch({ type: 'TOGGLE_OBSTACLE', payload: { edgeId } });
  };

  // Get node name by ID
  const getNodeName = (nodeId) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node?.name || nodeId;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-auto">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
        <h2 className="text-lg font-semibold">Manage Obstacles</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Toggle roads as blocked or unblocked to simulate obstacles.
        This will automatically recalculate all delivery paths.
      </p>

      <div className="space-y-2">
        {graph.edges.map(edge => (
          <div
            key={edge.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">
                {getNodeName(edge.source)} → {getNodeName(edge.target)}
              </p>
              <p className="text-xs text-gray-500">
                Distance: {edge.weight} km
              </p>
            </div>
            <button
              className={`ml-4 px-3 py-1 rounded text-sm font-medium ${
                edge.isBlocked
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              onClick={() => handleToggleObstacle(edge.id)}
            >
              {edge.isBlocked ? 'Blocked' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObstacleManager; 