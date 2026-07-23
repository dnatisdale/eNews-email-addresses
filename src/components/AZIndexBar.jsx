import React, { useState } from 'react';
import { SlidersHorizontal, X, ChevronRight } from 'lucide-react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export const AZIndexBar = ({ activeLetter, onSelectLetter, contacts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Trigger Button */}
      <button 
        className={`btn btn-sm ${activeLetter !== 'All' ? 'btn-primary' : 'btn-secondary'} az-trigger-btn`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open A-Z Quick Jump Directory"
      >
        <SlidersHorizontal size={14} />
        <span>A-Z Index {activeLetter !== 'All' ? `(${activeLetter})` : ''}</span>
      </button>

      {/* Slideout A-Z Jump Drawer */}
      {isOpen && (
        <div className="az-slideout-drawer">
          <div className="az-drawer-header">
            <h4>A-Z Quick Jump Index</h4>
            <button className="icon-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="az-grid">
            <button
              className={`az-pill ${activeLetter === 'All' ? 'az-pill-active' : ''}`}
              onClick={() => {
                onSelectLetter('All');
                setIsOpen(false);
              }}
            >
              All ({contacts.length})
            </button>

            {ALPHABET.map((letter) => {
              const count = letterCounts[letter] || 0;
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  disabled={count === 0}
                  className={`az-pill ${isActive ? 'az-pill-active' : ''} ${count === 0 ? 'az-disabled' : ''}`}
                  onClick={() => {
                    onSelectLetter(letter);
                    setIsOpen(false);
                  }}
                >
                  <span className="az-char">{letter}</span>
                  {count > 0 && <span className="az-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
