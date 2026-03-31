import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Phone, Bot, RefreshCw } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef();

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (active) { fetchMessages(active.id); const t = setInterval(() => fetchMessages(active.id), 5000); return () => clearInterval(t); }
  }, [active]);

  const fetchConversations = async () => {
    setLoading(true);
    try { const { data } = await api.get('/whatsapp/conversations/'); setConversations(data.results || data); }
    catch { toast.error('Failed to load conversations'); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (id) => {
    try { const { data } = await api.get(`/whatsapp/conversations/${id}/messages/`); setMessages(data.results || data); }
    catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !active) return;
    setSending(true);
    try {
      await api.post('/whatsapp/send/', { conversation_id: active.id, content: input });
      setInput('');
      fetchMessages(active.id);
      fetchConversations();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Conversations</h1>
          <p>Real-time WhatsApp inbox • {conversations.length} active</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchConversations}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="conversation-layout">
        {/* Left: Conversation List */}
        <div className="conv-list">
          <div className="conv-list-header">
            <div className="search-bar">
              <input placeholder="Search conversations..." />
            </div>
          </div>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">💬</div>
              <h3>No conversations</h3>
              <p>Link your WhatsApp to start receiving messages</p>
            </div>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                className={`conv-item ${active?.id === c.id ? 'active' : ''}`}
                onClick={() => setActive(c)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="conv-name">{c.lead_name}</div>
                  {c.last_message_at && <div className="conv-time">{new Date(c.last_message_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                  <div className="conv-preview">{c.last_message || 'No messages yet'}</div>
                  {c.unread_count > 0 && (
                    <span style={{ background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.unread_count}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📱 {c.lead_mobile}</div>
              </div>
            ))
          )}
        </div>

        {/* Right: Chat Area */}
        <div className="chat-area">
          {active ? (
            <>
              <div className="chat-header">
                <div className="avatar">{active.lead_name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{active.lead_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📱 {active.lead_mobile}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <span className={`badge ${active.status === 'bot' ? 'badge-purple' : active.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                    {active.status === 'bot' ? <><Bot size={10} /> AI Active</> : active.status}
                  </span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-state" style={{ flex: 1 }}>
                    <MessageSquare size={40} className="empty-state-icon" />
                    <p>No messages in this conversation yet</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`msg ${m.direction}`}>
                      {m.direction === 'inbound' && (
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, alignSelf: 'flex-end' }}>
                          {active.lead_name?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="msg-bubble">{m.content}</div>
                        <div className="msg-time" style={{ textAlign: m.direction === 'outbound' ? 'right' : 'left' }}>
                          {m.is_ai_generated && <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>🤖 AI · </span>}
                          {new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {m.direction === 'outbound' && <span style={{ marginLeft: 4 }}>{m.status === 'read' ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-input-area">
                <textarea
                  className="form-control"
                  placeholder="Type a message... (Enter to send)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  style={{ resize: 'none', flex: 1 }}
                />
                <button
                  className="btn btn-primary btn-icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{ padding: '10px 14px' }}
                >
                  {sending ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Send size={16} />}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={52} style={{ opacity: 0.2, marginBottom: 16, color: 'var(--primary)' }} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the left panel to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
