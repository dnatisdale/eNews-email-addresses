import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const THAI_ALPHABET = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ญ', 'ด', 'ต', 'ถ', 'ท', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ส', 'ห', 'อ', 'ฮ'];

export const AZIndexBar = ({ activeLetter, onSelectLetter, contacts = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('EN'); // 'EN' or 'TH'

  // Compute set of letters present in current contact list
  const presentLetters = new Set();
  let hasSymbolOrNumber = false;

  contacts.forEach((c) => {
    const firstChar = (c.firstName[0] || c.lastName[0] || '').toUpperCase();
    if (firstChar) {
      presentLetters.add(firstChar);
      if (!ENGLISH_ALPHABET.includes(firstChar) && !THAI_ALPHABET.includes(firstChar)) {
        hasSymbolOrNumber = true;
      }
    }
  });

  // Filter alphabets to ONLY include letters that have contacts
  const availableEn = ENGLISH_ALPHABET.filter((letter) => presentLetters.has(letter));
  const availableTh = THAI_ALPHABET.filter((letter) => presentLetters.has(letter));

  const currentAlphabetList = activeTab === 'EN' ? availableEn : availableTh;

  return (
    <div className={`rolodex-container ${isExpanded ? 'rolodex-expanded' : 'rolodex-collapsed'}`}>
      {/* Right Edge Collapsed Caret Handle (Poking out) */}
      {!isExpanded && (
        <button
          className="rolodex-caret-btn"
          onClick={() => setIsExpanded(true)}
          title="Open Alphabet Directory"
        >
          <ChevronLeft size={20} className="caret-icon" />
          {activeLetter !== 'All' && <span className="active-letter-dot">{activeLetter}</span>}
        </button>
      )}

      {/* Expanded Right-Side Alphabet Index */}
      {isExpanded && (
        <div className="rolodex-panel">
          <div className="rolodex-header">
            {/* EN / TH Switcher Tabs */}
            <div className="lang-tabs">
              <button
                className={`lang-tab ${activeTab === 'EN' ? 'lang-tab-active' : ''}`}
                onClick={() => setActiveTab('EN')}
              >
                A-Z {availableEn.length > 0 ? `(${availableEn.length})` : ''}
              </button>
              <button
                className={`lang-tab ${activeTab === 'TH' ? 'lang-tab-active' : ''}`}
                onClick={() => setActiveTab('TH')}
              >
                ก-ฮ {availableTh.length > 0 ? `(${availableTh.length})` : ''}
              </button>
            </div>
            <button
              className="rolodex-close-btn"
              onClick={() => setIsExpanded(false)}
              title="Close"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="rolodex-list">
            <button
              className={`rolodex-item ${activeLetter === 'All' ? 'rolodex-item-active' : ''}`}
              onClick={() => {
                onSelectLetter('All');
                setIsExpanded(false);
              }}
            >
              ALL
            </button>

            {/* Render ONLY letters that have contacts */}
            {currentAlphabetList.map((letter) => {
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  className={`rolodex-item ${isActive ? 'rolodex-item-active' : ''}`}
                  onClick={() => {
                    onSelectLetter(letter);
                    setIsExpanded(false);
                  }}
                >
                  <span className="rolodex-char">{letter}</span>
                </button>
              );
            })}

            {hasSymbolOrNumber && (
              <button
                className={`rolodex-item ${activeLetter === '#' ? 'rolodex-item-active' : ''}`}
                onClick={() => {
                  onSelectLetter('#');
                  setIsExpanded(false);
                }}
              >
                #
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
