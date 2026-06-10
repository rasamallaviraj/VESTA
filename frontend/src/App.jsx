import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import PropertyDetail from './pages/PropertyDetail';
import Learn from './pages/Learn';
import VestaAI from './pages/VestaAI';
import Experts from './pages/Experts';
import ExpertProfile from './pages/ExpertProfile';
import ListProperty from './pages/ListProperty';
import DashboardBuyer from './pages/DashboardBuyer';
import DashboardSeller from './pages/DashboardSeller';
import AdminListings from './pages/AdminListings';
import Compare from './pages/Compare';

// Shared Components
import Navbar from './components/Navbar';
import MeasurementConverter from './components/MeasurementConverter';
import CompareBar from './components/CompareBar';

const AppContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });

  // Redirect admin users to the admin panel automatically
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/listings');
    }
  }, [user]);

  // Floating Compare Handlers
  const handleToggleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleClearCompare = () => setCompareList([]);

  // Three.js Background particles
  useEffect(() => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    let scene, camera, renderer, nodes = [];
    let mouseX = 0, mouseY = 0;

    const init = () => {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.003);

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const materialPrimary = new THREE.MeshPhongMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      const materialSecondary = new THREE.MeshPhongMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      for (let i = 0; i < 60; i++) {
        const mesh = new THREE.Mesh(geometry, Math.random() > 0.5 ? materialPrimary : materialSecondary);
        mesh.position.set((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 60 - 20);
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        nodes.push({
          mesh,
          rx: (Math.random() - 0.5) * 0.005,
          ry: (Math.random() - 0.5) * 0.005,
          yVel: (Math.random() * 0.02) + 0.005
        });
      }

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0x4f46e5, 2, 100);
      pointLight.position.set(0, 0, 10);
      scene.add(pointLight);
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      if (!camera || !scene || !renderer) return;
      
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      nodes.forEach(n => {
        n.mesh.rotation.x += n.rx;
        n.mesh.rotation.y += n.ry;
        n.mesh.position.y += n.yVel;
        if (n.mesh.position.y > 60) n.mesh.position.y = -60;
      });

      renderer.render(scene, camera);
    };

    init();
    animate();

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <Navbar onOpenAuth={(view) => setAuthModal({ isOpen: true, view })} authModal={authModal} setAuthModal={setAuthModal} />
      
      <Routes>
        <Route path="/" element={<Home onOpenAuth={(view) => setAuthModal({ isOpen: true, view })} />} />
        <Route 
          path="/explore" 
          element={
            <Explore 
              compareList={compareList} 
              onToggleCompare={handleToggleCompare} 
            />
          } 
        />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/vesta-ai" element={<VestaAI />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/expert/:id" element={<ExpertProfile />} />
        <Route path="/list-property" element={<ListProperty />} />
        <Route path="/dashboard/buyer" element={<DashboardBuyer />} />
        <Route path="/dashboard/seller" element={<DashboardSeller />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/compare" element={<Compare compareList={compareList} onRemoveCompare={handleToggleCompare} onClear={handleClearCompare} />} />
      </Routes>

      {/* Global Widgets */}
      <MeasurementConverter />
      <CompareBar compareList={compareList} onClear={handleClearCompare} />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
