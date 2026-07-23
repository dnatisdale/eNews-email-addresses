import React, { useState } from 'react';
import { BookMarked, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export const AZIndexBar = ({ activeLetter, onSelectLetter, contacts = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate count of contacts starting with each letter
  const letterCounts = {};
  ALPHABET.forEach((lettr) => {
    letterCounts[lettr] = 0;
  });

  contacts.forEach((c) => {
    const firstChar = (c.firstName[0] || c.lastName[0] || '').toUpperCase();
    if (firstChar >= 'A' && firstChar <= 'Z') {
      letterCounts[firstChar] = (letterCounts[firstChar] || 0) + 1;
    } else if (firstChar) {
      letterCounts['#'] = (letterCounts['#'] || 0) + 1;
    }
  });

  return (
    <div className={`rolodex-container ${isExpanded ? 'rolodex-expanded' : 'rolodex-collapsed'}`}>
      {/* Right Edge Collapsed Tab Handle */}
      {!isExpanded && (
        <button
          className="rolodex-handle-btn"
          onClick={() => setIsExpanded(true)}
          title="Open Collapsible A-Z Rolodex Alphabet Index"
        >
          <ChevronLeft size={16} />
          <BookMarked size={16} />
          <span className="handle-text">A-Z Rolodex {activeLetter !== 'All' ? `(${activeLetter})` : ''}</span>
        </button>
      )}

      {/* Expanded Right-Side Rolodex Alphabet Bar */}
      {isExpanded && (
        <div className="rolodex-panel">
          <div className="rolodex-header">
            <div className="rolodex-title">
              <BookMarked size={16} className="text-primary" />
              <span>A-Z Rolodex</span>
            </div>
            <button
              className="rolodex-close-btn"
              onClick={() => setIsExpanded(false)}
              title="Collapse Rolodex"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="rolodex-list">
            <button
              className={`rolodex-item ${activeLetter === 'All' ? 'rolodex-item-active' : ''}`}
              onClick={() => onSelectLetter('All')}
              title={`All Contacts (${contacts.length})`}
            >
              <span className="rolodex-char">ALL</span>
              <span className="rolodex-badge">{contacts.length}</span>
            </button>

            {ALPHABET.map((letter) => {
              const count = letterCounts[letter] || 0;
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  disabled={count === 0}
                  className={`rolodex-item ${isActive ? 'rolodex-item-active' : ''} ${count === 0 ? 'rolodex-item-disabled' : ''}`}
                  onClick={() => onSelectLetter(letter)}
                  title={count > 0 ? `${letter} (${count} contacts)` : `No contacts starting with ${letter}`}
                >
                  <span className="rolodex-char">{letter}</span>
                  {count > 0 && <span className="rolodex-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
