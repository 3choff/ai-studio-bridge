# Changelog

## [1.3.0] - 2025-07-13

### ✨ Added

-   **Custom Icon:** Added a custom SVG icon to give the extension a unique identity in the Extensions sidebar and Marketplace.
-   **License File:** Added an `Apache-2.0` license file to formally define the project's open-source terms.


## [1.2.0] - 2025-07-10

### ✨ Added

-   **Configurable Auto-Submit:** Introduced a new setting (`ai-studio-bridge.autoSubmit`) that allows users to choose whether instructions are immediately executed by Cline (`true`) or just mentioned in the chat for manual review (`false`). The default is `false` for a safer user experience.

## [1.1.0] - 2025-07-10

### ✨ Added

-   **Fully Automated Workflow:** The extension now leverages Cline's `submit: true` flag. When instructions are sent from AI Studio, they are now immediately executed as a new task in Cline, requiring no further user interaction.

### ♻️ Changed

-   The call to `cline.addFileMentionToChat` was updated to pass a configuration object instead of just a file path string.

## [1.0.0] - 2025-07-09

Official public release. This version includes major improvements to the extension's distribution, performance, project quality, and a more robust integration with Cline.

### ✨ Added

-   **VSIX Packaging:** The extension can now be packaged into a `.vsix` file for easy installation, removing the need for developers to run from source.
-   **Project License:** Added a `LICENSE` file to clarify open-source usage rights.
-   **Ignore File:** Added a `.vscodeignore` file to significantly reduce the final package size by excluding development files.

### ♻️ Changed

-   **Improved Cline Integration:** Updated the core logic to use the `cline.addFileMentionToChat` command, which is the official and most reliable method for this workflow.
-   **Simplified File Handling:** The extension no longer opens `instructions.md` in the editor at all. This process is now fully managed by the Cline extension, resulting in a cleaner user experience and simpler code.
-   **Project Cleanup:** Overhauled the project structure by removing all unnecessary template files and folders (`test/`, `vsc-extension-quickstart.md`, etc.).

### 🐞 Fixed

-   **Performance Optimization:** Corrected the `activationEvents` in `package.json` from a wildcard `"*"` to specific command triggers. This prevents the extension from loading unnecessarily on VS Code startup.
-   **Packaging Warnings:** Resolved all `vsce` packaging warnings, including adding the `repository` field to `package.json`.

## [0.2.0] - 2025-07-09

This version introduces a major workflow improvement by directly integrating with the Cline extension, creating a seamless, near-zero-click experience.

### ✨ Changed

-   **Direct Cline Integration:** The core workflow has been completely redesigned. Instead of opening `instructions.md` and requiring the user to copy/paste, the extension now directly executes the `cline.addToChat` command. This automatically populates the Cline chat input with the file mention `@instructions.md`.
-   The `instructions.md` file is now briefly opened in the background and closed immediately after its content is sent to Cline, keeping the user's editor workspace clean.

### ❌ Removed

-   The previous behavior of opening `instructions.md` and selecting all its content has been removed in favor of the more direct Cline integration.

## [0.1.0] - 2025-07-08

Initial release with core server functionality and UI controls.

### ✨ Added

-   **On-Demand Local Server:** Created a local Express.js server on `localhost:4000` that listens for `POST` requests from the browser companion.
-   **Server Controls:**
    -   Added a clickable Status Bar item (`AI Bridge: On/Off`) to easily start and stop the server.
    -   Registered commands (`AI Bridge: Start Server`, `AI Bridge: Stop Server`, `AI Bridge: Toggle Server`) for use in the Command Palette.
-   **Handshake Endpoint:** Implemented a `/health` endpoint for the browser companion to check if the server is running.
-   **File Creation and UI Control:**
    -   Receives prompts and writes them to a file named `instructions.md` in the current workspace root.
    -   Automatically opens the `instructions.md` file in the editor and selects its entire content upon receiving a prompt.
-   **Initial Project Setup:** Generated the extension, configured `package.json`, and set up activation events.
