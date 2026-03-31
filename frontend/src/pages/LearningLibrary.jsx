import { useState } from 'react';
import { PlayCircle, Search, Clock, ChevronRight, BookOpen, Video, Star, Eye } from 'lucide-react';

export default function LearningLibrary() {
  const [search, setSearch] = useState('');

  const tutorials = [
    { id: 1, title: 'How to Link WhatsApp API', duration: '5:20', category: 'Setup', thumbnail: 'https://img.youtube.com/vi/VWqKYMCZikE/mqdefault.jpg', views: '1.2k', url: 'https://youtu.be/VWqKYMCZikE' },
    { id: 2, title: 'Creating High-Conversion Templates', duration: '8:45', category: 'Marketing', thumbnail: 'https://img.youtube.com/vi/YBK46dz9qeQ/mqdefault.jpg', views: '850', url: 'https://youtu.be/YBK46dz9qeQ' },
    { id: 3, title: 'Mastering Campaigns & Bulk Uploads', duration: '12:10', category: 'Execution', thumbnail: 'https://img.youtube.com/vi/G8FgGaeLg38/mqdefault.jpg', views: '2.1k', url: 'https://youtu.be/G8FgGaeLg38' },
    { id: 4, title: 'Automating Sales with AI Copilots', duration: '10:30', category: 'AI Tools', thumbnail: 'https://img.youtube.com/vi/VWqKYMCZikE/mqdefault.jpg', views: '940', url: 'https://youtu.be/VWqKYMCZikE' },
    { id: 5, title: 'Understanding Analytics & ROI', duration: '6:15', category: 'Reports', thumbnail: 'https://img.youtube.com/vi/YBK46dz9qeQ/mqdefault.jpg', views: '1.1k', url: 'https://youtu.be/YBK46dz9qeQ' },
    { id: 6, title: 'Managing Master Data & Teams', duration: '7:50', category: 'Admin', thumbnail: 'https://img.youtube.com/vi/G8FgGaeLg38/mqdefault.jpg', views: '670', url: 'https://youtu.be/G8FgGaeLg38' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Learning Library</h1>
          <p>Master the Samarth CRM with our step-by-step video tutorials</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="input-group" style={{ width: 300 }}>
            <Search size={16} className="input-icon" />
            <input 
              className="form-control" 
              placeholder="Search tutorials..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {tutorials.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(tutorial => (
          <div 
            key={tutorial.id} 
            className="card tutorial-card" 
            style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
            onClick={() => window.open(tutorial.url, '_blank')}
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={tutorial.thumbnail} 
                alt={tutorial.title} 
                style={{ width: '100%', height: 180, objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-play">
                <PlayCircle size={48} color="white" />
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '2px 8px', background: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                {tutorial.duration}
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className="badge badge-purple" style={{ fontSize: 10 }}>{tutorial.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={12} /> {tutorial.views} views
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 15, lineHeight: 1.4 }}>{tutorial.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  Watch Now <ChevronRight size={14} />
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={10} color="#f1c40f" fill="#f1c40f" />)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 40, background: 'linear-gradient(90deg, var(--primary) 0%, #6c5ce7 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Need Personal Training?</h2>
          <p style={{ opacity: 0.9 }}>Schedule a 1-on-1 demo with our customer success team.</p>
        </div>
        <button className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 800, padding: '12px 30px' }}>
          Book a Session
        </button>
      </div>
    </div>
  );
}
