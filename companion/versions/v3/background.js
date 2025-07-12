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

            const prompt = `Your task is to intelligently implement the following instructions into the existing codebase.

                The instructions may contain incomplete code snippets, pseudo-code, or omissions for brevity (e.g., using '...').

                Your primary responsibility is to use the *existing files* in the current directory as the source of truth to understand the context. Apply the changes to produce a complete, correct, and functional result.

                **CRITICAL RULE:** Do not leave any partial code or '...' placeholders in the final implementation. If a snippet is incomplete, you must fill in the gaps using the surrounding code from the original file.

                Here the instructions to implement:

                ${markdownContent}`;


            const payload = {
                prompt: prompt
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
