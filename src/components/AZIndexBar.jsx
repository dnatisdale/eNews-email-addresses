import React, { useState } from 'react';

const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const THAI_ALPHABET = [
  'ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ญ', 'ด', 'ต', 'ถ', 'ท', 'น',
  'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ส', 'ห', 'อ', 'ฮ'
];

export const AZIndexBar = ({ activeLetter, onSelectLetter, contacts = [] }) => {
  const [activeTab, setActiveTab] = useState('EN'); // 'EN' or 'TH'

  const presentLetters = new Set();
  let hasSymbolOrNumber = false;

  contacts.forEach((c) => {
    const firstChar = (c.firstName?.[0] || c.lastName?.[0] || '').toUpperCase();
    if (firstChar) {
      presentLetters.add(firstChar);
      if (!ENGLISH_ALPHABET.includes(firstChar) && !THAI_ALPHABET.includes(firstChar)) {
        hasSymbolOrNumber = true;
      }
    }
  });

  // Filter alphabets to ONLY include letters that actually exist in contacts
  const availableEn = ENGLISH_ALPHABET.filter((letter) => presentLetters.has(letter));
  const availableTh = THAI_ALPHABET.filter((letter) => presentLetters.has(letter));

  const hasThaiContacts = availableTh.length > 0;
  const currentAlphabetList = activeTab === 'EN' ? availableEn : (availableTh.length > 0 ? availableTh : availableEn);

  return (
    <div className="az-top-strip">
      <div className="az-strip-scroll">
        {/* EN / TH Language Switcher Tabs (Only if Thai contacts are present) */}
        {hasThaiContacts && (
          <div className="az-lang-toggle">
            <button
              type="button"
              className={`az-lang-btn ${activeTab === 'EN' ? 'active' : ''}`}
              onClick={() => setActiveTab('EN')}
            >
              A-Z
            </button>
            <button
              type="button"
              className={`az-lang-btn ${activeTab === 'TH' ? 'active' : ''}`}
              onClick={() => setActiveTab('TH')}
            >
              ก-ฮ
            </button>
          </div>
        )}

        <button
          type="button"
          className={`az-pill ${activeLetter === 'All' ? 'az-pill-active' : ''}`}
          onClick={() => onSelectLetter('All')}
        >
          ALL
        </button>

        {/* Render ONLY letters that have contacts in the directory (saves space on smartphones) */}
        {currentAlphabetList.map((letter) => {
          const isActive = activeLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              className={`az-pill ${isActive ? 'az-pill-active' : ''}`}
              onClick={() => onSelectLetter(letter)}
              title={`Filter contacts starting with ${letter}`}
            >
              {letter}
            </button>
          );
        })}

        {/* Special Characters / Numbers Pill (#) */}
        {hasSymbolOrNumber && (
          <button
            type="button"
            className={`az-pill ${activeLetter === '#' ? 'az-pill-active' : ''}`}
            onClick={() => onSelectLetter('#')}
            title="Filter symbols and numbers"
          >
            #
          </button>
        )}
      </div>
    </div>
  );
};
