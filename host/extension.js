const vscode = require('vscode');
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

let server;
let statusBarItem;
let isServerRunning = false;

function startServer() {
    if (isServerRunning) {
        vscode.window.showInformationMessage('AI Bridge server is already running.');
        return;
    }

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'AI Bridge server is running.' });
    });

    /**
     * Handles the incoming request from the browser extension to save the command.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    const handleSaveCommand = async (req, res) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("AI Studio Bridge: Please open a project folder to save the file.");
            return res.status(400).send({ message: "No workspace folder open." });
        }

        const promptContent = req.body.prompt;
        if (!promptContent) {
            return res.status(400).send({ message: "No prompt content received." });
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');

        try {
            await fs.writeFile(filePath, promptContent, 'utf8');

            // --- NEW: Read the setting from VS Code configuration ---
            const configuration = vscode.workspace.getConfiguration('ai-studio-bridge');
            const shouldSubmit = configuration.get('autoSubmit');
            // --- END NEW ---

            // STEP 5: Execute the Cline command using the setting's value.
            await vscode.commands.executeCommand('cline.addFileMentionToChat', {
                filePath: filePath,
                submit: shouldSubmit // Use the value from the setting here
            });
            
            const successMessage = shouldSubmit ? 'Instructions submitted to Cline!' : 'Instructions mentioned in Cline chat!';
            vscode.window.showInformationMessage(successMessage);
            
            res.status(200).json({ message: "Instructions handled successfully." });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to send instructions to Cline: ${errorMessage}`);
            
            res.status(500).send({ message: "Failed to handle the file or command on the server." });
        }
    };

    app.post('/save-command', handleSaveCommand);

    server = app.listen(4000, () => {
        console.log('AI Bridge server is listening on http://localhost:4000');
        isServerRunning = true;
        updateStatusBar();
        vscode.window.showInformationMessage('AI Bridge server started!');
    }).on('error', (err) => {
        vscode.window.showErrorMessage(`AI Bridge server failed to start: ${err.message}`);
        isServerRunning = false;
        updateStatusBar();
    });
}

function stopServer() {
    if (!isServerRunning || !server) {
        vscode.window.showInformationMessage('AI Bridge server is already stopped.');
        return;
    }
    server.close(() => {
        console.log('AI Bridge server has been shut down.');
        isServerRunning = false;
        server = null;
        updateStatusBar();
        vscode.window.showInformationMessage('AI Bridge server stopped.');
    });
}

function updateStatusBar() {
    if (!statusBarItem) return;
    if (isServerRunning) {
        statusBarItem.text = `$(plug) AI Bridge: On`;
        statusBarItem.tooltip = 'Click to stop the AI Bridge server';
        statusBarItem.backgroundColor = undefined;
    } else {
        statusBarItem.text = `$(plug) AI Bridge: Off`;
        statusBarItem.tooltip = 'Click to start the AI Bridge server';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your "AI Studio Bridge" extension is now active!');

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'ai-studio-bridge.toggleServer';
    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(
        vscode.commands.registerCommand('ai-studio-bridge.startServer', startServer)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('ai-studio-bridge.stopServer', stopServer)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('ai-studio-bridge.toggleServer', () => {
            if (isServerRunning) {
                stopServer();
            } else {
                startServer();
            }
        })
    );

    updateStatusBar();
    statusBarItem.show();
}

function deactivate() {
    if (server) {
      server.close();
    }
}

module.exports = {
    activate,
    deactivate
}
