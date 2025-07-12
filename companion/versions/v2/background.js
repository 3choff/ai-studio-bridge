chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message is the one we're expecting
    if (request.action === "sendMarkdown") {
        const markdownContent = request.content;
        const payload = {
            // We'll add the instruction prompt here, as planned
            prompt: `Implement these changes:\n\n${markdownContent}`
        };

        // Perform the fetch request to the local server
        fetch("http://localhost:4000/save-command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                // If the server responds with an error (e.g., 400, 500)
                return response.text().then(text => Promise.reject(new Error(text || `Server responded with status: ${response.status}`)));
            }
            return response.json();
        })
        .then(data => {
            console.log("Success:", data);
            // Send a success response back to the content script
            sendResponse({ status: "success", message: "Sent successfully!" });
        })
        .catch(error => {
            console.error("Error sending to localhost:", error);
            // Send an error response back to the content script
            sendResponse({ status: "error", message: error.message });
        });

        // Return true to indicate that we will be sending a response asynchronously
        return true;
    }
});