import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface NodeData {
  id: string;
  type: 'problem' | 'hypothesis' | 'fact' | 'test';
  label: string;
  probability?: number;
  details?: string;
  parentId?: string; // For orbital mechanics
}

interface ConstellationProps {
  nodes: NodeData[];
  onNodeClick?: (node: NodeData) => void;
}

const Node = ({ node, position, color, size, onClick }: { node: NodeData; position: THREE.Vector3; color: string; size: number; onClick?: (node: NodeData) => void }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Star Twinkle Effect for Problems
      if (node.type === 'problem') {
        const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.05;
        mesh.current.scale.set(pulse, pulse, pulse);
        if (mesh.current.material instanceof THREE.MeshStandardMaterial) {
          mesh.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.getElapsedTime() * 5) * 0.3;
        }
      }

      // Pulse effect for hypotheses based on probability
      if (node.type === 'hypothesis' && node.probability) {
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1 * node.probability;
        mesh.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(node);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap border border-white/20 backdrop-blur-md">
            <strong>{node.label}</strong>
            {node.probability && <div className="text-gray-300">Prob: {(node.probability * 100).toFixed(0)}%</div>}
            {node.details && <div className="text-gray-400 italic max-w-xs">{node.details}</div>}
          </div>
        </Html>
      )}
      {!hovered && (
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {node.label}
        </Text>
      )}
    </group>
  );
};

const ConnectionLine = ({ start, end, color = '#ffffff', opacity = 0.2 }: { start: THREE.Vector3; end: THREE.Vector3; color?: string; opacity?: number }) => {
  const points = useMemo(() => [start, end], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial attach="material" color={color} transparent opacity={opacity} />
    </line>
  );
};

const DataParticles = ({ count = 500 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 40;
      p[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#6366f1" transparent opacity={0.4} />
    </points>
  );
};

export default function MedicalConstellation({ nodes, onNodeClick }: ConstellationProps) {
  // Calculate positions based on relationships
  const { layout, connections } = useMemo(() => {
    const nodePositions = new Map<string, THREE.Vector3>();
    const links: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];

    // 1. Find the central problem(s)
    const problems = nodes.filter(n => n.type === 'problem');
    problems.forEach((p, idx) => {
      // Place problem at center (or offset if multiple)
      const offset = (idx - (problems.length - 1) / 2) * 5;
      const pos = new THREE.Vector3(offset, 0, 0);
      nodePositions.set(p.id, pos);
    });

    // 2. Place hypotheses in orbit around their parent problems
    const hypotheses = nodes.filter(n => n.type === 'hypothesis');
    hypotheses.forEach((h, i) => {
      const parentPos = h.parentId ? nodePositions.get(h.parentId) : new THREE.Vector3(0, 0, 0);
      if (!parentPos) return;

      // Distribute evenly on a sphere or ring
      const phi = Math.acos(-1 + (2 * i) / hypotheses.length);
      const theta = Math.sqrt(hypotheses.length * Math.PI) * phi;
      const radius = 8; // Orbit radius

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z).add(parentPos);
      nodePositions.set(h.id, pos);
      
      // Link to parent
      links.push({ start: parentPos, end: pos, color: '#6366f1' }); // Indigo line
    });

    // 3. Place facts/tests orbiting their related hypotheses or problems
    const facts = nodes.filter(n => n.type === 'fact' || n.type === 'test');
    facts.forEach((f, i) => {
      const parentPos = f.parentId ? nodePositions.get(f.parentId) : new THREE.Vector3(0, 0, 0);
      if (!parentPos) return;

      // Smaller orbit around the hypothesis
      const subRadius = 3;
      const angle = (i / facts.length) * Math.PI * 2;
      // Add some randomness to height
      const yOffset = (Math.random() - 0.5) * 2;
      
      const x = subRadius * Math.cos(angle);
      const z = subRadius * Math.sin(angle);
      
      const pos = new THREE.Vector3(x, yOffset, z).add(parentPos);
      nodePositions.set(f.id, pos);

      const color = f.type === 'test' ? '#10b981' : '#f59e0b'; // Green for tests, Amber for facts
      links.push({ start: parentPos, end: pos, color }); 
    });

    return { 
      layout: Array.from(nodePositions.entries()).map(([id, pos]) => ({ id, pos })),
      connections: links 
    };
  }, [nodes]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'problem': return '#ef4444'; // Red
      case 'hypothesis': return '#6366f1'; // Indigo
      case 'test': return '#10b981'; // Emerald
      case 'fact': return '#f59e0b'; // Amber
      default: return '#9ca3af';
    }
  };

  const getNodeSize = (type: string, probability?: number) => {
    switch (type) {
      case 'problem': return 1.5;
      case 'hypothesis': return 0.8 + (probability || 0) * 0.5; // Size scales with prob
      case 'test': return 0.4;
      case 'fact': return 0.3;
      default: return 0.5;
    }
  };

  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 10, 50]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <DataParticles count={1000} />
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={true} enableZoom={true} />

      <group>
        {connections.map((link, idx) => (
          <ConnectionLine key={idx} start={link.start} end={link.end} color={link.color} />
        ))}

        {layout.map(({ id, pos }) => {
          const nodeData = nodes.find(n => n.id === id);
          if (!nodeData) return null;
          return (
            <Node
              key={id}
              node={nodeData}
              position={pos}
              color={getNodeColor(nodeData.type)}
              size={getNodeSize(nodeData.type, nodeData.probability)}
              onClick={onNodeClick}
            />
          );
        })}
      </group>
    </Canvas>
  );
}
