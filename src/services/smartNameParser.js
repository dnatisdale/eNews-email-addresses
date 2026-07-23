/**
 * Smart Name, Nickname & Household Parsing Engine
 * Intelligently handles:
 * - Couples & Households (e.g. "Tom & Mary Tisdale", "John and Jane")
 * - Nicknames & Parentheses (e.g. "Robert (Bob)", "William 'Bill'")
 * - Honorifics & Suffixes (e.g. "Dr. Robert H. Tisdale Jr.")
 * - Ignores "Display Name" system strings to avoid polluting name fields
 */

export const NICKNAME_MAP = {
  bob: ['robert', 'bobby'],
  robert: ['bob', 'bobby', 'rob'],
  rob: ['robert', 'bob'],
  bill: ['william', 'billy'],
  william: ['bill', 'billy', 'will'],
  jim: ['james', 'jimmy'],
  james: ['jim', 'jimmy'],
  mike: ['michael'],
  michael: ['mike'],
  dave: ['david'],
  david: ['dave'],
  dan: ['daniel', 'danny'],
  daniel: ['dan', 'danny'],
  dick: ['richard', 'rick'],
  richard: ['dick', 'rick', 'rich'],
  tom: ['thomas', 'tommy'],
  thomas: ['tom', 'tommy'],
  liz: ['elizabeth', 'beth', 'lisa'],
  elizabeth: ['liz', 'beth', 'lisa', 'betty'],
  jen: ['jennifer', 'jenny'],
  jennifer: ['jen', 'jenny'],
  chris: ['christopher', 'christina'],
  christopher: ['chris'],
  alex: ['alexander', 'alexandra'],
  alexander: ['alex'],
  andy: ['andrew'],
  andrew: ['andy', 'drew'],
  sam: ['samuel', 'samantha'],
  samuel: ['sam'],
  joe: ['joseph', 'joey'],
  joseph: ['joe', 'joey'],
  tony: ['anthony'],
  anthony: ['tony'],
  matt: ['matthew'],
  matthew: ['matt'],
  nick: ['nicholas'],
  nicholas: ['nick']
};

const PREFIXES = new Set(['mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'dr', 'dr.', 'prof', 'prof.', 'rev', 'rev.']);
const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'phd', 'esq', 'md']);
const DISALLOWED_NAME_STRINGS = new Set(['display name', 'file as', 'formatted name', 'contact name', 'name', 'unnamed']);

export const parseSmartName = (rawFirst = '', rawLast = '', rawFull = '') => {
  let firstName = rawFirst.trim();
  let lastName = rawLast.trim();
  let nickname = '';
  let isHousehold = false;

  // Filter out system strings like "Display Name"
  if (firstName && DISALLOWED_NAME_STRINGS.has(firstName.toLowerCase())) {
    firstName = '';
  }
  if (lastName && DISALLOWED_NAME_STRINGS.has(lastName.toLowerCase())) {
    lastName = '';
  }

  let combined = rawFull.trim();
  if (combined && DISALLOWED_NAME_STRINGS.has(combined.toLowerCase())) {
    combined = '';
  }

  // If rawFirst/rawLast present, prioritize them and DO NOT fallback to Display Name
  if (firstName || lastName) {
    combined = `${firstName} ${lastName}`.trim();
  }

  // 1. Extract Parentheses or Quotes Nicknames like "Robert (Bob)" or "William 'Bill'"
  const nicknameMatch = combined.match(/\(([^)]+)\)|"([^"]+)"|'([^']+)'/);
  if (nicknameMatch) {
    nickname = (nicknameMatch[1] || nicknameMatch[2] || nicknameMatch[3] || '').trim();
    combined = combined.replace(nicknameMatch[0], '').replace(/\s+/g, ' ').trim();
    if (firstName) {
      firstName = firstName.replace(nicknameMatch[0], '').replace(/\s+/g, ' ').trim();
    }
  }

  // 2. Detect Households & Couples (e.g., "Tom & Mary", "John and Jane", "Smith, Tom + Mary")
  const coupleRegex = /\b(and|&|\+)\b/i;
  if (coupleRegex.test(combined) || coupleRegex.test(firstName)) {
    isHousehold = true;
  }

  // 3. Clean up Honorifics & Suffixes if full name was passed
  if (!rawFirst && !rawLast && combined) {
    let tokens = combined.split(' ').filter(Boolean);

    // Strip leading prefix (Mr., Dr., Mrs.)
    if (tokens.length > 1 && PREFIXES.has(tokens[0].toLowerCase())) {
      tokens.shift();
    }

    // Strip trailing suffix (Jr., III, PhD)
    if (tokens.length > 1 && SUFFIXES.has(tokens[tokens.length - 1].toLowerCase())) {
      tokens.pop();
    }

    if (tokens.length === 1) {
      firstName = tokens[0];
      lastName = '';
    } else if (tokens.length >= 2) {
      if (coupleRegex.test(tokens.join(' '))) {
        const andIdx = tokens.findIndex(t => coupleRegex.test(t));
        if (andIdx > 0 && andIdx < tokens.length - 1) {
          firstName = tokens.slice(0, andIdx + 2).join(' '); // "Tom and Mary"
          lastName = tokens.slice(andIdx + 2).join(' ');   // "Tisdale"
        } else {
          firstName = tokens[0];
          lastName = tokens.slice(1).join(' ');
        }
      } else {
        firstName = tokens[0];
        lastName = tokens.slice(1).join(' ');
      }
    }
  }

  // Normalize couple connector format to clean "&"
  if (isHousehold && firstName) {
    firstName = firstName.replace(/\b(and|\+)\b/gi, '&').replace(/\s*&\s*/g, ' & ');
  }

  return {
    firstName: firstName || rawFirst || 'Unnamed',
    lastName: lastName || rawLast || '',
    nickname,
    isHousehold
  };
};

export const areNamesSmartMatch = (nameA = '', nameB = '') => {
  const normA = nameA.toLowerCase().trim();
  const normB = nameB.toLowerCase().trim();

  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const partsA = normA.split(' ').filter(Boolean);
  const partsB = normB.split(' ').filter(Boolean);

  const lastA = partsA[partsA.length - 1] || '';
  const lastB = partsB[partsB.length - 1] || '';

  if (lastA && lastB && lastA !== lastB) return false;

  const firstA = partsA[0] || '';
  const firstB = partsB[0] || '';

  if (NICKNAME_MAP[firstA] && NICKNAME_MAP[firstA].includes(firstB)) return true;
  if (NICKNAME_MAP[firstB] && NICKNAME_MAP[firstB].includes(firstA)) return true;

  if (normA.includes('&') || normA.includes('and') || normB.includes('&') || normB.includes('and')) {
    if (firstA && normB.includes(firstA)) return true;
    if (firstB && normA.includes(firstB)) return true;
  }

  return false;
};
