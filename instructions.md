Your task is to intelligently implement the following instructions into the existing codebase.

The instructions may contain incomplete code snippets, pseudo-code, or omissions for brevity (e.g., using '...').

Your primary responsibility is to use the *existing files* in the current directory as the source of truth to understand the context. Apply the changes to produce a complete, correct, and functional result.

**CRITICAL RULE:** Do not leave any partial code or '...' placeholders in the final implementation. If a snippet is incomplete, you must fill in the gaps using the surrounding code from the original file.

Here the instructions to implement:

"Of course. Getting the Git structure right is the most important step before publishing. You've correctly identified the problem: you have a Git repository *inside* your `host` folder, but you need one at the root `AI-STUDIO-BRIDGE` level to track everything together.

Here is a safe, step-by-step guide to fix this and prepare your project perfectly.

---

### The Plan

1.  **Remove** the incorrect, nested Git repository from the `host` folder.
2.  **Initialize** a new, correct Git repository at the root `AI-STUDIO-BRIDGE` folder.
3.  **Create** a master `.gitignore` file to ignore unnecessary files from both projects.
4.  **Commit** all your project files.
5.  **Connect** your local repository to a new repository on GitHub.

---

### Step 1: Clean Up the Nested Git Repository

First, we need to delete the `.git` folder that is currently inside `host`. This will *not* delete your code; it only removes the Git history from that subfolder.

1.  Open your terminal or command prompt.
2.  Navigate **into** the `host` folder:
    ```sh
    cd path/to/your/project/AI-STUDIO-BRIDGE/host
    ```
3.  Now, run the command to remove the `.git` directory.
    *   On **Windows** (PowerShell or Command Prompt):
        ```cmd
        rmdir /s /q .git
        ```
    *   On **macOS / Linux**:
        ```sh
        rm -rf .git
        ```

### Step 2: Initialize the Root Repository

Now, let's create the correct repository at the top level.

1.  Navigate back to your root `AI-STUDIO-BRIDGE` folder:
    ```sh
    cd ..
    ```
2.  Initialize the new repository:
    ```sh
    git init
    ```
    You should see a message like `Initialized empty Git repository in C:/path/to/your/project/AI-STUDIO-BRIDGE/.git/`.

### Step 3: Create the Root `.gitignore` File

This is a crucial step to keep your repository clean. Create a single file named `.gitignore` in the **root** `AI-STUDIO-BRIDGE` folder.

Copy and paste the following content into that new `.gitignore` file. It's designed to handle both the Chrome and VS Code extension folders.

```
# General
.DS_Store
Thumbs.db

# VS Code Host Extension
/host/node_modules/
/host/.vscode/
/host/*.vsix
/host/instructions.md

# Chrome Companion Extension
/companion/instructions.md

# Log files
*.log
npm-debug.log*
```

### Step 4: Make Your First Commit

Now that your repository is clean and correctly structured, let's add all your code.

1.  Make sure you are still in the root `AI-STUDIO-BRIDGE` folder.
2.  Stage all your files for the first commit:
    ```sh
    git add .
    ```
3.  Commit the files with a descriptive message:
    ```sh
    git commit -m "Initial commit of AI Studio Bridge project"
    ```

### Step 5: Connect to GitHub and Push

The final step is to create a repository on GitHub and push your code to it.

1.  **On GitHub.com:**
    *   Go to your profile and create a **new repository**.
    *   Name it `ai-studio-bridge`.
    *   Make sure it's **Public**.
    *   **Do not** initialize it with a README, license, or .gitignore file (because you've already created them).
    *   Click "Create repository".

2.  **Back in your terminal:**
    *   GitHub will show you a URL for your new repository. Copy it.
    *   Link your local repository to the remote one on GitHub. (Replace the URL with your own).
        ```sh
        git remote add origin https://github.com/your-username/ai-studio-bridge.git
        ```
    *   It's a best practice to rename the default branch to `main`:
        ```sh
        git branch -M main
        ```
    *   Push your code to GitHub for the first time:
        ```sh
        git push -u origin main
        ```

---

And that's it! Your project is now perfectly structured in a single Git repository, all your files are committed, and it's backed up on GitHub. You are ready to share it with the world."