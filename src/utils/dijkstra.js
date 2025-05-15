/**
 * Implementation of Dijkstra's algorithm to find the shortest path between two nodes
 * 
 * @param {Object} graph - The graph containing nodes and edges
 * @param {string} startNodeId - The ID of the starting node
 * @param {string} endNodeId - The ID of the ending node
 * @returns {Object} An object containing the path as an array of node IDs, the total distance, and estimated time
 */
export const findShortestPath = (graph, startNodeId, endNodeId) => {
  // Check if both nodes exist in the graph
  if (!graph.nodes.find((n) => n.id === startNodeId) || !graph.nodes.find((n) => n.id === endNodeId)) {
    return { path: [], distance: 0, estimatedTime: 0 };
  }

  // Create adjacency list from graph
  const adjacencyList = createAdjacencyList(graph);

  // Set initial distances to Infinity for all nodes except start node
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  graph.nodes.forEach((node) => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  // Process nodes until all are visited or we find the end node
  while (unvisited.size > 0) {
    // Find the node with the smallest distance
    let currentNode = null;
    let smallestDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        currentNode = nodeId;
      }
    }

    // If we can't find a node or reached the destination, we're done
    if (currentNode === null || currentNode === endNodeId || smallestDistance === Infinity) {
      break;
    }

    // Remove the current node from unvisited
    unvisited.delete(currentNode);

    // Check all neighbors of the current node
    const neighbors = adjacencyList[currentNode] || [];
    for (const { node: neighborId, weight } of neighbors) {
      // Only consider unvisited neighbors
      if (unvisited.has(neighborId)) {
        const tentativeDistance = distances[currentNode] + weight;
        
        // If we found a shorter path to the neighbor
        if (tentativeDistance < distances[neighborId]) {
          distances[neighborId] = tentativeDistance;
          previous[neighborId] = currentNode;
        }
      }
    }
  }

  // Reconstruct the path from end to start
  const path = [];
  let current = endNodeId;

  // If we couldn't reach the end node, return empty path
  if (previous[endNodeId] === null && startNodeId !== endNodeId) {
    return { path: [], distance: 0, estimatedTime: 0 };
  }

  // Add end node to path
  path.push(current);

  // Trace back the path
  while (current !== startNodeId) {
    if (previous[current] === null) break;
    current = previous[current];
    path.unshift(current);
  }

  // Calculate total distance and estimated time
  const distance = distances[endNodeId];
  // Assume speed of 10 km/h => Convert to minutes
  const estimatedTime = distance !== Infinity ? Math.round((distance / 10) * 60) : 0;

  return {
    path,
    distance: distance !== Infinity ? distance : 0,
    estimatedTime,
  };
};

/**
 * Creates an adjacency list from the graph
 */
const createAdjacencyList = (graph) => {
  const adjacencyList = {};

  // Initialize empty adjacency list for all nodes
  graph.nodes.forEach((node) => {
    adjacencyList[node.id] = [];
  });

  // Add edges to adjacency list (graph is undirected)
  graph.edges.forEach((edge) => {
    // Skip blocked edges
    if (edge.isBlocked) return;

    // Add in both directions since the graph is undirected
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

/**
 * Calculate the straight-line distance (as the crow flies) between two nodes
 * using the Haversine formula for distances on Earth's surface
 */
export const calculateDistance = (node1, node2) => {
  const R = 6371; // Earth's radius in km
  
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