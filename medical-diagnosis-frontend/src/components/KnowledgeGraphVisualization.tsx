import { useState } from 'react';
import { Network, TrendingUp, Activity, AlertCircle, Link as LinkIcon, Database } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'disease' | 'symptom' | 'treatment' | 'comorbidity' | 'risk-factor';
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  strength: number; // 0-1
}

interface KnowledgeGraphVisualizationProps {
  centerDiagnosis?: string;
}

export function KnowledgeGraphVisualization({ centerDiagnosis = 'Rheumatoid Arthritis' }: KnowledgeGraphVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate knowledge graph data
  const nodes: GraphNode[] = [
    // Central diagnosis
    { id: 'ra', label: 'Rheumatoid\nArthritis', type: 'disease', x: 400, y: 300 },
    
    // Symptoms
    { id: 'joint-pain', label: 'Joint Pain', type: 'symptom', x: 300, y: 150 },
    { id: 'morning-stiffness', label: 'Morning\nStiffness', type: 'symptom', x: 500, y: 150 },
    { id: 'fatigue', label: 'Fatigue', type: 'symptom', x: 200, y: 250 },
    { id: 'swelling', label: 'Joint\nSwelling', type: 'symptom', x: 600, y: 250 },
    
    // Treatments
    { id: 'methotrexate', label: 'Methotrexate', type: 'treatment', x: 300, y: 450 },
    { id: 'tnf-inhibitors', label: 'TNF\nInhibitors', type: 'treatment', x: 500, y: 450 },
    { id: 'nsaids', label: 'NSAIDs', type: 'treatment', x: 400, y: 500 },
    
    // Comorbidities
    { id: 'cardiovascular', label: 'Cardiovascular\nDisease', type: 'comorbidity', x: 150, y: 350 },
    { id: 'osteoporosis', label: 'Osteoporosis', type: 'comorbidity', x: 650, y: 350 },
    
    // Risk factors
    { id: 'smoking', label: 'Smoking', type: 'risk-factor', x: 250, y: 100 },
    { id: 'family-history', label: 'Family\nHistory', type: 'risk-factor', x: 550, y: 100 },
  ];

  const edges: GraphEdge[] = [
    // Disease to symptoms
    { from: 'ra', to: 'joint-pain', label: 'causes', strength: 0.95 },
    { from: 'ra', to: 'morning-stiffness', label: 'causes', strength: 0.90 },
    { from: 'ra', to: 'fatigue', label: 'causes', strength: 0.80 },
    { from: 'ra', to: 'swelling', label: 'causes', strength: 0.85 },
    
    // Disease to treatments
    { from: 'ra', to: 'methotrexate', label: 'treated by', strength: 0.85 },
    { from: 'ra', to: 'tnf-inhibitors', label: 'treated by', strength: 0.90 },
    { from: 'ra', to: 'nsaids', label: 'managed by', strength: 0.70 },
    
    // Disease to comorbidities
    { from: 'ra', to: 'cardiovascular', label: 'increases risk', strength: 0.75 },
    { from: 'ra', to: 'osteoporosis', label: 'increases risk', strength: 0.70 },
    
    // Risk factors to disease
    { from: 'smoking', to: 'ra', label: 'risk factor', strength: 0.80 },
    { from: 'family-history', to: 'ra', label: 'risk factor', strength: 0.75 },
  ];

  const getNodeColor = (type: string) => {
    const colors = {
      disease: 'from-red-500 to-pink-500',
      symptom: 'from-orange-500 to-amber-500',
      treatment: 'from-green-500 to-emerald-500',
      comorbidity: 'from-purple-500 to-violet-500',
      'risk-factor': 'from-blue-500 to-indigo-500',
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'disease': return AlertCircle;
      case 'symptom': return Activity;
      case 'treatment': return TrendingUp;
      case 'comorbidity': return Network;
      case 'risk-factor': return LinkIcon;
      default: return Database;
    }
  };

  const getNodeSize = (node: GraphNode) => {
    if (node.type === 'disease') return 'w-24 h-24';
    return 'w-20 h-20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 gradient-overlay-primary">
        <div className="flex items-center gap-3">
          <div className="glass-card-strong p-3 rounded-2xl">
            <Network className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Medical Knowledge Graph
            </h2>
            <p className="text-sm text-gray-600 mt-1">Interactive disease relationship visualization</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'disease', label: 'Disease' },
            { type: 'symptom', label: 'Symptom' },
            { type: 'treatment', label: 'Treatment' },
            { type: 'comorbidity', label: 'Comorbidity' },
            { type: 'risk-factor', label: 'Risk Factor' },
          ].map((item) => {
            const Icon = getNodeIcon(item.type);
            return (
              <div key={item.type} className="flex items-center gap-2 glass-card-subtle px-3 py-2 rounded-lg">
                <div className={`p-1 rounded bg-gradient-to-br ${getNodeColor(item.type)}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="glass-card p-6">
        <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl overflow-hidden">
          {/* SVG for edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge, idx) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              
              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isHighlighted ? 'rgba(99, 102, 241, 0.6)' : 'rgba(148, 163, 184, 0.3)'}
                    strokeWidth={isHighlighted ? '3' : '2'}
                    strokeDasharray={edge.strength < 0.8 ? '5,5' : 'none'}
                    className="transition-all duration-300"
                  />
                  {/* Edge label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2}
                    fill="rgba(71, 85, 105, 0.7)"
                    fontSize="10"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const isConnected = edges.some(e => 
              (e.from === node.id && hoveredNode === e.to) || 
              (e.to === node.id && hoveredNode === e.from)
            );
            
            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getNodeSize(node)} cursor-pointer transition-all duration-300 ${
                  isHovered || isSelected ? 'scale-110 z-20' : isConnected ? 'scale-105 z-10' : 'z-0'
                }`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node.id === selectedNode?.id ? null : node)}
              >
                <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${getNodeColor(node.type)} shadow-lg flex flex-col items-center justify-center p-2 ${
                  isHovered || isSelected ? 'shadow-2xl' : ''
                }`}>
                  <Icon className="h-6 w-6 text-white mb-1" />
                  <span className="text-xs font-bold text-white text-center leading-tight whitespace-pre-line">
                    {node.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="glass-card p-6 animate-in">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getNodeColor(selectedNode.type)} flex-shrink-0`}>
              {(() => {
                const Icon = getNodeIcon(selectedNode.type);
                return <Icon className="h-8 w-8 text-white" />;
              })()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedNode.label.replace('\n', ' ')}</h3>
              <span className="glass-badge text-xs mb-3 inline-block">
                {selectedNode.type.replace('-', ' ')}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Connections */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Connected To:</h4>
                  <div className="space-y-2">
                    {edges
                      .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
                      .map((edge, idx) => {
                        const connectedId = edge.from === selectedNode.id ? edge.to : edge.from;
                        const connectedNode = nodes.find(n => n.id === connectedId);
                        if (!connectedNode) return null;
                        
                        return (
                          <div key={idx} className="glass-card-subtle p-2 rounded-lg text-sm flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getNodeColor(connectedNode.type)}`} />
                            <span className="text-gray-700">{connectedNode.label.replace('\n', ' ')}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Relationship Strengths */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Relationship Strengths:</h4>
                  <div className="space-y-2">
                    {edges
                      .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
                      .map((edge, idx) => (
                        <div key={idx} className="glass-card-subtle p-2 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-700">{edge.label}</span>
                            <span className="text-xs font-bold text-indigo-600">
                              {(edge.strength * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="glass-card-subtle rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${edge.strength * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="glass-badge-critical p-2 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{nodes.filter(n => n.type === 'disease').length}</p>
              <p className="text-xs text-gray-600">Diseases</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="glass-badge-warning p-2 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{nodes.filter(n => n.type === 'symptom').length}</p>
              <p className="text-xs text-gray-600">Symptoms</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="glass-badge-stable p-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{nodes.filter(n => n.type === 'treatment').length}</p>
              <p className="text-xs text-gray-600">Treatments</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="glass-badge-info p-2 rounded-lg">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{edges.length}</p>
              <p className="text-xs text-gray-600">Relationships</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}