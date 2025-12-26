// API Configuration
const API_BASE_URL =
	window.location.hostname === "localhost"
		? "http://localhost:5000"
		: window.location.origin; // Use same origin in production

// Export API configuration
export const API_CONFIG = {
	BASE_URL: API_BASE_URL,
	ENDPOINTS: {
		// Auth endpoints
		LOGIN: "/api/auth/login",
		REGISTER: "/api/auth/register",

		// Workout endpoints
		WORKOUT_SESSION: "/api/workouts/session",
		WORKOUT_TEMPLATES: "/api/workouts/templates",
		WORKOUT_TEMPLATE: "/api/workouts/template",
		WORKOUT_RECORDS: "/api/workouts/records",

		// User endpoints
		USER_PROFILE: "/api/user/profile",
		USER_STATS: "/api/user/stats",
		PERSONAL_RECORDS: "/api/workouts/records",

		// Admin endpoints
		ADMIN_USERS: "/api/admin/users",
		ADMIN_EVENTS: "/api/admin/events",
	},
};

// Helper function to make API requests with proper error handling
export const apiRequest = async (endpoint, options = {}) => {
	const url = `${API_CONFIG.BASE_URL}${endpoint}`;

	// Default headers
	const defaultHeaders = {
		"Content-Type": "application/json",
	};

	// Add auth token if available
	const token = localStorage.getItem("token");
	if (token) {
		defaultHeaders["Authorization"] = `Bearer ${token}`;
	}

	const config = {
		headers: defaultHeaders,
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	};

	try {
		console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

		const response = await fetch(url, config);

		// Handle network errors
		if (!response.ok) {
			let errorMessage = "Request failed";

			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorData.message || errorMessage;
			} catch (parseError) {
				// If we can't parse JSON, use status text
				errorMessage = response.statusText || `HTTP ${response.status}`;
			}

			// Create error object with more details
			const error = new Error(errorMessage);
			error.status = response.status;
			error.statusText = response.statusText;
			error.endpoint = endpoint;

			console.error(`❌ API Error: ${options.method || "GET"} ${url}`, error);
			throw error;
		}

		// Try to parse JSON response
		try {
			const data = await response.json();
			console.log(`✅ API Success: ${options.method || "GET"} ${url}`, data);
			return data;
		} catch (parseError) {
			// If no JSON content, return text or empty object
			const text = await response.text();
			console.log(
				`✅ API Success (text): ${options.method || "GET"} ${url}`,
				text
			);
			return text || {};
		}
	} catch (error) {
		// Handle network errors, timeouts, etc.
		if (error.name === "TypeError" && error.message.includes("fetch")) {
			const networkError = new Error(
				"Network error - unable to connect to server"
			);
			networkError.isNetworkError = true;
			networkError.originalError = error;
			console.error(
				`🔌 Network Error: ${options.method || "GET"} ${url}`,
				networkError
			);
			throw networkError;
		}

		// Handle JWT expired errors specifically
		if (
			error.status === 401 ||
			(error.message && error.message.includes("jwt expired"))
		) {
			const tokenError = new Error("Session expired");
			tokenError.isTokenExpired = true;
			tokenError.code = "TOKEN_EXPIRED";
			tokenError.shouldLogout = true;
			console.error(
				`🔑 Token Expired Error: ${options.method || "GET"} ${url}`,
				tokenError
			);
			throw tokenError;
		}

		console.error(`💥 Request Error: ${options.method || "GET"} ${url}`, error);
		throw error;
	}
};

// Convenience methods
export const api = {
	get: (endpoint, options = {}) =>
		apiRequest(endpoint, { method: "GET", ...options }),
	post: (endpoint, data, options = {}) =>
		apiRequest(endpoint, {
			method: "POST",
			body: JSON.stringify(data),
			...options,
		}),
	put: (endpoint, data, options = {}) =>
		apiRequest(endpoint, {
			method: "PUT",
			body: JSON.stringify(data),
			...options,
		}),
	delete: (endpoint, options = {}) =>
		apiRequest(endpoint, { method: "DELETE", ...options }),

	// File upload (for multipart/form-data)
	upload: (endpoint, formData, options = {}) => {
		const token = localStorage.getItem("token");
		const headers = {};
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}
		// Don't set Content-Type for FormData - browser will set it with boundary

		return apiRequest(endpoint, {
			method: "POST",
			body: formData,
			headers,
			...options,
		});
	},
};

// Handle authentication errors globally
export const handleAuthError = (error) => {
	if (error.isTokenExpired || error.code === "TOKEN_EXPIRED") {
		// Clear expired token
		localStorage.removeItem("token");
		localStorage.removeItem("isAdmin");

		// Show user-friendly message
		console.log("🔑 Token expired, clearing authentication");

		// You can also show a modal notification here if you have a global notification system
		if (typeof window !== "undefined") {
			window.alert("Your session has expired. Please log in again.");
		}

		// Force page reload to go to login
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	}

	return error.isTokenExpired;
};

export default api;
