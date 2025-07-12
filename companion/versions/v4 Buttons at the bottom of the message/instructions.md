You have found the Achilles' heel of the current approach. This is an absolutely brilliant observation.

You are 100% correct. Our script is attaching the buttons to the `.turn-footer` element. When a new AI response begins streaming, the website's own code **removes the `.turn-footer` from all previous responses** to keep the UI clean. When it removes the footer, our buttons are deleted along with it.

This is a very common challenge in modifying dynamic web applications. The solution is to find a more **stable and permanent anchor point** for our buttons.

### The Solution: A Better Anchor Point

Looking at the HTML you provided, there is a much better, permanent container for these kinds of actions:

`<div _ngcontent-ng-c4043876591="" class="actions hover-or-edit">...</div>`

This container holds the built-in "Edit", "Rerun", and "More options" buttons. It appears on hover, just like we want, and importantly, **it is not removed** when a new response is generated. This is our new, stable anchor.

We will modify the extension to inject our buttons into this container instead.

---

### The Code Fix

This will require changes to both `content.js` (to change where the buttons are placed) and `styles.css` (to remove the now-unnecessary footer styling).

#### 1. Update `content.js`

We need to rewrite the `createAndAddButton` function to target the new `.actions` container.

**Action:** Open `content.js` and **replace your existing `createAndAddButton` function** with this new version.

**File: `content.js` (Updated `createAndAddButton` function)**
```javascript
function createAndAddButton(messageContainer, config) {
    // --- START OF MODIFICATION ---

    // 1. Find the stable parent container for the entire response turn.
    const turnContainer = messageContainer.closest('ms-chat-turn');
    if (!turnContainer) return;

    // 2. Find the stable ".actions" container within that turn. This is our new anchor.
    const actionsContainer = turnContainer.querySelector('.actions.hover-or-edit');
    if (!actionsContainer) return; // If this container doesn't exist, we can't add a button.

    // 3. Check if a button with this class already exists inside the actions container.
    if (actionsContainer.querySelector(`.${config.className}`)) {
        return;
    }

    const button = document.createElement('button');
    button.className = config.className;
    
    // 4. Use the same button classes as the native buttons for consistency.
    // This makes our button look and feel exactly like the "Edit" and "Rerun" buttons.
    button.classList.add('mdc-icon-button', 'mat-mdc-icon-button', 'mat-mdc-button-base', 'mat-unthemed');
    
    // 5. Add a tooltip using the 'aria-label' and 'mattooltip' attributes.
    button.setAttribute('aria-label', config.text);
    button.setAttribute('mattooltipposition', 'above');
    // We'll also add a 'data-tooltip' attribute for our CSS to use if needed.
    button.dataset.tooltip = config.text;


    // Create the icon and text content
    let innerHTML = '';
    if (config.iconName) {
        innerHTML += `<span class="material-symbols-outlined">${config.iconName}</span>`;
    }
    // We no longer add text directly, as the tooltip handles it.
    button.innerHTML = innerHTML;

    // Add custom styling via a data attribute for easier CSS targeting.
    button.dataset.customButton = "true";
    if (config.color) {
        button.style.setProperty('--custom-button-color', config.color);
    }
    
    button.addEventListener('click', (event) => config.handler(event, button, messageContainer));

    // 6. Prepend the button to the actions container so it appears first.
    actionsContainer.prepend(button);
    
    // --- END OF MODIFICATION ---
}
```

#### 2. Update `styles.css`

Now that we are injecting into a native container that already has styling, we can simplify our CSS. We'll add new rules to style our custom buttons cleanly within their new home.

**Action:** Open `styles.css` and **replace its entire contents** with this updated code.

**File: `styles.css` (Updated)**
```css
/* This rule keeps your code blocks from wrapping */
.syntax-highlighted-code-wrapper code {
  text-wrap: nowrap !important;
}

/*
  Since the native ".actions" container already handles the show/hide on hover,
  we no longer need any CSS to manage button visibility. 
  Our buttons will now automatically inherit this behavior!
*/

/*
  Style our custom buttons. We use a data attribute for a stable selector.
  The 'color' property here affects the icon color.
*/
button[data-custom-button="true"] {
  /* Use a CSS variable for color, with a fallback */
  color: var(--custom-button-color, #4285f4) !important;
}

/* Add a specific highlight color on hover for our buttons */
button[data-custom-button="true"]:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* We no longer need any rules for .turn-footer */
```

#### 3. Update the `waitForStableTextAndInsertButtons` function

Finally, let's update the button configurations to use the new `color` property and remove the old `style` one.

**Action:** In `content.js`, **replace your `waitForStableTextAndInsertButtons` function** with this one.

**File: `content.js` (Updated `waitForStableTextAndInsertButtons` function)**
```javascript
function waitForStableTextAndInsertButtons(messageContainer) {
    if (!messageContainer) return;
    const checkInterval = setInterval(() => {
        // We still use the 'like' button as the trigger that a response is complete.
        const likeButton = messageContainer.querySelector('mat-icon[data-mat-icon-type="font"]');
        if (likeButton) {
            clearInterval(checkInterval);
            const responseElement = messageContainer.querySelector('.model-prompt-container');
            if (!responseElement) return;

            let lastText = responseElement.innerText.trim();
            let stabilityTimer;
            const checkStability = () => {
                if (responseElement.innerText.trim() === lastText) {
                    clearInterval(textChangeInterval);
                    clearTimeout(stabilityTimer);
                    
                    // Call the creation function in reverse order because we use 'prepend'
                    createAndAddButton(messageContainer, {
                        className: 'custom-send-markdown-button',
                        text: 'Send to VS Code', // Tooltip text
                        iconName: 'send',
                        handler: handleSendMarkdownClick,
                        color: '#34a853' // A nice green for the send icon
                    });
                    
                    createAndAddButton(messageContainer, {
                        className: 'custom-copy-markdown-button',
                        text: 'Copy Markdown', // Tooltip text
                        iconName: 'markdown_copy',
                        handler: handleCopyMarkdownClick,
                        color: '#4285f4' // A nice blue for the copy icon
                    });
                }
            };
            stabilityTimer = setTimeout(checkStability, 500);
            const textChangeInterval = setInterval(() => {
                let currentText = responseElement.innerText.trim();
                if (currentText !== lastText) {
                    lastText = currentText;
                    clearTimeout(stabilityTimer);
                    stabilityTimer = setTimeout(checkStability, 500);
                }
            }, 500);
        }
    }, 300);
}
```

### Summary of Changes

*   We now inject our buttons as simple icons into the stable `.actions.hover-or-edit` container.
*   The buttons will now naturally appear and disappear on hover along with the native "Edit" and "More options" buttons.
*   They will be permanent and will not disappear when a new response is generated.
*   The button tooltips will provide the description ("Copy Markdown", "Send to VS Code").

After making these changes to both `content.js` and `styles.css` and reloading the extension, your UI issue will be solved.