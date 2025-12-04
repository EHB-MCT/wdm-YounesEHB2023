const API_URL = "http://localhost:5000/api/events";

export default async function trackEvent(action, data = {}) {
	try {
		const payload = {
			userId: "anonymous-user", 
			action,
			data,
			timestamp: new Date().toISOString(),
		};

		const response = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error("Tracking failed:", await response.text());
		}
	} catch (error) {
		console.error("Tracking error:", error);
	}
}
