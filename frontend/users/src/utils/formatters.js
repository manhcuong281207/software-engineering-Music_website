/**
 * Format seconds to mm:ss
 * @param {number} seconds
 * @returns {string} e.g. "3:45"
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format large numbers with Vietnamese-style abbreviation
 * @param {number} num
 * @returns {string} e.g. "1.2 Tr" or "500 N"
 */
export function formatCount(num) {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)} N`;
  return num.toString();
}

/**
 * Format release date to short format
 * @param {string} dateStr ISO date string
 * @returns {string} e.g. "Th1 2024"
 */
export function formatReleaseDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
}

/**
 * Get greeting based on current hour
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}
