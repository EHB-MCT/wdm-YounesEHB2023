export default async function trackEvent(action, data = {}) {
	const token = localStorage.getItem("token");
	const userId = localStorage.getItem("userId");

	if (!token || !userId) return;

	await fetch("http://localhost:5000/api/events", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ userId, action, data }),
	});
}
