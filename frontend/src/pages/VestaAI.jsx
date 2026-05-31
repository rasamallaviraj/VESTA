import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { vestaAIService } from '../services/vestaAI';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Trash2, HelpCircle, ArrowLeft, Bot, MessageSquare } from 'lucide-react';

const SuggestedPrompts = [
  "What will land prices in Hyderabad Gachibowli look like in 3–4 years?",
  "What documents do I need to buy agricultural land in Karnataka?",
  "Is Pune's Hinjewadi a good area for land investment right now?",
  "Explain encumbrance certificate in simple language",
  "What is the difference between Patta and Khata?",
  "How much stamp duty will I pay in Telangana for a ₹50 lakh plot?"
];

const VestaAI = () => {
  const location = useLocation();
  const { user, addNotification } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyContext, setPropertyContext] = useState(null);
  
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from localStorage or handle Property Redirect context
  useEffect(() => {
    const propertyState = location.state?.propertyContext;
    const initialPrompt = location.state?.initialPrompt;

    if (propertyState) {
      setPropertyContext(propertyState);
      addNotification(`Preloaded context for: ${propertyState.title}`, 'info');

      // Auto-trigger first contextual query
      const triggerContextualChat = async () => {
        setLoading(true);
        const queryText = initialPrompt || `Analyze this land in ${propertyState.city}: ${propertyState.title}. Is it a good investment?`;
        
        const userMsg = { sender: 'user', text: queryText, timestamp: new Date() };
        setMessages([userMsg]);
        
        try {
          const aiResponse = await vestaAIService.sendChatMessage(queryText, [userMsg], propertyState);
          setMessages(prev => [...prev, { sender: 'ai', text: aiResponse, timestamp: new Date() }]);
        } catch (e) {
          console.error("AI Error:", e);
        } finally {
          setLoading(false);
        }
      };
      triggerContextualChat();
    } else {
      // Load standard localStorage history if available
      const cachedHistory = localStorage.getItem('vesta_ai_history');
      if (cachedHistory) {
        try {
          setMessages(JSON.parse(cachedHistory));
        } catch (e) {
          console.error("Could not parse cached AI history");
        }
      }
    }
  }, [location.state]);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0 && !propertyContext) {
      localStorage.setItem('vesta_ai_history', JSON.stringify(messages));
    }
  }, [messages, propertyContext]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;
    setLoading(true);

    const userMsg = { sender: 'user', text: textToSend, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const reply = await vestaAIService.sendChatMessage(textToSend, historyPayload, propertyContext);
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: reply,
        timestamp: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I encountered a routing connection issue. Please check your CLAUDE_API_KEY config.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setPropertyContext(null);
    localStorage.removeItem('vesta_ai_history');
    addNotification("AI chat conversation history cleared.");
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '5.5rem', background: 'var(--bg-color)' }}>
      {/* Top Banner Status Bar */}
      <div 
        className="glass" 
        style={{
          padding: '1rem 2rem',
          borderRadius: 0,
          background: 'rgba(10, 10, 15, 0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bot size={24} className="text-secondary" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Vesta AI Co-Pilot</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {propertyContext ? `Analyzing: ${propertyContext.title}` : 'Powered by Claude 3.5 Sonnet'}
            </span>
          </div>
        </div>

        {messages.length > 0 && (
          <button 
            className="btn btn-sm btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-error)', borderColor: 'rgba(244,63,94,0.2)' }}
            onClick={handleClearHistory}
          >
            <Trash2 size={12} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Main chat window container */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem 0', background: 'rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
          
          {/* Welcome View (If no messages exist) */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', margin: 'auto', maxWidth: '580px', textAlign: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.4))' }}>🔮</div>
              <h2 className="text-gradient">Meet your real estate superpower</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
                I am Vesta AI, an intelligent land advisor. Ask me anything about measurements, state stamp taxes, mutation pipelines, or future land values in major tech hubs.
              </p>

              {/* Suggestions Prompts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '1rem' }}>
                {SuggestedPrompts.map((prompt, idx) => (
                  <button 
                    key={idx}
                    className="glass font-body"
                    style={{
                      textAlign: 'left',
                      fontSize: '0.825rem',
                      padding: '1rem',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'border 0.3s',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Flow bubbles */}
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                gap: '10px',
                flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar Icon */}
              {m.sender === 'ai' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(79,70,229,0.1)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} className="text-secondary" />
                </div>
              )}

              {/* Chat Bubble card */}
              <div 
                className={m.sender === 'user' ? '' : 'glass'}
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  background: m.sender === 'user' ? 'linear-gradient(135deg, var(--accent-primary), #312e81)' : 'rgba(20, 20, 25, 0.75)',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(79,70,229,0.1)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} className="text-secondary" />
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', gap: '6px' }}>
                <span className="loader" style={{ width: '14px', height: '14px' }}></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vesta AI is calculating...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div 
        className="glass" 
        style={{
          padding: '1.5rem 2rem',
          borderRadius: 0,
          background: 'rgba(5, 5, 10, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0
        }}
      >
        <div className="container" style={{ maxWidth: '800px', display: 'flex', gap: '10px' }}>
          {propertyContext && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '8px',
              padding: '0 10px',
              fontSize: '0.8rem',
              color: 'var(--accent-gold)'
            }}>
              Context Vetted
            </div>
          )}
          <input 
            type="text" 
            placeholder="Type your land or document query..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            style={{
              flexGrow: 1,
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50px',
              color: 'white',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
          <button 
            className="btn btn-primary" 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            onClick={() => handleSendMessage(inputValue)}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default VestaAI;
