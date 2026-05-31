import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, UserCheck, ShieldAlert, Award, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Home = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();
  
  // Contact state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  // GSAP Animations
  useEffect(() => {
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
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.submitContactForm(contactForm);
      if (res.success) {
        addNotification("Your message has been sent to our experts! We will contact you soon.", "success");
        setContactForm({ name: '', email: '', message: '' });
      }
    } catch (err) {
      addNotification("Could not send contact message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" id="home" style={{ paddingTop: '8rem' }}>
        <div className="container hero-content">
          <div className="hero-text-wrapper">
            <h1 className="hero-title gs-reveal">
              Revolutionizing modern <span className="text-gradient">real estate</span>
            </h1>
            <p className="hero-subtitle gs-reveal">
              India’s most transparent land marketplace—connecting buyers and sellers directly with zero brokerage.
            </p>

            <div className="hero-cta gs-reveal mt-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-primary btn-large" style={{ textDecoration: 'none' }}>
                Start Exploring
              </Link>
              <Link to="/vesta-ai" className="btn btn-outline btn-large" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} className="text-secondary" />
                <span>Consult Vesta AI</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span className="scroll-text">Scroll to explore</span>
        </div>
      </section>

      {/* Basic Real Estate Knowledge */}
      <section className="knowledge section-padding" id="knowledge">
        <div className="container">
          <div className="section-header gs-reveal">
            <h2 className="section-title text-center">
              Essential <span className="text-gradient">Real Estate Knowledge</span>
            </h2>
            <p className="section-subtitle text-center">
              Master the basics of land measurements. A quick guide designed simple and clean for youth and enthusiasts.
            </p>
          </div>
          <div className="grid-3 count-grid text-center">
            {/* Acre */}
            <div className="card glass accent-glow gs-reveal">
              <h3 className="stat-value text-gradient" style={{ fontSize: '3rem', margin: '1rem 0' }}>1 Acre</h3>
              <ul className="power-list mt-4" style={{ textAlign: 'left' }}>
                <li><span className="check">✓</span> 4,840 Square Yards / Gaj</li>
                <li><span className="check">✓</span> 43,560 Square Feet</li>
                <li><span className="check">✓</span> 40 Gunthas</li>
                <li><span className="check">✓</span> 0.404 Hectares</li>
              </ul>
            </div>
            
            {/* Guntha */}
            <div className="card glass secondary-glow gs-reveal">
              <h3 className="stat-value text-secondary" style={{ fontSize: '3rem', margin: '1rem 0' }}>1 Guntha</h3>
              <ul className="power-list mt-4" style={{ textAlign: 'left' }}>
                <li><span className="check">✓</span> 121 Square Yards / Gaj</li>
                <li><span className="check">✓</span> 1,089 Square Feet</li>
                <li><span className="check">✓</span> 1/40th of an Acre</li>
                <li><span className="check">✓</span> 33 ft × 33 ft Area</li>
              </ul>
            </div>

            {/* Hectare */}
            <div className="card glass purple-glow gs-reveal">
              <h3 className="stat-value text-purple" style={{ fontSize: '3rem', margin: '1rem 0' }}>1 Hectare</h3>
              <ul className="power-list mt-4" style={{ textAlign: 'left' }}>
                <li><span className="check">✓</span> 2.47 Acres</li>
                <li><span className="check">✓</span> 10,000 Square Meters</li>
                <li><span className="check">✓</span> 11,960 Square Yards / Gaj</li>
                <li><span className="check">✓</span> 100 Gunthas</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-4 gs-reveal">
            <Link to="/learn" className="btn btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>View Full Knowledge Hub</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features / Advantage */}
      <section className="problem section-padding" id="explore">
        <div className="container">
          <div className="section-header gs-reveal">
            <h2 className="section-title text-center">
              The VESTA <span className="text-secondary">Advantage</span>
            </h2>
            <p className="section-subtitle text-center">
              Everything you need, built into one superpower platform to eliminate hidden fees and complexity.
            </p>
          </div>
          <div className="grid-3">
            <div className="card glass accent-glow gs-reveal">
              <div className="card-icon">💸</div>
              <h3>1. No Brokerage</h3>
              <p>Eliminate the middleman entirely. Zero miscellaneous agency commissions for buyers and sellers.</p>
            </div>
            <div className="card glass accent-glow gs-reveal">
              <div className="card-icon">👁️</div>
              <h3>2. No Data Hiding</h3>
              <p>Crystal clear transparency. See all key facts, survey boundaries, and tax receipts instantly.</p>
            </div>
            <div className="card glass accent-glow gs-reveal">
              <div className="card-icon">🧠</div>
              <h3>3. Knowledge Hub</h3>
              <p>Basic to advanced real-estate knowledge for youth and beginners. Measurements, tax brackets, and document timelines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence & Tools */}
      <section className="intelligence section-padding" id="intelligence">
        <div className="container">
          <div className="section-header gs-reveal">
            <h2 className="section-title text-center">
              Vesta's Ultimate <span className="text-gradient">Tools</span>
            </h2>
          </div>

          {/* Land DNA */}
          <div className="feature-row gs-reveal">
            <div className="feature-text">
              <div className="badge badge-gold">Trust & Verification</div>
              <h3 className="feature-title">4. Crystal Clear Transparency & Land DNA</h3>
              <p style={{ marginBottom: '1.5rem' }}>Know everything about previous land disputes, registered papers, and check if there is any illegal background. All documents are accessible.</p>
              <Link to="/explore" className="btn btn-outline" style={{ textDecoration: 'none' }}>Examine Land DNA</Link>
            </div>
            <div className="feature-visual glass gold-glow">
              <div className="abstract-visual icon-visual">🧬</div>
            </div>
          </div>

          {/* AI Tools */}
          <div className="feature-row reverse gs-reveal">
            <div className="feature-text">
              <div className="badge badge-purple">AI Powered</div>
              <div className="sub-features">
                <div className="sub-feature">
                  <h4>6. AI Land Analyzer</h4>
                  <p>Deep scan of property pros & cons, neighborhood analytics, and growth potential.</p>
                </div>
                <div className="sub-feature" style={{ marginTop: '1.5rem' }}>
                  <h4>7. AI Land Value Calculator</h4>
                  <p>Predict the exact value of land even after years using our advanced AI-based graphs and metrics.</p>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <Link to="/vesta-ai" className="btn btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--accent-purple), #7c3aed)' }}>
                    Access AI Calculators
                  </Link>
                </div>
              </div>
            </div>
            <div className="feature-visual glass purple-glow">
              <div className="abstract-visual icon-visual">🤖</div>
            </div>
          </div>

          {/* Expert Consultation */}
          <div className="feature-row gs-reveal" id="consultation">
            <div className="feature-text">
              <div className="badge">Human Expertise</div>
              <h3 className="feature-title">5. Expert Consultation</h3>
              <p style={{ marginBottom: '1.5rem' }}>Get personalized reviews, suggestions, and professional advice directly from vetted industry experts. We guide buyers through every step.</p>
              <Link to="/experts" className="btn btn-outline" style={{ textDecoration: 'none' }}>Meet Experts</Link>
            </div>
            <div className="feature-visual glass accent-glow">
              <div className="abstract-visual icon-visual">👨‍💼</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Users Banner */}
      <section className="final-cta section-padding" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container text-center">
          <h2 className="gs-reveal mb-4">Vetted by the <span className="text-gradient">Best</span></h2>
          <div className="grid-3 mt-4" style={{ gap: '2rem' }}>
            <div className="glass gs-reveal" style={{ padding: '2rem' }}>
              <Award size={40} className="text-gradient" style={{ marginBottom: '1rem' }} />
              <h4>100% Secure Flow</h4>
              <p style={{ fontSize: '0.95rem' }}>Every document undergoes agent audit checkpoints before going public.</p>
            </div>
            <div className="glass gs-reveal" style={{ padding: '2rem' }}>
              <ShieldAlert size={40} className="text-secondary" style={{ marginBottom: '1rem' }} />
              <h4>Fraud Shield</h4>
              <p style={{ fontSize: '0.95rem' }}>Immediate warnings on encumbrance loops or disputed survey registries.</p>
            </div>
            <div className="glass gs-reveal" style={{ padding: '2rem' }}>
              <UserCheck size={40} className="text-purple" style={{ marginBottom: '1rem' }} />
              <h4>Vetted Advisors</h4>
              <p style={{ fontSize: '0.95rem' }}>Direct links with certified surveyors and high-ranking land attorneys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact section-padding" id="contact">
        <div className="container">
          <div className="section-header gs-reveal">
            <h2 className="section-title text-center">
              Get in <span className="text-gradient">Touch</span>
            </h2>
            <p className="section-subtitle text-center">
              Have questions? Our experts are here to help you navigate the future of real estate.
            </p>
          </div>
          <div className="contact-card glass accent-glow gs-reveal" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
            <form id="contactForm" onSubmit={handleContactSubmit}>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div className="form-group">
                  <label htmlFor="contactName">Name</label>
                  <input 
                    type="text" 
                    id="contactName" 
                    placeholder="Your Name" 
                    required 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactEmail">Email</label>
                  <input 
                    type="email" 
                    id="contactEmail" 
                    placeholder="Your Email" 
                    required 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group mt-4">
                <label htmlFor="contactMessage">Message</label>
                <textarea 
                  id="contactMessage" 
                  rows="5" 
                  placeholder="How can we help?" 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}>
                <span className="btn-text">{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-box glass accent-glow gs-reveal">
            <div className="cta-grid text-center" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
              <div className="cta-text">
                <h2>Let's Build and Grow <span className="text-gradient">Together</span></h2>
                <p style={{ marginTop: '1rem', fontSize: '1.25rem' }}>
                  Have you ever got a real-estate app with such features and trustworthy listings which could be a superpower one day? Join Vesta today!
                </p>
              </div>
              <div className="cta-actions" style={{ margin: '0 auto' }}>
                {!user ? (
                  <button className="btn btn-primary btn-large" onClick={() => onOpenAuth('login')}>
                    Login to VESTA
                  </button>
                ) : (
                  <Link to="/explore" className="btn btn-primary btn-large" style={{ textDecoration: 'none' }}>
                    Explore Properties Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div className="footer-brand">
              <h2><span className="text-gradient">VESTA</span></h2>
              <p>Revolutionizing real estate for India's next generation.</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <Link to="/explore" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textDecoration: 'none' }}>Explore Lands</Link>
              <Link to="/vesta-ai" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textDecoration: 'none' }}>AI Review & Calculation</Link>
              <Link to="/experts" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textDecoration: 'none' }}>Meet Industry Experts</Link>
            </div>
            <div className="footer-legal">
              <h4>Legal</h4>
              <a href="#" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom text-center mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', color: 'var(--text-secondary)' }}>
            <p>&copy; 2026 VESTA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
