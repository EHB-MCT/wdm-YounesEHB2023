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
		body: JSON.stringify({ userId, action, data, timestamp: new Date().toISOString() }),
	});
}

// Enhanced tracking functions for Phase 2
export const trackExerciseHover = (exerciseId, hoverDuration) => {
	trackEvent("exercise_hover", {
		exerciseId,
		duration: hoverDuration,
	});
};

export const trackExerciseView = (exerciseId, viewDuration) => {
	trackEvent("exercise_view", {
		exerciseId,
		duration: viewDuration,
		viewType: "page_view"
	});
};

export const trackTimeToClick = (exerciseId, timeOnPage) => {
	trackEvent("exercise_time_to_click", {
		exerciseId,
		timeOnPage,
	});
};

// Distinguish between exercise interaction types
export const trackExerciseSelect = (exerciseId, selectionType) => {
	trackEvent("exercise_select", {
		exerciseId,
		selectionType, // 'added_to_workout', 'view_details', 'bookmarked'
	});
};

export const trackExerciseComplete = (exerciseId, completionData) => {
	trackEvent("exercise_complete", {
		exerciseId,
		completionData, // { reps: 10, duration: 60, skipped: false }
	});
};

export const trackWorkoutSession = (sessionType, sessionData) => {
	trackEvent("workout_session", {
		sessionType, // 'start', 'end', 'abandon'
		sessionData
	});
};
