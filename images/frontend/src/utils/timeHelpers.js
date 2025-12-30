/**
 * Time formatting utility functions
 */

/**
 * Formats duration in minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 * @example
 * formatDuration(45) // "45 min"
 * formatDuration(75) // "1h 15min"
 * formatDuration(120) // "2h 0min"
 */
export const formatDuration = (minutes) => {
	if (!minutes || minutes < 0) return '0 min';
	
	if (minutes < 60) {
		return `${Math.round(minutes)} min`;
	}
	
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);
	return `${hours}h ${mins} min`;
};

/**
 * Formats duration in minutes to compact format (for tight spaces)
 * @param {number} minutes - Duration in minutes
 * @returns {string} Compact formatted duration string
 * @example
 * formatDurationCompact(45) // "45min"
 * formatDurationCompact(75) // "1h 15min"
 */
export const formatDurationCompact = (minutes) => {
	if (!minutes || minutes < 0) return '0min';
	
	if (minutes < 60) {
		return `${Math.round(minutes)}min`;
	}
	
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);
	return `${hours}h ${mins}min`;
};