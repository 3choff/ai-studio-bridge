# AI Studio Bridge - Host

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/LICENSE-2.0)

This is the VS Code component of the AI Studio Bridge toolset. It acts as a local server, listening for commands from the `AI Studio Bridge - Companion` Chrome extension to seamlessly integrate Google AI Studio with your local development workflow.

This extension is not useful on its own and is designed to work in tandem with its companion browser extension.

## Features

*   **Local Server:** Runs a secure, on-demand server on `localhost:4000` to receive instructions from the browser.
*   **Status Bar Toggle:** Easily start and stop the server with a single click on the `$(plug) AI Bridge: Off / On` item in the VS Code status bar.
*   **Cline Integration:** Automatically creates/updates an `instructions.md` file in your workspace root and then passes it as a file mention to the **Cline** extension for immediate use in its chat.
*   **Command Palette Access:** Control the server using the Command Palette (`Ctrl+Shift+P`) for quick access.

## How to Use

1.  Ensure you have a project folder open in VS Code.
2.  Click the `$(plug) AI Bridge: Off` text in the bottom status bar to start the server. The text will change to `$(plug) AI Bridge: On`.
3.  Go to the Google AI Studio website and use the "Send to VS Code" button provided by the Companion extension.
5.  **See the Magic in VS Code:**
    *   The `instructions.md` file is instantly created or updated in your project.
    *   The instruction set is **immediately submitted** to the Cline AI as a new task.
    *   Cline will activate and start generating a response, creating a fully automated workflow from browser to AI execution.

## Requirements

For this extension to be fully functional, you need:

1.  The **`AI Studio Bridge - Companion`** Chrome Extension.
2.  The **`Cline`** VS Code Extension installed from the Marketplace.

## Available Commands

The following commands are available in the Command Palette (`Ctrl+Shift+P`):

*   `AI Bridge: Start Server`
*   `AI Bridge: Stop Server`
*   `AI Bridge: Toggle Server`

## ⚙️ Configuration

This extension provides the following settings, which can be configured in the VS Code Settings UI (`Ctrl+,` or by right-clicking the extension):

*   **`ai-studio-bridge.autoSubmit`** (boolean, default: `false`):
    *   **If disabled (default):** Instructions are mentioned in the Cline chat input for you to review and edit before manually submitting.
    *   **If enabled:** Instructions are immediately submitted to the Cline AI for a fully automated workflow.

---

For the full project details, including the companion extension and complete setup guide, please visit the main [AI Studio Bridge GitHub repository](https://github.com/3choff/ai-studio-bridge).
