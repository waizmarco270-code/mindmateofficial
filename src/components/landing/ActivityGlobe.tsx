
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
];

export function ActivityGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 200; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // BIND CONTROLS ONLY TO CANVAS TO PREVENT SCROLL INTERFERENCE
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // Earth - Tactical Radius (60)
    const radius = 60;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    
    const texture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', () => {
        setIsLoading(false);
    });
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const specularMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 1.5,
      specularMap: specularMap,
      specular: new THREE.Color('grey'),
      shininess: 15
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Atmospheric Glow
    const atmoGeometry = new THREE.SphereGeometry(radius + 2, 64, 64);
    const atmoMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.1,
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
        const pos = latLngToVector3(loc.lat, loc.lng, radius + 1);
        const pointGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const point = new THREE.Mesh(pointGeo, pointMat);
        point.position.copy(pos);
        pointsGroup.add(point);
    });
    scene.add(pointsGroup);

    // Satellite Uplink
    const satelliteGeo = new THREE.BoxGeometry(2, 2, 2);
    const satelliteMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const satellite = new THREE.Mesh(satelliteGeo, satelliteMat);
    scene.add(satellite);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dLight.position.set(5, 3, 5);
    scene.add(dLight);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      // Animate points
      pointsGroup.children.forEach((point, i) => {
          const scale = 1 + Math.sin(time * 5 + i) * 0.3;
          point.scale.set(scale, scale, scale);
      });

      // Orbit satellite
      satellite.position.x = (radius + 20) * Math.cos(time * 0.5);
      satellite.position.z = (radius + 20) * Math.sin(time * 0.5);
      satellite.position.y = Math.sin(time * 0.5) * 10;
      satellite.rotation.y += 0.05;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="relative w-full h-[280px] sm:h-[350px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-black/5 border border-white/5 cursor-grab active:cursor-grabbing">
      {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Syncing Real World Data...</p>
          </div>
      )}
      
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 z-20">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Sovereign Presence</p>
      </div>
    </div>
  );
}
