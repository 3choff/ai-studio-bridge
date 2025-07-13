# AI Studio Bridge - Companion (Chrome Extension)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/LICENSE-2.0)

This is the browser-side component of the AI Studio Bridge toolset. It runs as a Chrome extension to enhance the Google AI Studio user interface and communicate with the `AI Studio Bridge - Host` in VS Code.

For full project details and installation instructions, please see the [main project README](../../README.md).

## Core Functionality

This extension is responsible for:
1.  **DOM Manipulation:** Using a content script (`src/content.js`) to inject "Copy Markdown" and "Send to VS Code" buttons into the AI Studio UI.
2.  **UI Styling:** Applying custom styles (`src/styles.css`) to the injected buttons, tooltips, and other UI elements for a seamless look and feel.
3.  **Communication:** Using a background service worker (`src/background.js`) to handle button clicks and send the captured AI response to the local server hosted by the VS Code extension.

## Features

*   **Custom Buttons:** Adds "Copy Markdown" and "Send to VS Code" buttons to AI response blocks.
*   **Rich Feedback:** Provides visual feedback on button clicks (Sending, Success, Error, Server Off).
*   **Theme-Aware Tooltips:** Custom tooltips that adapt to AI Studio's light or dark theme.
*   **Intelligent Copying:** Leverages AI Studio's native "Copy markdown" functionality to ensure perfect data capture.
*   **Server Health Check:** Pings the host server's `/health` endpoint before attempting to send data.

## Local Development Setup

To load this extension for development:
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **"Developer mode"** in the top-right corner.
3.  Click the **"Load unpacked"** button.
4.  Select this folder (`ai-studio-bridge-companion`) in the file dialog.

The extension will now be active. Any changes you make to the source files will require you to click the "Reload" button for the extension on the `chrome://extensions` page.