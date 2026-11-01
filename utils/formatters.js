/**
 * Formatting utilities for AgentMart
 * Enforces standardized INR currency formatting, percentages, and dates
 */

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(val) {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${Number(val).toFixed(1)}%`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function safeParseJson(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim().replace(/,\s*([}\]])/g, '$1');
  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * Strips raw markdown JSON codeblocks (e.g. ```json { ... } ```) and raw JSON payloads
 * to present clean conversational prose in the UI without raw code or JSON syntax.
 */
export function cleanMessageContent(content) {
  if (typeof content !== 'string') return '';
  return content
    // Strip standard closed markdown code fences (json or others)
    .replace(/```[\s\S]*?```/gi, '')
    // Strip unclosed code fences at end of string
    .replace(/```[\s\S]*$/gi, '')
    // Strip inline code blocks with json
    .replace(/`\{[\s\S]*?\}`/gi, '')
    // Strip raw JSON object structures spanning { "key": ... }
    .replace(/\{[\s\r\n]*"[a-zA-Z0-9_-]+"[\s\S]*?\}/gi, '')
    // Clean multiple line breaks and trims
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parses proposal JSON if embedded inside content or already provided
 */
export function extractProposal(content, fallbackProposal = null) {
  if (fallbackProposal && typeof fallbackProposal === 'object' && Object.keys(fallbackProposal).length > 0) {
    return fallbackProposal;
  }
  if (typeof content !== 'string') return null;

  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const parsed = safeParseJson(codeBlockMatch[1]);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  const curlyMatch = content.match(/(\{[\s\S]*?\})/);
  if (curlyMatch && curlyMatch[1]) {
    const parsed = safeParseJson(curlyMatch[1]);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  return null;
}
