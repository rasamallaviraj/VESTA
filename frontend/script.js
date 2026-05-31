// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Initial setup to avoid FOUC on revealing elements
document.addEventListener("DOMContentLoaded", () => {
    // Reveal elements on scroll
    const revealElements = document.querySelectorAll(".gs-reveal");

    revealElements.forEach((el) => {
        gsap.fromTo(
            el,
            {
                y: 50,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Initialize ThreeJS Background
    initThreeJS();

    // Check Authentication on load
    checkAuth();
});

// Helper Functions
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer; margin-left:10px;">&times;</button>
    `;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

const setLoading = (btnId, isLoading) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');

    if (isLoading) {
        btn.disabled = true;
        if (text) text.style.display = 'none';
        if (loader) loader.style.display = 'inline-block';
    } else {
        btn.disabled = false;
        if (text) text.style.display = 'inline-block';
        if (loader) loader.style.display = 'none';
    }
};

// Three.js Background Animation
const initThreeJS = () => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.003);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
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

    const nodes = [];
    for (let i = 0; i < 60; i++) {
        const mesh = new THREE.Mesh(geometry, Math.random() > 0.5 ? materialPrimary : materialSecondary);
        mesh.position.set((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 60 - 20);
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        nodes.push({ mesh, rx: (Math.random() - 0.5) * 0.005, ry: (Math.random() - 0.5) * 0.005, yVel: (Math.random() * 0.02) + 0.005 });
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x4f46e5, 2, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    const animate = () => {
        requestAnimationFrame(animate);
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
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// Authentication Flow
window.toggleModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('active');
};

window.switchModal = (closeId, openId) => {
    document.getElementById(closeId).classList.remove('active');
    setTimeout(() => document.getElementById(openId).classList.add('active'), 300);
};

window.toggleAuthView = (view) => {
    const views = ['register', 'login', 'loggedIn'];
    views.forEach(v => document.getElementById(v + 'View').style.display = (v === view ? 'block' : 'none'));
};

window.handleAuth = async (event, type) => {
    event.preventDefault();
    const btnId = type === 'register' ? 'regBtn' : 'loginBtn';
    setLoading(btnId, true);

    const email = document.getElementById(type === 'register' ? 'regEmail' : 'loginEmail').value;
    const password = document.getElementById(type === 'register' ? 'regPassword' : 'loginPassword').value;
    const name = type === 'register' ? document.getElementById('regName').value : null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('vesta_token', data.token);
            localStorage.setItem('vesta_user', JSON.stringify(data));
            showToast(`${type === 'register' ? 'Account created' : 'Logged in'} successfully!`, 'success');
            updateUserUI(data);
            fetchDashboardData();
        } else {
            showToast(data.message || 'Authentication failed', 'error');
        }
    } catch (error) {
        showToast('Server connection error', 'error');
    } finally {
        setLoading(btnId, false);
    }
};

window.logout = () => {
    localStorage.removeItem('vesta_token');
    localStorage.removeItem('vesta_user');
    toggleAuthView('login');
    const authBtn = document.querySelector('.btn-auth');
    if (authBtn) authBtn.innerText = 'Login';
    showToast('Logged out successfully', 'info');
};

const updateUserUI = (user) => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const authBtn = document.querySelector('.btn-auth');

    if (user) {
        welcomeMessage.innerText = `Welcome, ${user.name.split(' ')[0]}!`;
        emailDisplay.innerText = user.email;
        if (authBtn) authBtn.innerText = 'Dashboard';
        toggleAuthView('loggedIn');
    } else {
        if (authBtn) authBtn.innerText = 'Login';
        toggleAuthView('login');
    }
};

const checkAuth = async () => {
    const token = localStorage.getItem('vesta_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            updateUserUI(data);
            fetchDashboardData();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Auth check failed');
    }
};

const fetchDashboardData = async () => {
    const token = localStorage.getItem('vesta_token');
    try {
        const response = await fetch(`${API_BASE_URL}/user/data`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('statUsers').innerText = data.stats.totalUsers;
            document.getElementById('statListings').innerText = data.stats.verifiedListings;
            document.getElementById('statConsults').innerText = data.stats.activeConsultations;
        }
    } catch (error) {
        console.error('Failed to fetch stats');
    }
};

// Contact Form Handler
window.handleContact = async (event) => {
    event.preventDefault();
    setLoading('contactBtn', true);

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        const data = await response.json();
        if (response.ok) {
            showToast('Message sent! Our experts will contact you soon.', 'success');
            event.target.reset();
        } else {
            showToast(data.message || 'Failed to send message', 'error');
        }
    } catch (error) {
        showToast('Server connection error', 'error');
    } finally {
        setLoading('contactBtn', false);
    }
};