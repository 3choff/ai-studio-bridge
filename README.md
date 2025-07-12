
# AI Studio Bridge

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/LICENSE-2.0)

AI Studio Bridge is a powerful two-part toolset designed to seamlessly connect your conversational AI workflow in Google AI Studio with your local development environment in Visual Studio Code.

It allows you to send prompts and instructions directly from an AI Studio chat to your editor with a single click, where they can be saved and acted upon.

## Core Components

The toolset consists of two extensions that work in tandem:

1.  **`AI Studio Bridge - Companion` (Chrome Extension):** This extension runs in your browser. It intelligently injects custom buttons into the Google AI Studio UI, allowing you to capture AI responses.

2.  **`AI Studio Bridge - Host` (VS Code Extension):** This extension runs inside VS Code. It hosts a small, local server that listens for commands from the Companion extension, and then performs actions within your editor, such as creating and opening files.

## 🚀 Features

### AI Studio Bridge - Companion (Chrome)

*   **Adds Custom Buttons:** Injects "Copy Markdown" and "Send to VS Code" icon buttons into every AI response block.
*   **Seamless UI Integration:**
    *   Buttons appear on hover for older responses and are always visible on the latest response, keeping the UI clean.
    *   Buttons are placed alongside native AI Studio actions for a natural feel.
    *   Buttons are hidden for non-essential blocks like the AI's "Thinking..." process.
*   **Intelligent Copying:** The "Copy" and "Send" actions programmatically click Google's own "Copy markdown" button to ensure perfect, high-fidelity markdown capture.
*   **Animated Tooltips:** Custom-built, animated tooltips provide clear information without being blocked by the site's UI.
*   **Rich Visual Feedback:** Buttons change icons and colors to provide instant feedback on actions (Sending, Success, Error, Server Off).
*   **Personalized Styling:** Includes optional CSS to prevent code block wrapping and to fine-tune button spacing for a cleaner look.

### AI Studio Bridge - Host (VS Code)

*   **On-Demand Server:** The local server does **not** run all the time. You have full control to start and stop it.
*   **Easy Controls:**
    *   A clickable **Status Bar Item** (`$(plug) AI Bridge: Off / On`) provides a clear visual indicator and a one-click toggle.
    *   Commands (`AI Bridge: Start/Stop Server`) are available in the **Command Palette** (`Ctrl+Shift+P`).
*   **Handshake Protocol:** The server includes a `/health` endpoint so the Companion extension can check if the server is running before attempting to send data.
*   **File Creation:** Receives prompts from the Companion and writes them to a file named `instructions.md` in the root of your currently open workspace.
*   **Integration with Cline:** Instead of just opening a file, it intelligently communicates with the **Cline** extension. It executes a command that tells Cline to reference the `instructions.md` file directly in its chat input, seamlessly bridging the gap between the AI's instructions and your chat-driven development workflow.

## 📸 Demo

*(This is a great place to add a GIF showing the workflow: clicking the "Send" button in Chrome and seeing the file pop up in VS Code.)*

## 🔧 Installation

Since these extensions are not on an official marketplace, you will need to install them manually from this GitHub repository.

### Prerequisites

*   You must have **Node.js** installed on your computer to install the dependencies for the VS Code extension.
*   This repository cloned or downloaded to your machine.

### Part 1: Install the `AI Studio Bridge - Host` (VS Code Extension)

1.  **Navigate to the Host Folder:** Open your computer's terminal and navigate into the VS Code extension's folder (e.g., `cd path/to/repository/ai-studio-bridge-host`).
2.  **Install Dependencies:** Run the command `npm install`. This will download the `express` and `cors` libraries.
3.  **Open the Project:** Open the `host` folder in a separate VS Code window.
4.  **Run the Extension:** Press `F5` on your keyboard. This will compile the extension and launch a new **"Extension Development Host"** window. Your server is now ready to be activated in this new window.

### Part 2: Install the `AI Studio Bridge - Companion` (Chrome Extension)

1.  **Open Chrome** and navigate to `chrome://extensions`.
2.  **Enable Developer Mode:** In the top-right corner, turn on the "Developer mode" toggle.
3.  **Load the Extension:**
    *   Click the **"Load unpacked"** button that appears on the top-left.
    *   A file dialog will open. Navigate to this repository's folder and select the folder for the Chrome extension (e.g., `ai-studio-bridge-companion`).
4.  The "AI Studio Bridge - Companion" extension will now appear in your list of extensions and is active.

---

## 💡 How to Use

1.  **Start the Host:** In your "Extension Development Host" VS Code window, click the `$(plug) AI Bridge: Off` text in the bottom status bar to turn it on. It should change to `$(plug) AI Bridge: On`.
2.  **Go to AI Studio:** Open or refresh a Google AI Studio page. You should now see your custom icon buttons appear on AI response blocks.
3.  **Send a Prompt:** Click the green "Send to VS Code" (`send`) icon on any AI response.
4.  **Check VS Code:**
    *   The `instructions.md` file will be created (or updated) in your VS Code workspace.
    *   The Cline chat panel will automatically become visible and focused.
    *   The mention (`@instructions.md`) will appear in the Cline chat input field, ready for your review.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.