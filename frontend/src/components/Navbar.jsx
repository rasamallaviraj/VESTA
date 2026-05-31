import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, ChevronRight, Menu, X } from 'lucide-react';

const Navbar = ({ onOpenAuth, authModal, setAuthModal }) => {
  const { user, logout, notifications, markAllNotificationsRead } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auth Modal Forms states
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER', // Default
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Add scrolled class to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowDropdown(false);
  }, [location]);

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      let res;
      if (type === 'login') {
        res = await login(authForm.email, authForm.password, authForm.role);
      } else {
        res = await register(authForm.name, authForm.email, authForm.password, authForm.role);
      }

      if (res.success) {
        setAuthModal({ isOpen: false, view: 'login' });
        // Redirect based on role
        if (res.user.role === 'SELLER') {
          navigate('/dashboard/seller');
        } else if (res.user.role === 'ADMIN') {
          navigate('/admin/listings');
        } else {
          navigate('/dashboard/buyer');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setAuthLoading(true);
    setTimeout(() => {
      // Mock Google Login
      const mockGoogleUser = {
        success: true,
        user: {
          id: 'g-uid-' + Math.random().toString(36).substr(2, 9),
          name: 'Viraj Mallav',
          email: authForm.email || 'viraj@google.com',
          role: authForm.role,
          token: 'google-oauth-token-123'
        }
      };
      localStorage.setItem('vesta_token', mockGoogleUser.user.token);
      localStorage.setItem('vesta_user', JSON.stringify(mockGoogleUser.user));
      setAuthModal({ isOpen: false, view: 'login' });
      navigate(mockGoogleUser.user.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer');
      setAuthLoading(false);
    }, 1000);
  };

  const handlePortalSwitch = (role) => {
    setAuthForm(prev => ({ ...prev, role }));
    setAuthModal(prev => ({ ...prev, view: role === 'BUYER' ? 'buyerPortal' : 'sellerPortal' }));
  };

  const { login, register } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar" style={{ background: scrolled ? 'rgba(5, 5, 5, 0.85)' : 'transparent' }}>
        <div className="logo">
          <Link to="/" className="logo-text" style={{ textDecoration: 'none' }}>VESTA</Link>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link to="/explore">Explore Lands</Link>
          <Link to="/vesta-ai">AI Review & Calculation</Link>
          <Link to="/experts">Expert Consultation</Link>
          <Link to="/learn">Knowledge Hub</Link>

          {user && user.role === 'SELLER' && (
            <Link to="/list-property" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              List Your Property
            </Link>
          )}

          {/* User Logged In Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
              
              {/* Notifications Icon */}
              <button 
                className="social-icon" 
                style={{ position: 'relative', width: '38px', height: '38px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                  if (!showNotifications) markAllNotificationsRead();
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '18px',
                    height: '18px',
                    background: 'var(--accent-error)',
                    borderRadius: '50%',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>{unreadCount}</span>
                )}
              </button>

              {/* User Dropdown Trigger */}
              <button 
                className="btn btn-outline btn-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
              >
                <User size={14} />
                <span>{user.name.split(' ')[0]}</span>
              </button>

              {/* Dropdown Panel */}
              {showDropdown && (
                <div className="glass" style={{
                  position: 'absolute',
                  top: '120%',
                  right: '0',
                  width: '200px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ROLE: {user.role}</div>
                  
                  <Link 
                    to={user.role === 'SELLER' ? '/dashboard/seller' : user.role === 'ADMIN' ? '/admin/listings' : '/dashboard/buyer'}
                    className="btn btn-primary btn-sm text-center"
                    style={{ textDecoration: 'none' }}
                  >
                    Go Dashboard
                  </Link>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="glass" style={{
                  position: 'absolute',
                  top: '120%',
                  right: '0',
                  width: '320px',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '1.25rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        fontSize: '0.85rem',
                        padding: '8px',
                        borderLeft: `3px solid ${n.type === 'error' ? 'var(--accent-error)' : 'var(--accent-secondary)'}`,
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '4px'
                      }}>
                        <div style={{ color: 'var(--text-primary)' }}>{n.text}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          ) : (
            <button className="btn btn-outline btn-auth" onClick={() => setAuthModal({ isOpen: true, view: 'login' })}>Login</button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass" style={{
          position: 'fixed',
          top: '80px',
          left: '5%',
          width: '90%',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>Explore Lands</Link>
          <Link to="/vesta-ai" onClick={() => setMobileMenuOpen(false)}>AI Review & Calculation</Link>
          <Link to="/experts" onClick={() => setMobileMenuOpen(false)}>Expert Consultation</Link>
          <Link to="/learn" onClick={() => setMobileMenuOpen(false)}>Knowledge Hub</Link>
          
          {user && user.role === 'SELLER' && (
            <Link to="/list-property" className="btn btn-secondary btn-sm text-center" style={{ textDecoration: 'none' }}>
              List Your Property
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.9rem' }}>Signed in as: **{user.name}**</div>
              <Link 
                to={user.role === 'SELLER' ? '/dashboard/seller' : user.role === 'ADMIN' ? '/admin/listings' : '/dashboard/buyer'}
                className="btn btn-primary text-center"
                style={{ textDecoration: 'none' }}
              >
                Go to Dashboard
              </Link>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="btn btn-primary w-100" onClick={() => { setMobileMenuOpen(false); setAuthModal({ isOpen: true, view: 'login' }); }}>Login</button>
          )}
        </div>
      )}

      {/* Dynamic Authentication Modal Overlay */}
      {authModal.isOpen && (
        <div className="modal-overlay active" onClick={() => setAuthModal({ isOpen: false, view: 'login' })}>
          <div className="modal-content glass auth-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'rgba(15, 15, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button className="modal-close" onClick={() => setAuthModal({ isOpen: false, view: 'login' })}>&times;</button>
            
            {/* View 1: Login Select */}
            {authModal.view === 'login' && (
              <div>
                <h2 className="text-center mb-4 text-gradient">Login to VESTA</h2>
                
                {authError && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>{authError}</div>}

                <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'login')}>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                  
                  <div className="form-group">
                    <label>Select Workspace Portal</label>
                    <select 
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    >
                      <option value="BUYER">Buyer Portal Access</option>
                      <option value="SELLER">Seller Portal Access</option>
                      <option value="ADMIN">Admin Console Access</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-2" disabled={authLoading}>
                    {authLoading ? 'Signing In...' : 'Access Portal'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-outline w-100" 
                    onClick={handleGoogleSignIn} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.73 0 3.32.63 4.56 1.77l2.42-2.42C17.29 1.77 14.92 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.79 0 10.24-4.11 10.24-10.24 0-.69-.08-1.35-.22-1.95H12.24z"/></svg>
                    <span>Sign in with Google</span>
                  </button>
                </form>

                <div className="btn-group mt-4" style={{ justifyContent: 'center', fontSize: '0.9rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handlePortalSwitch('BUYER')}>Buyer Portal Info</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handlePortalSwitch('SELLER')}>Seller Portal Info</button>
                </div>

                <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <a href="#" style={{ color: 'var(--accent-secondary)' }} onClick={() => setAuthModal({ ...authModal, view: 'register' })}>Sign Up</a>
                </p>
              </div>
            )}

            {/* View 2: Register Select */}
            {authModal.view === 'register' && (
              <div>
                <h2 className="text-center mb-4 text-gradient">Create Account</h2>
                
                {authError && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>{authError}</div>}

                <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'register')}>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />

                  <div className="form-group">
                    <label>Registration Track</label>
                    <select 
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    >
                      <option value="BUYER">Register as Buyer</option>
                      <option value="SELLER">Register as Seller</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-2" disabled={authLoading}>
                    {authLoading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>
                
                <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <a href="#" style={{ color: 'var(--accent-secondary)' }} onClick={() => setAuthModal({ ...authModal, view: 'login' })}>Login</a>
                </p>
              </div>
            )}

            {/* View 3: Buyer Portal Preview Modal */}
            {authModal.view === 'buyerPortal' && (
              <div>
                <h2 className="text-gradient mb-4">Buyer Portal Overview</h2>
                <p className="mb-4" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Welcome to your ultimate land purchasing superpower! As an authenticated buyer, you will access:</p>
                <ul className="power-list" style={{ margin: '1rem 0' }}>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> Interactive AI Land Value Forecasting Graphs</li>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> Fully vetted Land DNAs & digital boundary papers</li>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> Direct, unmediated consultations with leading legal experts</li>
                </ul>
                <div className="btn-group mt-4" style={{ justifyContent: 'flex-start' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setAuthModal({ ...authModal, view: 'login' })}>← Back to Sign In</button>
                </div>
              </div>
            )}

            {/* View 4: Seller Portal Preview Modal */}
            {authModal.view === 'sellerPortal' && (
              <div>
                <h2 className="text-secondary mb-4">Seller Portal Overview</h2>
                <p className="mb-4" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Market your agricultural land, plots, or commercial fields directly to genuine buyers with zero middleman friction.</p>
                <ul className="power-list" style={{ margin: '1rem 0' }}>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> **100% Free Listing**: Absolute zero brokerage or agency commission</li>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> Dynamic Inquiry Dashboards: Receive instant booking calls & messages</li>
                  <li><span className="check" style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>✓</span> Document verification badge which triggers trust</li>
                </ul>
                <div className="btn-group mt-4" style={{ justifyContent: 'flex-start' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAuthModal({ ...authModal, view: 'login' })}>← Back to Sign In</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
