import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const DataParticles = (props) => {
  const ref = useRef();
  // Generate 5000 random points in a sphere
  const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

  useFrame((state, delta) => {
    // Rotate the cloud continuously
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#3b82f6" // Tailwind blue-500
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <DataParticles />
        </Float>
      </Canvas>
    </div>
  );
};

export default Hero3D;
