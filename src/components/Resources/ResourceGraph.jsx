import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Chip,
  useTheme,
  Button,
  Tooltip,
  Alert
} from '@mui/material';
import { ResourceStatus } from '../../services/resourceService';
import { useColorMode } from '../../theme/ThemeProvider';

// This is a custom simple graph visualization component
// For production use, consider using react-force-graph or react-d3-graph
const ResourceGraph = ({ resources, filteredResources, resourceTypes, onResourceSelect }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useColorMode();
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Colors based on mode
  const colors = {
    background: mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
    nodeStroke: mode === 'dark' ? '#fff' : '#000',
    textColor: mode === 'dark' ? '#fff' : '#000',
    edgeColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    nodeBackgrounds: {
      [ResourceStatus.ACTIVE]: mode === 'dark' ? '#2e7d32' : '#4caf50',
      [ResourceStatus.MAINTENANCE]: mode === 'dark' ? '#ed6c02' : '#ff9800',
      [ResourceStatus.UNAVAILABLE]: mode === 'dark' ? '#d32f2f' : '#f44336',
      default: mode === 'dark' ? '#424242' : '#9e9e9e'
    }
  };

  // Prepare graph data whenever resources change
  useEffect(() => {
    // Prepare nodes (visible resources)
    const graphNodes = filteredResources.map(resource => {
      // Find resource type
      const resourceType = resourceTypes.find(type => type.id === resource.typeId);
      
      return {
        id: resource.id,
        name: resource.name,
        status: resource.status,
        typeId: resource.typeId,
        typeName: resourceType ? resourceType.name : t('resourceExplorer.unknownType'),
        typeColor: resourceType ? resourceType.color : '#808080',
        parentId: resource.parentId,
        resource: resource, // Store the full resource for later use
        // Dynamic positioning will be calculated during render
        x: 0,
        y: 0,
        radius: 30, // Default node size
        highlighted: false // For hover effect
      };
    });

    // Prepare edges (connections between resources)
    const graphEdges = [];
    filteredResources.forEach(resource => {
      if (resource.parentId) {
        // Only add edge if the parent is in the filtered resources
        const parentExists = filteredResources.some(r => r.id === resource.parentId);
        if (parentExists) {
          graphEdges.push({
            source: resource.parentId,
            target: resource.id,
            type: 'parent-child'
          });
        }
      }
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [filteredResources, resourceTypes, t]);

  // Reset view
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Handle zoom
  const handleZoom = (factor) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      // Limit zoom level
      return Math.min(Math.max(0.5, newScale), 3);
    });
  };

  // Render graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Position nodes in a force-directed layout simulation
    // For simplicity, we'll use a basic circular layout
    const calculateNodePositions = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.4;
      
      // Position parent nodes in a circle
      const parentNodes = nodes.filter(node => !node.parentId);
      parentNodes.forEach((node, i) => {
        const angle = (i / parentNodes.length) * 2 * Math.PI;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      });
      
      // Position child nodes near their parents
      nodes.forEach(node => {
        if (node.parentId) {
          const parent = nodes.find(n => n.id === node.parentId);
          if (parent) {
            // Find siblings (nodes with same parent)
            const siblings = nodes.filter(n => n.parentId === parent.id);
            const siblingIndex = siblings.findIndex(n => n.id === node.id);
            const siblingCount = siblings.length;
            
            // Arrange siblings in a semi-circle around their parent
            const angle = ((siblingIndex + 1) / (siblingCount + 1)) * Math.PI - Math.PI / 2;
            const distance = 80 + 20 * Math.sin(siblingIndex); // Vary distance slightly
            
            node.x = parent.x + distance * Math.cos(angle);
            node.y = parent.y + distance * Math.sin(angle);
          } else {
            // Fallback if parent not found
            const randomAngle = Math.random() * 2 * Math.PI;
            node.x = centerX + (radius * 0.5) * Math.cos(randomAngle);
            node.y = centerY + (radius * 0.5) * Math.sin(randomAngle);
          }
        }
      });
    };

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate node positions
    calculateNodePositions();

    // Apply scale and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw edges
    ctx.strokeStyle = colors.edgeColor;
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const source = nodes.find(node => node.id === edge.source);
      const target = nodes.find(node => node.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        
        // Draw curved lines for better visualization
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const curveFactor = 30;
        
        // Calculate control point for the curve
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const normalX = -dy;
        const normalY = dx;
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
        const controlX = midX + (normalX / normalLength) * curveFactor;
        const controlY = midY + (normalY / normalLength) * curveFactor;
        
        // Draw quadratic curve
        ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
        ctx.stroke();
        
        // Draw arrow at the end
        const arrowSize = 8;
        const angle = Math.atan2(target.y - controlY, target.x - controlX);
        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-arrowSize, -arrowSize / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowSize, arrowSize / 2);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.highlighted ? node.radius + 5 : node.radius, 0, 2 * Math.PI);
      
      // Fill with status-based color
      ctx.fillStyle = colors.nodeBackgrounds[node.status] || colors.nodeBackgrounds.default;
      ctx.fill();
      
      // Add border with type color
      ctx.strokeStyle = node.typeColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = colors.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillText(node.name, node.x, node.y);
      
      // Add highlight effect if hovered
      if (node.highlighted) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = theme.palette.primary.main;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Restore canvas context
    ctx.restore();
  }, [nodes, edges, hoveredNode, scale, offset, theme, colors, mode]);

  // Handle mouse interactions
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust for scale and offset
    const adjustedX = (mouseX - offset.x) / scale;
    const adjustedY = (mouseY - offset.y) / scale;
    
    // Check if mouse is over any node
    let hoveredNodeFound = false;
    
    nodes.forEach(node => {
      const distance = Math.sqrt(
        Math.pow(adjustedX - node.x, 2) + 
        Math.pow(adjustedY - node.y, 2)
      );
      
      // Update highlighted state
      if (distance <= node.radius) {
        hoveredNodeFound = true;
        node.highlighted = true;
        setHoveredNode(node);
      } else {
        node.highlighted = false;
      }
    });
    
    if (!hoveredNodeFound) {
      setHoveredNode(null);
    }
    
    // Handle dragging
    if (isDragging) {
      setOffset({
        x: offset.x + (e.clientX - dragStart.x),
        y: offset.y + (e.clientY - dragStart.y)
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e) => {
    // Only start dragging on middle mouse button or right mouse button
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    // If left mouse button and over a node, select that resource
    if (e.button === 0 && hoveredNode) {
      onResourceSelect(hoveredNode.resource);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent context menu
  };

  // Handle wheel event for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    handleZoom(zoomFactor);
  };

  return (
    <Box>
      {filteredResources.length > 0 ? (
        <Box sx={{ position: 'relative', width: '100%', height: 600, bgcolor: colors.background }}>
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 1 }}>
            <Tooltip title={t('resourceExplorer.zoomIn')}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleZoom(1.2)}
              >
                +
              </Button>
            </Tooltip>
            <Tooltip title={t('resourceExplorer.zoomOut')}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleZoom(0.8)}
              >
                -
              </Button>
            </Tooltip>
            <Tooltip title={t('resourceExplorer.resetView')}>
              <Button
                variant="contained"
                size="small"
                onClick={resetView}
              >
                {t('resourceExplorer.reset')}
              </Button>
            </Tooltip>
          </Box>
          
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%' }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            onWheel={handleWheel}
          />
          
          {/* Tooltip for hovered node */}
          {hoveredNode && (
            <Box
              sx={{
                position: 'absolute',
                top: hoveredNode.y * scale + offset.y + 40,
                left: hoveredNode.x * scale + offset.x,
                transform: 'translateX(-50%)',
                bgcolor: 'background.paper',
                boxShadow: 3,
                p: 1,
                borderRadius: 1,
                zIndex: 20,
                maxWidth: 220
              }}
            >
              <Typography variant="subtitle2">{hoveredNode.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {hoveredNode.typeName}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={t(`resourceExplorer.${hoveredNode.status.toLowerCase()}`)}
                  size="small"
                  color={
                    hoveredNode.status === ResourceStatus.ACTIVE ? 'success' :
                    hoveredNode.status === ResourceStatus.MAINTENANCE ? 'warning' :
                    'error'
                  }
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {t('resourceExplorer.clickToViewDetails')}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('resourceExplorer.noResourcesForGraph')}
          </Typography>
        </Paper>
      )}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          {t('resourceExplorer.graphInstructions')}
        </Typography>
      </Alert>
    </Box>
  );
};

export default ResourceGraph;