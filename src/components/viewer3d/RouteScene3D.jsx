import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { formatElevation, formatSlope, formatDistance } from '../../utils/formatters';

export function RouteScene3D({ calculatedRoute, hoveredPoint, onHoverPoint }) {
  if (!calculatedRoute || !calculatedRoute.waypoints || calculatedRoute.waypoints.length < 2) {
    return null;
  }

  const waypoints = calculatedRoute.waypoints;

  // Normalizar coordenadas centradas en (0,0) para escala Three.js
  const { normalizedPoints, center, elevMin, elevMax } = useMemo(() => {
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let minE = Infinity, maxE = -Infinity;

    waypoints.forEach((w) => {
      if (w.lat < minLat) minLat = w.lat;
      if (w.lat > maxLat) maxLat = w.lat;
      if (w.lng < minLng) minLng = w.lng;
      if (w.lng > maxLng) maxLng = w.lng;
      if (w.elevation < minE) minE = w.elevation;
      if (w.elevation > maxE) maxE = w.elevation;
    });

    const cLat = (minLat + maxLat) / 2;
    const cLng = (minLng + maxLng) / 2;

    // Escala espacial: 1 unidad Three.js ~ 200m
    const scaleFactor = 1500;
    const elevScale = 0.05; // Escala exagerada suave para visualización clara de desniveles

    const pts = waypoints.map((w, idx) => {
      const x = (w.lng - cLng) * scaleFactor;
      const z = -(w.lat - cLat) * scaleFactor;
      const y = (w.elevation - minE) * elevScale;
      return {
        pos: new THREE.Vector3(x, y, z),
        basePos: new THREE.Vector3(x, 0, z),
        original: w,
      };
    });

    return {
      normalizedPoints: pts,
      center: new THREE.Vector3(0, 0, 0),
      elevMin: minE,
      elevMax: maxE,
    };
  }, [waypoints]);

  // Posición del punto en hover si existe
  const hovered3DPos = useMemo(() => {
    if (!hoveredPoint) return null;
    const found = normalizedPoints.find(
      (p) => Math.abs(p.original.lat - hoveredPoint.lat) < 0.0001 && Math.abs(p.original.lng - hoveredPoint.lng) < 0.0001
    );
    return found ? found.pos : null;
  }, [hoveredPoint, normalizedPoints]);

  const pStart = normalizedPoints[0];
  const pEnd = normalizedPoints[normalizedPoints.length - 1];

  // Geometría del Muro de Terreno / Cortina de Elevación (Bedrock Curtain)
  const curtainGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const colSafe = new THREE.Color('#30D158');
    const colMod = new THREE.Color('#FF9F0A');
    const colDanger = new THREE.Color('#FF453A');
    const colBase = new THREE.Color('#1D1D1F');

    for (let i = 0; i < normalizedPoints.length - 1; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[i + 1];

      // Determinar color por pendiente
      const slope = p2.original.slopeDegrees;
      const topCol = slope > 20 ? colDanger : slope > 12 ? colMod : colSafe;

      // Triángulo 1: Top1, Base1, Top2
      positions.push(p1.pos.x, p1.pos.y, p1.pos.z);
      colors.push(topCol.r, topCol.g, topCol.b);

      positions.push(p1.basePos.x, p1.basePos.y, p1.basePos.z);
      colors.push(colBase.r, colBase.g, colBase.b);

      positions.push(p2.pos.x, p2.pos.y, p2.pos.z);
      colors.push(topCol.r, topCol.g, topCol.b);

      // Triángulo 2: Top2, Base1, Base2
      positions.push(p2.pos.x, p2.pos.y, p2.pos.z);
      colors.push(topCol.r, topCol.g, topCol.b);

      positions.push(p1.basePos.x, p1.basePos.y, p1.basePos.z);
      colors.push(colBase.r, colBase.g, colBase.b);

      positions.push(p2.basePos.x, p2.basePos.y, p2.basePos.z);
      colors.push(colBase.r, colBase.g, colBase.b);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, [normalizedPoints]);

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2 - 0.05} // No pasar por debajo del suelo
      />

      {/* Iluminación estilo Sol marciano */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[15, 30, 20]} intensity={1.4} color="#FFF2E0" castShadow />
      <pointLight position={[-20, 10, -20]} intensity={0.4} color="#C1440E" />

      {/* Grilla de referencia táctica en base */}
      <gridHelper
        args={[100, 30, '#0071E3', 'rgba(255,255,255,0.06)']}
        position={[0, 0, 0]}
      />

      {/* Muro / Cortina de Terreno Tridimensional */}
      <mesh geometry={curtainGeometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.75}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Segmentos de Línea 3D con colores de pendiente */}
      {normalizedPoints.map((pt, idx) => {
        if (idx === normalizedPoints.length - 1) return null;
        const next = normalizedPoints[idx + 1];
        const slope = next.original.slopeDegrees;
        const color = slope > 20 ? '#FF453A' : slope > 12 ? '#FF9F0A' : '#30D158';

        return (
          <group key={idx}>
            <Line
              points={[pt.pos, next.pos]}
              color={color}
              lineWidth={4.5}
            />
            {/* Esferas de nodo interactivas para clic o hover */}
            <mesh
              position={pt.pos}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (onHoverPoint) onHoverPoint(pt.original);
              }}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}

      {/* Marcador Punto A (Partida) */}
      <group position={pStart.pos}>
        <mesh>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#30D158" emissive="#30D158" emissiveIntensity={0.6} />
        </mesh>
        <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -pStart.pos.y, 0)]} color="#30D158" lineWidth={1.5} dashed />
        <Billboard position={[0, 1.2, 0]}>
          <Html center distanceFactor={14}>
            <div className="bg-[#1D1D1F]/90 backdrop-blur-md border border-[#30D158]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#30D158] whitespace-nowrap shadow-lg flex items-center gap-1.5">
              <img src="/logo-geotrend.png" className="w-3.5 h-3.5 object-contain" alt="" />
              <span>PARTIDA (A)</span>
            </div>
          </Html>
        </Billboard>
      </group>

      {/* Marcador Punto B (Llegada) */}
      <group position={pEnd.pos}>
        <mesh>
          <sphereGeometry args={[0.65, 16, 16]} />
          <meshStandardMaterial color="#0071E3" emissive="#0071E3" emissiveIntensity={0.8} />
        </mesh>
        <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -pEnd.pos.y, 0)]} color="#0071E3" lineWidth={1.5} dashed />
        <Billboard position={[0, 1.3, 0]}>
          <Html center distanceFactor={14}>
            <div className="bg-[#1D1D1F]/90 backdrop-blur-md border border-[#0071E3]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#0071E3] whitespace-nowrap shadow-lg flex items-center gap-1.5">
              <img src="/logo-geotrend.png" className="w-3.5 h-3.5 object-contain" alt="" />
              <span>DESTINO (B)</span>
            </div>
          </Html>
        </Billboard>
      </group>

      {/* Cursor 3D en Hover */}
      {hovered3DPos && hoveredPoint && (
        <group position={hovered3DPos}>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#FF9F0A" emissive="#FF9F0A" emissiveIntensity={1} />
          </mesh>
          <Billboard position={[0, 1.6, 0]}>
            <Html center distanceFactor={15}>
              <div className="bg-[#1D1D1F]/95 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-2xl text-[11px] text-[#F5F5F7] whitespace-nowrap shadow-2xl space-y-0.5">
                <div className="font-semibold text-[#FF9F0A]">
                  Elevación: {formatElevation(hoveredPoint.elevation)}
                </div>
                <div className="text-[10px] text-[#86868B]">
                  Pendiente: {formatSlope(hoveredPoint.slopeDegrees || 0)}
                </div>
              </div>
            </Html>
          </Billboard>
        </group>
      )}
    </>
  );
}
