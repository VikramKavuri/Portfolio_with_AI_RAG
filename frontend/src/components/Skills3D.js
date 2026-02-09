import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

// The Skill Data (Top 15 skills for the 3D view)
const SKILLS = [
  "Python", "SQL", "Snowflake", "AWS", "PySpark", 
  "Tableau", "Airflow", "Docker", "Kafka", "Azure", 
  "Databricks", "Power BI", "React", "Terraform", "dbt"
];

const Word = ({ children, position, color = "white" }) => {
  const ref = useRef();
  
  useFrame(({ camera }) => {
    // Make text always face the camera (Billboard effect)
    ref.current.quaternion.copy(camera.quaternion);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        ref={ref}
        position={position}
        fontSize={0.25} // Adjust for size
        color={color}
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff" // Standard font
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </Float>
  );
};

const Cloud = ({ radius = 4 }) => {
  // Create a spherical distribution of points (Fibonacci Sphere algorithm)
  const words = useMemo(() => {
    const temp = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < SKILLS.length; i++) {
      const y = 1 - (i / (SKILLS.length - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      temp.push([x * radius, y * radius, z * radius]);
    }
    return temp;
  }, [radius]);

  return (
    <group>
        {/* Central Core */}
        <Float speed={1} floatIntensity={0.2}>
            <Text fontSize={0.6} color="#3b82f6" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu72xKOzY.woff">
                CORE STACK
            </Text>
        </Float>

        {/* Orbiting Skills */}
        {words.map((pos, i) => (
            <group key={i}>
                <Word position={pos} color="#94a3b8">{SKILLS[i]}</Word>
                {/* Thin connection lines to center to simulate molecular structure */}
                <Line 
                    points={[[0,0,0], pos]} 
                    color="#3b82f6" 
                    lineWidth={0.5} 
                    transparent 
                    opacity={0.1} 
                />
            </group>
        ))}
    </group>
  );
};

const Skills3D = () => {
  return (
    <div className="h-[60vh] w-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-20" />
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
            <fog attach="fog" args={['#0a0a0f', 5, 15]} />
            <ambientLight intensity={0.5} />
            <group rotation={[0, 0, 0]}>
                <Cloud radius={3.5} />
            </group>
            {/* Auto-rotation wrapper */}
            <mesh rotation-y={0}>
                 <primitive object={new THREE.Group()} /> 
            </mesh>
            {/* Simple slow rotation script */}
            <OrbitingSystem />
        </Canvas>
    </div>
  );
};

// Component to handle the continuous rotation of the cloud
const OrbitingSystem = () => {
    useFrame((state, delta) => {
        state.scene.rotation.y += delta * 0.1; // Slow constant rotation
        state.scene.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1; // Gentle wobble
    });
    return null;
}

export default Skills3D;
