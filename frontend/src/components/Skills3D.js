import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const SKILLS = [
  "Python", "SQL", "Snowflake", "AWS", "PySpark", 
  "Tableau", "Airflow", "Docker", "Kafka", "Azure", 
  "Databricks", "Power BI", "React", "Terraform", "dbt"
];

const Word = ({ children, position }) => {
  const ref = useRef();
  useFrame(({ camera }) => {
    ref.current.quaternion.copy(camera.quaternion);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        ref={ref}
        position={position}
        fontSize={0.3} // Increased size
        color="#94a3b8"
        // REMOVED custom font prop to ensure it loads default font
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </Float>
  );
};

const Cloud = ({ radius = 4 }) => {
  const words = useMemo(() => {
    const temp = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < SKILLS.length; i++) {
      const y = 1 - (i / (SKILLS.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      temp.push([x * radius, y * radius, z * radius]);
    }
    return temp;
  }, [radius]);

  return (
    <group>
        <Float speed={1} floatIntensity={0.2}>
            <Text fontSize={0.7} color="#3b82f6" anchorX="center" anchorY="middle">
                CORE STACK
            </Text>
        </Float>
        {words.map((pos, i) => (
            <group key={i}>
                <Word position={pos}>{SKILLS[i]}</Word>
                <Line points={[[0,0,0], pos]} color="#3b82f6" lineWidth={0.5} transparent opacity={0.1} />
            </group>
        ))}
    </group>
  );
};

const Skills3D = () => {
  return (
    <div className="h-[60vh] w-full flex items-center justify-center relative pointer-events-none">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-20" />
        
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
            <fog attach="fog" args={['#0a0a0f', 5, 15]} />
            <ambientLight intensity={1} />
            <group rotation={[0, 0, 0]}>
                <Cloud radius={3.5} />
            </group>
            <OrbitingSystem />
        </Canvas>
    </div>
  );
};

const OrbitingSystem = () => {
    useFrame((state, delta) => {
        state.scene.rotation.y += delta * 0.1;
        state.scene.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    });
    return null;
}

export default Skills3D;
