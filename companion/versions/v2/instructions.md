Step 2: Update the Chrome Extension (background.js)
This is where the main logic for the handshake will go. We will wrap the existing fetch call in a new health check fetch.
In your Chrome extension folder, replace the entire contents of background.js with this updated version:
File: background.js (Updated)
Generated javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendMarkdown") {
        
        // We wrap our logic in an async IIFE (Immediately Invoked Function Expression)
        // to allow the use of await, while still being able to `return true`.
        (async () => {
            // --- STEP 1: PERFORM THE HANDSHAKE (HEALTH CHECK) ---
            try {
                const healthResponse = await fetch("http://localhost:4000/health");
                if (!healthResponse.ok) {
                    // The server is on, but responded with an error for some reason.
                    throw new Error(`Server health check failed with status: ${healthResponse.status}`);
                }
                // If we get here, the health check was successful.
            } catch (error) {
                // THIS CATCH BLOCK IS THE MOST COMMON CASE: THE SERVER IS OFF.
                // The fetch itself will fail with a TypeError (e.g., net::ERR_CONNECTION_REFUSED).
                console.log("Health check failed. The VS Code server is likely not running.");
                sendResponse({ status: 'error', message: 'AI Bridge server is not running.' });
                return; // Gracefully abort here.
            }

            // --- STEP 2: IF HANDSHAKE SUCCEEDS, SEND THE REAL DATA ---
            const markdownContent = request.content;
            const payload = {
                prompt: `Implement these changes:\n\n${markdownContent}`
            };

            try {
                const sendResponseData = await fetch("http://localhost:4000/save-command", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                if (!sendResponseData.ok) {
                    throw new Error(`Server responded with status: ${sendResponseData.status}`);
                }

                const result = await sendResponseData.json();
                console.log("Success:", result);
                sendResponse({ status: "success", message: "Sent successfully!" });

            } catch (error) {
                console.error("Error sending data to localhost:", error);
                sendResponse({ status: "error", message: error.message });
            }
        })();

        // Return true to indicate that sendResponse will be called asynchronously.
        return true;
    }
});
Use code with caution.
JavaScript
Step 3: Update content.js for Better UI Feedback
To make the user experience perfect, let's update the "Send MD" button handler to show the more specific error message.
In content.js, find the handleSendMarkdownClick function and update the sendMessage callback:
Generated javascript
// In handleSendMarkdownClick, find the chrome.runtime.sendMessage call
// and update its callback to look like this:

chrome.runtime.sendMessage({ action: "sendMarkdown", content: markdownContent }, (response) => {
    if (response && response.status === "success") {
        button.innerHTML = 'Sent!';
        button.style.backgroundColor = '#34a853';
    } else {
        const errorMessage = response ? response.message : 'Unknown error';
        console.error('Failed to send:', errorMessage);
        
        // --- START OF UI FIX ---
        // Display a more helpful message on the button itself.
        if (errorMessage.includes('not running')) {
            button.innerHTML = 'Server Off';
        } else {
            button.innerHTML = 'Error!';
        }
        button.style.backgroundColor = '#ea4335'; // Red for any error
        // --- END OF UI FIX ---
    }

    // Reset the button after a couple of seconds
    setTimeout(() => {
        button.innerHTML = originalButtonHTML;
        button.style.backgroundColor = originalButtonStyle;
        button.disabled = false;
    }, 2500); // Increased timeout slightly for error readability
});