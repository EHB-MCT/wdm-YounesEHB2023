export async function trackEvent(action, data = {}) {
    try {
        await fetch("http://localhost:5000/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "anonymous-user",   
                action: action,             
                data: data                  
            }),
        });
    } catch (err) {
        console.error("Event tracking failed:", err);
    }
}
