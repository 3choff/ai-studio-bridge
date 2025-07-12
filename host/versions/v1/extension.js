// Import all necessary modules
const vscode = require('vscode');
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

// Global variables to hold our server instance, status bar item, and state
let server;
let statusBarItem;
let isServerRunning = false;

// --- Server and UI Functions ---

function startServer() {
    if (isServerRunning) {
        vscode.window.showInformationMessage('AI Bridge server is already running.');
        return;
    }

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Add a new /health endpoint for the handshake check.
    // This is a simple GET request that just confirms the server is alive.
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'AI Bridge server is running.' });
    });

    // v1
    // const handleSaveCommand = async (req, res) => {
    //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    //     if (!workspaceFolder) {
    //         vscode.window.showErrorMessage("AI Bridge: Please open a project folder to save the file.");
    //         return res.status(400).send({ message: "No workspace folder open." });
    //     }
    //     const promptContent = req.body.prompt;
    //     if (!promptContent) {
    //         return res.status(400).send({ message: "No prompt content received." });
    //     }
    //     const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');
    //     try {
    //         await fs.writeFile(filePath, promptContent, 'utf8');
            
    //         const docUri = vscode.Uri.file(filePath);
    //         const doc = await vscode.workspace.openTextDocument(docUri);
    //         const editor = await vscode.window.showTextDocument(doc);
            
    //         const fullRange = new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end);
    //         editor.selection = new vscode.Selection(fullRange.start, fullRange.end);
            
    //         res.status(200).json({ message: "Command saved and file opened successfully." });
    //     } catch (error) {
    //         vscode.window.showErrorMessage(`Failed to write file: ${error.message}`);
    //         res.status(500).send({ message: "Failed to handle the file on the server." });
    //     }
    // };

    // v2
    // const handleSaveCommand = async (req, res) => {
    //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    //     if (!workspaceFolder) {
    //         vscode.window.showErrorMessage("AI Studio Bridge: Please open a project folder to save the file.");
    //         return res.status(400).send({ message: "No workspace folder open." });
    //     }

    //     const promptContent = req.body.prompt;
    //     if (!promptContent) {
    //         return res.status(400).send({ message: "No prompt content received." });
    //     }

    //     const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');
    //     const docUri = vscode.Uri.file(filePath);

    //     try {
    //         // --- START OF DEFINITIVE FIX ---

    //         // STEP 1: Ensure the document exists in a VS Code editor tab.
    //         // This will create it in memory if it's new, or open the existing one.
    //         const editor = await vscode.window.showTextDocument(docUri, { preview: false, preserveFocus: false, viewColumn: vscode.ViewColumn.Active });
    //         const document = editor.document;

    //         // STEP 2: Create a WorkspaceEdit to replace the entire document content.
    //         // This is the API-native way to do a "file write" and avoids all race conditions.
    //         const edit = new vscode.WorkspaceEdit();
    //         // Create a range that covers the entire document, from start to finish.
    //         const fullRange = new vscode.Range(
    //             document.positionAt(0), 
    //             document.positionAt(document.getText().length)
    //         );

    //         // Describe the replacement operation.
    //         edit.replace(docUri, fullRange, promptContent);
            
    //         // Apply the edit.
    //         await vscode.workspace.applyEdit(edit);

    //         // STEP 3: Save the document to ensure the changes are flushed to disk.
    //         await document.save();

    //         // STEP 4: Select the new content. This will now reliably work.
    //         const newFullRange = new vscode.Range(
    //             document.positionAt(0),
    //             document.positionAt(document.getText().length)
    //         );
    //         editor.selection = new vscode.Selection(newFullRange.start, newFullRange.end);
    //         editor.revealRange(newFullRange, vscode.TextEditorRevealType.InCenter);
            
    //         // STEP 5: Give VS Code a moment to register the selection context.
    //         await new Promise(resolve => setTimeout(resolve, 100));
            
    //         // STEP 6: Execute the command.
    //         await vscode.commands.executeCommand('cline.addToChat');

    //         // We will leave the instructions.md file open for review.

    //         // --- END OF DEFINITIVE FIX ---

    //         vscode.window.showInformationMessage('Prompt sent to Cline!');
    //         res.status(200).json({ message: "Command sent to Cline successfully." });

    //     } catch (error) {
    //         vscode.window.showErrorMessage(`Failed to send to Cline: ${error.message}`);
    //         res.status(500).send({ message: "Failed to handle the file or command on the server." });
    //     }
    // };

    // v3
    // const handleSaveCommand = async (req, res) => {
    //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    //     if (!workspaceFolder) {
    //         vscode.window.showErrorMessage("AI Studio Bridge: Please open a project folder to save the file.");
    //         return res.status(400).send({ message: "No workspace folder open." });
    //     }

    //     const promptContent = req.body.prompt;
    //     if (!promptContent) {
    //         return res.status(400).send({ message: "No prompt content received." });
    //     }

    //     const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');

    //     try {
    //         // STEP 1: Write the instructions to the file.
    //         await fs.writeFile(filePath, promptContent, 'utf8');

    //         // STEP 2: Open the file and ensure it gets focus.
    //         const docUri = vscode.Uri.file(filePath);
    //         const doc = await vscode.workspace.openTextDocument(docUri);
    //         const editor = await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: false });

    //         // STEP 3: Select all the text in the now-active editor.
    //         const firstLine = doc.lineAt(0);
    //         const lastLine = doc.lineAt(doc.lineCount - 1);
    //         const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
    //         editor.selection = new vscode.Selection(fullRange.start, fullRange.end);
            
    //         // STEP 4: Give VS Code a moment to register the selection context.
    //         await new Promise(resolve => setTimeout(resolve, 100));
            
    //         // STEP 5: Execute the correct command, which we now know is 'cline.addToChat'.
    //         await vscode.commands.executeCommand('cline.addToChat');
            
    //         // STEP 6: Clean up by closing the temporary editor tab.
    //         setTimeout(() => {
    //             vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    //         }, 500);

    //         vscode.window.showInformationMessage('Prompt sent to Cline!');
    //         res.status(200).json({ message: "Command sent to Cline successfully." });

    //     } catch (error) {
    //         vscode.window.showErrorMessage(`Failed to send to Cline: ${error.message}`);
    //         res.status(500).send({ message: "Failed to handle the file or command on the server." });
    //     }
    // };

    // v4 addPromptToChat
    // const handleSaveCommand = async (req, res) => {
    //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    //     if (!workspaceFolder) {
    //         vscode.window.showErrorMessage("AI Studio Bridge: Please open a project folder to save the file.");
    //         return res.status(400).send({ message: "No workspace folder open." });
    //     }

    //     const promptContent = req.body.prompt;
    //     if (!promptContent) {
    //         return res.status(400).send({ message: "No prompt content received." });
    //     }

    //     const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');

    //     try {
    //         // STEP 1: Write the instructions to the file (this requirement stays the same).
    //         await fs.writeFile(filePath, promptContent, 'utf8');

    //         // ---- NEW, SIMPLIFIED LOGIC ----
    //         // STEP 2: Directly execute your new command, passing the prompt content as an argument.
    //         // This replaces all the old steps of opening, selecting, and closing the file.
    //         await vscode.commands.executeCommand('cline.addPromptToChat', promptContent);
    //         // --------------------------------

    //         vscode.window.showInformationMessage('Prompt sent to Cline!');
    //         res.status(200).json({ message: "Command sent to Cline successfully." });

    //     } catch (error) {
    //         // The error handling remains the same.
    //         const errorMessage = error instanceof Error ? error.message : String(error);
    //         vscode.window.showErrorMessage(`Failed to send to Cline: ${errorMessage}`);
    //         res.status(500).send({ message: "Failed to handle the file or command on the server." });
    //     }
    // };
    
    // v5 addFileMentionToChat
    const handleSaveCommand = async (req, res) => {
        // STEP 1: Get the current workspace folder.
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("AI Studio Bridge: Please open a project folder to save the file.");
            return res.status(400).send({ message: "No workspace folder open." });
        }

        // STEP 2: Get the prompt content from the request body.
        const promptContent = req.body.prompt;
        if (!promptContent) {
            return res.status(400).send({ message: "No prompt content received." });
        }

        // STEP 3: Define the file path for 'instructions.md'.
        const filePath = path.join(workspaceFolder.uri.fsPath, 'instructions.md');

        try {
            // STEP 4: Write the latest instructions to the 'instructions.md' file.
            // This ensures the file is up-to-date before it's mentioned.
            await fs.writeFile(filePath, promptContent, 'utf8');

            // STEP 5: Execute the new 'cline.addFileMentionToChat' command.
            // We pass the absolute path to the file as an argument.
            // Cline will handle focusing its UI and adding the '@' mention to the chat input.
            await vscode.commands.executeCommand('cline.addFileMentionToChat', filePath);
            
            // Let the user know the operation was successful.
            vscode.window.showInformationMessage('Instructions sent to Cline!');
            
            // Send a success response back to the client that made the request.
            res.status(200).json({ message: "Instructions file updated and mentioned in Cline successfully." });

        } catch (error) {
            // If anything goes wrong, catch the error.
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to send instructions to Cline: ${errorMessage}`);
            
            // Send an error response back to the client.
            res.status(500).send({ message: "Failed to handle the file or command on the server." });
        }
    };

    // Now, assign the named function to the route. This resolves the type ambiguity.
    app.post('/save-command', handleSaveCommand);

    // --- END OF FIX ---


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
    if (!statusBarItem) return; // Guard against running before statusBarItem is created
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

// --- Activation and Deactivation ---

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
    // Ensure the server is stopped when VS Code closes
    if (server) {
      server.close();
    }
}

module.exports = {
    activate,
    deactivate
}
