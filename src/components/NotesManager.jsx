import React, { useState } from 'react';
import { NotebookPen, Search, Plus, Pin, Trash2, Tag, Edit3, X, FileText } from 'lucide-react';

export default function NotesManager({ notes, onSaveNotes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('General');
  const [pinned, setPinned] = useState(false);

  // Extract unique tags
  const tags = ['All', ...new Set(notes.map(n => n.tag || 'General'))];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setTag(note.tag || 'General');
      setPinned(note.pinned || false);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setTag('General');
      setPinned(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNote) {
      const updated = notes.map(n => n.id === editingNote.id ? {
        ...n,
        title: title.trim(),
        content,
        tag,
        pinned,
        updatedAt: new Date().toISOString()
      } : n);
      onSaveNotes(updated);
    } else {
      const newNote = {
        id: Date.now().toString(),
        title: title.trim(),
        content,
        tag,
        pinned,
        updatedAt: new Date().toISOString()
      };
      onSaveNotes([newNote, ...notes]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    onSaveNotes(notes.filter(n => n.id !== id));
  };

  const handleTogglePin = (id) => {
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    onSaveNotes(updated);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
            <FileText size={16} />
            <span>Knowledge Hub</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>Personal Notes & Ideas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Fast searchable note taker synchronized across devices.</p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search notes content or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>

        {/* Tag Selector */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
          {tags.map(t => (
            <button
              key={t}
              className={`badge ${selectedTag === t ? 'badge-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTag(t)}
              style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid-3">
        {filteredNotes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            No notes matching search criteria. Click "New Note" to capture your thoughts!
          </div>
        ) : (
          filteredNotes.map(n => (
            <div key={n.id} className="glass-card" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              minHeight: '180px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-primary">{n.tag || 'General'}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleTogglePin(n.id)}
                      style={{ background: 'transparent', color: n.pinned ? '#fbbf24' : 'var(--text-dim)' }}
                      title={n.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin size={15} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(n)}
                      style={{ background: 'transparent', color: 'var(--text-muted)' }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      onClick={() => handleDelete(n.id)}
                      style={{ background: 'transparent', color: 'var(--text-dim)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {n.title}
                </h3>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  whiteSpace: 'pre-wrap', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 5, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {n.content}
                </p>
              </div>

              <div style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                Updated {new Date(n.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Editor Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input 
                type="text"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text"
                  placeholder="Category Tag (e.g. Work, Ideas, Code)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={{ flex: '1' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={pinned} 
                    onChange={(e) => setPinned(e.target.checked)} 
                  />
                  Pin Note
                </label>
              </div>
              <textarea 
                placeholder="Note details / markdown content..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
