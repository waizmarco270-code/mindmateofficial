
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2 } from 'lucide-react';

const locations = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
];

export function ActivityGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Use a fixed fallback height if clientHeight is 0 initially
    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 160; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // BIND CONTROLS ONLY TO CANVAS TO PREVENT SCROLL INTERFERENCE
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // Earth - Tactical Radius
    const radius = 60;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    
    // Reliable high-fidelity texture source
    const texture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', () => {
        setIsLoading(false);
    });
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 1.2,
      specular: new THREE.Color('#222'),
      shininess: 5
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Atmospheric Glow
    const atmoGeometry = new THREE.SphereGeometry(radius + 2, 64, 64);
    const atmoMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeometry, atmoMaterial);
    scene.add(atmo);

    // Data Points
    const latLngToVector3 = (lat: number, lng: number, r: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(r * Math.sin(phi) * Math.cos(theta));
        const z = (r * Math.sin(phi) * Math.sin(theta));
        const y = (r * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    };

    const pointsGroup = new THREE.Group();
    locations.forEach(loc => {
        const pos = latLngToVector3(loc.lat, loc.lng, radius + 0.5);
        const pointGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const point = new THREE.Mesh(pointGeo, pointMat);
        point.position.copy(pos);
        pointsGroup.add(point);
    });
    scene.add(pointsGroup);

    // Sovereign Satellite
    const satelliteGeo = new THREE.BoxGeometry(1, 1, 1);
    const satelliteMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const satellite = new THREE.Mesh(satelliteGeo, satelliteMat);
    scene.add(satellite);

    // Lights - Strategic Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dLight.position.set(5, 3, 5);
    scene.add(dLight);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      // Animate points pulse
      pointsGroup.children.forEach((point, i) => {
          const scale = 1 + Math.sin(time * 4 + i) * 0.3;
          point.scale.set(scale, scale, scale);
      });

      // Orbit satellite
      satellite.position.x = (radius + 15) * Math.cos(time * 0.4);
      satellite.position.z = (radius + 15) * Math.sin(time * 0.4);
      satellite.position.y = Math.sin(time * 0.3) * 8;
      satellite.rotation.y += 0.05;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} className="relative w-full h-[350px] sm:h-[500px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-black/5 border border-white/10">
      {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Synchronizing Planetary Pulse...</p>
          </div>
      )}
      
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 z-20">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Legends Tracking Active</p>
      </div>
    </div>
  );
}
