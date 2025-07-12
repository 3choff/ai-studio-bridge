
// --- (Placeholder-related code can remain as is) ---
const DESIRED_PLACEHOLDER_TEXT = "Type something";
let textareaSpecificObserver = null;
let rollingPlaceholderSpecificObserver = null;

function disconnectSpecificObservers() {
    if (textareaSpecificObserver) {
        textareaSpecificObserver.disconnect();
        textareaSpecificObserver = null;
    }
    if (rollingPlaceholderSpecificObserver) {
        rollingPlaceholderSpecificObserver.disconnect();
        rollingPlaceholderSpecificObserver = null;
    }
}

function ensureStaticInputPlaceholder() {
    // Target the textarea element
    const textarea = document.querySelector('textarea.textarea.gmat-body-medium, textarea[placeholder*="example prompt"], textarea[aria-label*="example prompt"]');
    if (textarea) {
        if (textarea.placeholder !== DESIRED_PLACEHOLDER_TEXT) {
            textarea.placeholder = DESIRED_PLACEHOLDER_TEXT;
        }
        const currentAriaLabel = textarea.getAttribute('aria-label');
        if (currentAriaLabel && currentAriaLabel.includes("example prompt") && currentAriaLabel !== DESIRED_PLACEHOLDER_TEXT) {
            textarea.setAttribute('aria-label', DESIRED_PLACEHOLDER_TEXT);
        }

        if (!textareaSpecificObserver) {
            textareaSpecificObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes') {
                        if (mutation.attributeName === 'placeholder' && textarea.placeholder !== DESIRED_PLACEHOLDER_TEXT) {
                            textarea.placeholder = DESIRED_PLACEHOLDER_TEXT;
                        }
                        if (mutation.attributeName === 'aria-label') {
                            const newAriaLabel = textarea.getAttribute('aria-label');
                            if (newAriaLabel && newAriaLabel.includes("example prompt") && newAriaLabel !== DESIRED_PLACEHOLDER_TEXT) {
                                textarea.setAttribute('aria-label', DESIRED_PLACEHOLDER_TEXT);
                            }
                        }
                    }
                });
            });
            textareaSpecificObserver.observe(textarea, { attributes: true });
        }
    } else {
        if (textareaSpecificObserver) textareaSpecificObserver.disconnect();
        textareaSpecificObserver = null;
    }

    // Target the visual rolling placeholder element
    const rollingPlaceholder = document.querySelector('ms-input-rolling-placeholder');
    if (rollingPlaceholder) {
        if (rollingPlaceholder.textContent.trim() !== DESIRED_PLACEHOLDER_TEXT) {
            while (rollingPlaceholder.firstChild) {
                rollingPlaceholder.removeChild(rollingPlaceholder.firstChild);
            }
            rollingPlaceholder.textContent = DESIRED_PLACEHOLDER_TEXT;
        }

        if (!rollingPlaceholderSpecificObserver) {
            rollingPlaceholderSpecificObserver = new MutationObserver(mutations => {
                if (rollingPlaceholder.textContent.trim() !== DESIRED_PLACEHOLDER_TEXT) {
                    while (rollingPlaceholder.firstChild) {
                        rollingPlaceholder.removeChild(rollingPlaceholder.firstChild);
                    }
                    rollingPlaceholder.textContent = DESIRED_PLACEHOLDER_TEXT;
                }
            });
            rollingPlaceholderSpecificObserver.observe(rollingPlaceholder, { childList: true, characterData: true, subtree: true });
        }
    } else {
        if (rollingPlaceholderSpecificObserver) rollingPlaceholderSpecificObserver.disconnect();
        rollingPlaceholderSpecificObserver = null;

        const placeholderOverlayDiv = document.querySelector('div.placeholder-overlay[slot="autosize-textarea"]');
        if (placeholderOverlayDiv && !placeholderOverlayDiv.querySelector('ms-input-rolling-placeholder')) {
             if (placeholderOverlayDiv.textContent.trim() !== DESIRED_PLACEHOLDER_TEXT) {
                while (placeholderOverlayDiv.firstChild) {
                    placeholderOverlayDiv.removeChild(placeholderOverlayDiv.firstChild);
                }
                placeholderOverlayDiv.textContent = DESIRED_PLACEHOLDER_TEXT;
            }
        }
    }
}

function observeMessages() {
  ensureStaticInputPlaceholder();
  const mainBodyObserver = new MutationObserver((mutationsList, observer) => {
    ensureStaticInputPlaceholder();
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const messageContainers = node.querySelectorAll('.model-prompt-container');
            messageContainers.forEach(container => {
              if (container.parentElement) {
                  waitForStableTextAndInsertButtons(container.parentElement);
              }
            });
            if (node.querySelector && node.matches && node.querySelector('.model-prompt-container')) {
                const modelPromptInNode = node.querySelector('.model-prompt-container');
                if (modelPromptInNode && modelPromptInNode.parentElement) {
                    waitForStableTextAndInsertButtons(modelPromptInNode.parentElement);
                }
            }
          }
        }
      }
    }
  });
  mainBodyObserver.observe(document.body, { childList: true, subtree: true });
}

// function waitForStableTextAndInsertButtons(messageContainer) {
//   if (!messageContainer) return;
//   const checkInterval = setInterval(() => {
//     const likeButton = messageContainer.querySelector('mat-icon[data-mat-icon-type="font"]');
//     if (likeButton) {
//       clearInterval(checkInterval);
//       const responseElement = messageContainer.querySelector('.model-prompt-container');
//       if (!responseElement) return;

//       let lastText = responseElement.innerText.trim();
//       let stabilityTimer;
//       const checkStability = () => {
//         if (responseElement.innerText.trim() === lastText) {
//           clearInterval(textChangeInterval);
//           clearTimeout(stabilityTimer);
//           // Button temporarily disabled, DO NOT DELETE THIS COMMENTED CODE
//         //   createAndAddButton(messageContainer, {
//         //       className: 'custom-copy-text-button',
//         //       text: 'Copy Text',
//         //       handler: handleCopyTextClick
//         //   });
//           createAndAddButton(messageContainer, {
//               className: 'custom-copy-markdown-button',
//               text: 'Copy Markdown',
//               handler: handleCopyMarkdownClick
//           });
//           createAndAddButton(messageContainer, {
//               className: 'custom-send-markdown-button',
//               text: 'Send Markdown',
//               handler: handleSendMarkdownClick,
//           });
//         }
//       };
//       stabilityTimer = setTimeout(checkStability, 500);
//       const textChangeInterval = setInterval(() => {
//         let currentText = responseElement.innerText.trim();
//         if (currentText !== lastText) {
//           lastText = currentText;
//           clearTimeout(stabilityTimer);
//           stabilityTimer = setTimeout(checkStability, 500);
//         }
//       }, 500);
//     }
//   }, 300);
// }

// function createAndAddButton(messageContainer, config) {
//     if (!messageContainer || messageContainer.querySelector(`.${config.className}`)) {
//         return;
//     }
//     const button = document.createElement('button');
//     button.className = config.className;

//     button.innerHTML = config.text;
//     button.style.cssText = `
//         padding: 4px 12px; background-color: #4285f4; color: white; border: none;
//         border-radius: 4px; cursor: pointer; font-size: 13px; margin-left: 8px; float: right;
//     `;
//     button.addEventListener('click', (event) => config.handler(event, button, messageContainer));

//     let footerContainer = messageContainer.querySelector('.turn-footer');
//     if (!footerContainer) {
//         footerContainer = document.createElement('div');
//         footerContainer.className = 'turn-footer custom-extension-footer';
//         footerContainer.style.paddingTop = '8px';
//         footerContainer.style.textAlign = 'right';
//         footerContainer.style.clear = 'both';
//         messageContainer.appendChild(footerContainer);
//     }
//     if (!footerContainer.querySelector(`.${config.className}`)) {
//         footerContainer.appendChild(button);
//     }
// }

// This function is deprecated, DO NOT DELETE THIS CODE


function waitForStableTextAndInsertButtons(messageContainer) {
    if (!messageContainer) return;
    const checkInterval = setInterval(() => {
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
                    
                    // --- START OF MODIFICATION ---
                    // Add the 'iconName' property to each button's config
                    createAndAddButton(messageContainer, {
                        className: 'custom-send-markdown-button',
                        text: 'Send',
                        iconName: 'send', // A fitting icon for sending
                        handler: handleSendMarkdownClick,
                        style: `background-color:rgb(52, 75, 168);`
                    });
                    createAndAddButton(messageContainer, {
                        className: 'custom-copy-markdown-button',
                        text: 'Copy',
                        iconName: 'markdown_copy', // Icon for copying markdown
                        handler: handleCopyMarkdownClick
                    });
                    

                    // --- END OF MODIFICATION ---
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

function createAndAddButton(messageContainer, config) {
    if (!messageContainer || messageContainer.querySelector(`.${config.className}`)) {
        return;
    }
    const button = document.createElement('button');
    button.className = config.className;
    
    // --- START OF MODIFICATION ---
    // Apply styles, including flexbox for alignment
    button.style.cssText = `
        padding: 4px 12px; 
        background-color: #4285f4; 
        color: white; 
        border: none;
        border-radius: 4px; 
        cursor: pointer; 
        font-size: 13px; 
        margin-left: 8px; 
        float: right;
        /* Add flexbox to align icon and text vertically */
        display: flex;
        align-items: center;
        gap: 6px; /* Adds a nice space between the icon and text */
        ${config.style || ''}
    `;

    // Construct the button's content with an optional icon
    let innerHTML = '';
    if (config.iconName) {
        // Use the same class the website uses for its icons
        innerHTML += `<span class="material-symbols-outlined">${config.iconName}</span>`;
    }
    innerHTML += `<span>${config.text}</span>`; // Wrap text in a span for consistency
    button.innerHTML = innerHTML;
    // --- END OF MODIFICATION ---

    button.addEventListener('click', (event) => config.handler(event, button, messageContainer));

    let footerContainer = messageContainer.querySelector('.turn-footer');
    if (!footerContainer) {
        footerContainer = document.createElement('div');
        footerContainer.className = 'turn-footer custom-extension-footer';
        footerContainer.style.paddingTop = '8px';
        footerContainer.style.textAlign = 'right';
        footerContainer.style.clear = 'both';
        messageContainer.appendChild(footerContainer);
    }
    if (!footerContainer.querySelector(`.${config.className}`)) {
        // footerContainer.appendChild(button);
        footerContainer.prepend(button);
    }
}

function handleCopyTextClick(event, button, messageContainer) {
    event.stopPropagation();
    const responseElement = messageContainer.querySelector('.model-prompt-container');
    let responseContent = '';
    if (responseElement) {
        const clonedElement = responseElement.cloneNode(true);
        const generatedLabel = clonedElement.querySelector('span.name');
        if (generatedLabel && /^(Generated|generates)/i.test(generatedLabel.innerText)) {
            generatedLabel.remove();
        }
        responseContent = clonedElement.innerText;
    }
    responseContent = responseContent.replace(/IGNORE_WHEN_COPYING_START[\s\S]*?IGNORE_WHEN_COPYING_END/g, '').trim();
    navigator.clipboard.writeText(responseContent).then(() => {
        button.innerHTML = 'Text Copied!';
        button.style.backgroundColor = '#34a853';
        setTimeout(() => {
            button.innerHTML = 'Copy Text';
            button.style.backgroundColor = '#4285f4';
        }, 2000);
    });
}

/**
 * Polls the DOM until an element matching the selector with the specific text is found.
 * @param {string} selector - The CSS selector for the parent element (the button).
 * @param {string} text - The text content to match inside the button.
 * @param {number} timeout - The maximum time to wait in milliseconds.
 * @returns {Promise<Element>} - A promise that resolves with the found parent element.
 */
function waitForElementWithText(selector, text, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                // Look for the specific text container *within* the button element.
                const textContainer = el.querySelector('.mat-mdc-menu-item-text > span:last-child');
                
                if (textContainer && textContainer.innerText.trim().toLowerCase() === text.toLowerCase()) {
                    clearInterval(interval);
                    resolve(el); // Resolve with the main button element
                    return;
                }
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Element with selector "${selector}" and text "${text}" not found within ${timeout}ms.`));
            }
        }, 100);
    });
}


async function handleCopyMarkdownClick(event, button, messageContainer) {
    event.stopPropagation();
    
    // --- START OF FIX ---
    // Save the original state BEFORE changing anything
    const originalButtonHTML = button.innerHTML;
    const originalButtonStyle = button.style.backgroundColor;
    // --- END OF FIX ---

    try {
        const turnContainer = messageContainer.closest('ms-chat-turn');
        if (!turnContainer) throw new Error('Could not find the parent turn container.');

        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');

        moreOptionsButton.click();

        const copyMarkdownButton = await waitForElementWithText('button.mat-mdc-menu-item', 'Copy markdown');
        
        copyMarkdownButton.click();
        
        button.innerHTML = 'Copied!'; // Just text is fine for the temporary state
        button.style.backgroundColor = '#34a853';

    } catch (err) {
        console.error('Markdown copy failed:', err);
        button.innerHTML = 'Error!';
        button.style.backgroundColor = '#ea4335';
    } finally {
        setTimeout(() => {
            // --- START OF FIX ---
            // Restore the original HTML, including the icon
            button.innerHTML = originalButtonHTML;
            button.style.backgroundColor = originalButtonStyle;
            // --- END OF FIX ---
        }, 2000);
    }
}

async function handleSendMarkdownClick(event, button, messageContainer) {
    event.stopPropagation();
    
    // --- START OF FIX ---
    const originalButtonHTML = button.innerHTML;
    const originalButtonStyle = button.style.backgroundColor;
    // --- END OF FIX ---

    try {
        const turnContainer = messageContainer.closest('ms-chat-turn');
        if (!turnContainer) throw new Error('Could not find the parent turn container.');

        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');

        moreOptionsButton.click();

        const copyMarkdownButton = await waitForElementWithText('button.mat-mdc-menu-item', 'Copy markdown');
        
        copyMarkdownButton.click();

        await new Promise(resolve => setTimeout(resolve, 100));
        
        const markdownContent = await navigator.clipboard.readText();

        button.innerHTML = 'Sending...';
        button.disabled = true;

        chrome.runtime.sendMessage({ action: "sendMarkdown", content: markdownContent }, (response) => {
            if (response && response.status === "success") {
                button.innerHTML = 'Sent!';
                button.style.backgroundColor = '#34a853';
            } else {
                console.error('Failed to send:', response.message);
                button.innerHTML = 'Error!';
                button.style.backgroundColor = '#ea4335';
            }

            // This reset logic is inside the async callback
            setTimeout(() => {
                // --- START OF FIX ---
                button.innerHTML = originalButtonHTML;
                button.style.backgroundColor = originalButtonStyle;
                button.disabled = false;
                // --- END OF FIX ---
            }, 2000);
        });

    } catch (err) {
        console.error('Markdown send process failed:', err);
        button.innerHTML = 'Error!';
        button.style.backgroundColor = '#ea4335';
        
        // This reset logic is for when the UI part fails
        setTimeout(() => {
            // --- START OF FIX ---
            button.innerHTML = originalButtonHTML;
            button.style.backgroundColor = originalButtonStyle;
            button.disabled = false;
            // --- END OF FIX ---
        }, 2000);
    }
}

// Start observing everything
observeMessages();