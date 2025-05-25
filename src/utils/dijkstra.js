
export const findShortestPath = (graph, startNodeId, endNodeId) => {
  if (!graph.nodes.find((n) => n.id === startNodeId) || !graph.nodes.find((n) => n.id === endNodeId)) {
    return { path: [], distance: 0, estimatedTime: 0 };
  }

  const adjacencyList = createAdjacencyList(graph);
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  graph.nodes.forEach((node) => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  while (unvisited.size > 0) {
    let currentNode = null;
    let smallestDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        currentNode = nodeId;
      }
    }

    if (currentNode === null || currentNode === endNodeId || smallestDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNode);

    const neighbors = adjacencyList[currentNode] || [];
    for (const { node: neighborId, weight } of neighbors) {
      if (unvisited.has(neighborId)) {
        const tentativeDistance = distances[currentNode] + weight;
        
        if (tentativeDistance < distances[neighborId]) {
          distances[neighborId] = tentativeDistance;
          previous[neighborId] = currentNode;
        }
      }
    }
  }

  const path = [];
  let current = endNodeId;

  if (previous[endNodeId] === null && startNodeId !== endNodeId) {
    return { path: [], distance: 0, estimatedTime: 0 };
  }

  path.push(current);

  while (current !== startNodeId) {
    if (previous[current] === null) break;
    current = previous[current];
    path.unshift(current);
  }

  const distance = distances[endNodeId];
  const estimatedTime = distance !== Infinity ? Math.round((distance / 10) * 60) : 0;

  return {
    path,
    distance: distance !== Infinity ? distance : 0,
    estimatedTime,
  };
};


export const findShortestPathWithRouting = async (graph, startNodeId, endNodeId) => {
  const pathResult = findShortestPath(graph, startNodeId, endNodeId);
  
  if (pathResult.path.length === 0) {
    return { ...pathResult, routeGeometry: [] };
  }

  const routeGeometry = await getRouteGeometry(graph, pathResult.path);
  
  return {
    ...pathResult,
    routeGeometry,
  };
};


export const getRouteGeometry = async (graph, path) => {
  if (path.length < 2) return [];

  try {
    const pathNodes = path.map(nodeId => 
      graph.nodes.find(n => n.id === nodeId)
    ).filter(Boolean);

    const waypoints = pathNodes.map(node => 
      `${node.longitude},${node.latitude}`
    ).join(';');

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      }
    }
  } catch (error) {
    console.warn('Failed to get route geometry from OSRM, falling back to straight lines:', error);
  }

  return path.map(nodeId => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node ? [node.latitude, node.longitude] : null;
  }).filter(Boolean);
};

export const getRouteGeometryORS = async (graph, path, apiKey) => {
  if (path.length < 2) return [];

  try {
    const pathNodes = path.map(nodeId => 
      graph.nodes.find(n => n.id === nodeId)
    ).filter(Boolean);

    if (pathNodes.length < 2) return [];

    const startNode = pathNodes[0];
    const endNode = pathNodes[pathNodes.length - 1];

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startNode.longitude},${startNode.latitude}&end=${endNode.longitude},${endNode.latitude}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features[0] && data.features[0].geometry) {
        return data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      }
    }
  } catch (error) {
    console.warn('Failed to get route geometry from OpenRouteService, falling back to straight lines:', error);
  }

  return path.map(nodeId => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node ? [node.latitude, node.longitude] : null;
  }).filter(Boolean);
};


const createAdjacencyList = (graph) => {
  const adjacencyList = {};

  graph.nodes.forEach((node) => {
    adjacencyList[node.id] = [];
  });

  graph.edges.forEach((edge) => {
    if (edge.isBlocked) return;

    adjacencyList[edge.source].push({
      node: edge.target,
      weight: edge.weight,
    });
    
    adjacencyList[edge.target].push({
      node: edge.source,
      weight: edge.weight,
    });
  });

  return adjacencyList;
};

export const calculateDistance = (node1, node2) => {
  const R = 6371; 
  
  const lat1 = node1.latitude * Math.PI / 180;
  const lat2 = node2.latitude * Math.PI / 180;
  const lon1 = node1.longitude * Math.PI / 180;
  const lon2 = node2.longitude * Math.PI / 180;
  
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};