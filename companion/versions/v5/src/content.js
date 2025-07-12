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
    const rollingPlaceholder = document.querySelector('ms-input-rolling-placeholder');
    if (rollingPlaceholder) {
        if (rollingPlaceholder.textContent.trim() !== DESIRED_PLACEHOLDER_TEXT) {
            while (rollingPlaceholder.firstChild) {
                rollingPlaceholder.removeChild(rollingPlaceholder.firstChild);
            }
            rollingPlaceholder.textContent = DESIRED_PLACEHOLDER_TEXT;
        }
        if (!rollingPlaceholderSpecificObserver) {
            rollingPlaceholderSpecificObserver = new MutationObserver(() => {
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
  const mainBodyObserver = new MutationObserver((mutationsList) => {
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

function waitForStableTextAndInsertButtons(messageContainer) {
    if (!messageContainer) return;

    if (messageContainer.querySelector('ms-thought-chunk')) {
        return; 
    }

    const checkInterval = setInterval(() => {
        const turnContainer = messageContainer.closest('ms-chat-turn');
        if (!turnContainer) {
            clearInterval(checkInterval);
            return;
        }
        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (moreOptionsButton) {
            clearInterval(checkInterval);
            const responseElement = messageContainer.querySelector('.model-prompt-container');
            if (!responseElement) return;

            let lastText = responseElement.innerText.trim();
            let stabilityTimer;
            const checkStability = () => {
                if (responseElement.innerText.trim() === lastText) {
                    clearInterval(textChangeInterval);
                    clearTimeout(stabilityTimer);
                    
                    createAndAddButton(messageContainer, {
                        className: 'custom-send-markdown-button',
                        text: 'Send to VS Code',
                        iconName: 'send',
                        handler: handleSendMarkdownClick,
                        color: '#34a853'
                    });
                    
                    createAndAddButton(messageContainer, {
                        className: 'custom-copy-markdown-button',
                        text: 'Copy Markdown',
                        iconName: 'markdown_copy',
                        handler: handleCopyMarkdownClick,
                        color: '#4285f4'
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

function createAndAddButton(messageContainer, config) {
    const turnContainer = messageContainer.closest('ms-chat-turn');
    if (!turnContainer) return;

    const actionsContainer = turnContainer.querySelector('.actions.hover-or-edit');
    if (!actionsContainer || actionsContainer.querySelector(`.${config.className}`)) {
        return;
    }

    const button = document.createElement('button');
    button.className = `mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed ${config.className}`;
    
    button.dataset.customButton = "true";
    button.dataset.tooltip = config.text;
    
    button.style.setProperty('--custom-button-color', config.color);
    button.innerHTML = `<span class="material-symbols-outlined">${config.iconName}</span>`;

    const hideAllTooltips = () => {
        const tooltips = document.querySelectorAll('.ai-bridge-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.remove('visible');
            setTimeout(() => {
                tooltip.remove();
            }, 100); 
        });
    };

    button.addEventListener('mouseover', () => {
        hideAllTooltips(); 

        const rect = button.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'ai-bridge-tooltip';
        tooltip.textContent = button.dataset.tooltip;
        document.body.appendChild(tooltip);

        const left = rect.left + (rect.width / 2);
        const top = rect.top - tooltip.offsetHeight - 8;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    });

    button.addEventListener('mouseout', hideAllTooltips);

    button.addEventListener('click', (event) => {
        hideAllTooltips();
        config.handler(event, button, messageContainer, config);
    });
    
    actionsContainer.prepend(button);
}

function waitForElementWithText(selector, text, scope = document, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elements = scope.querySelectorAll(selector);
            for (const el of elements) {
                const textContainer = el.querySelector('.mat-mdc-menu-item-text > span:last-child');
                if (textContainer && textContainer.innerText.trim().toLowerCase() === text.toLowerCase()) {
                    clearInterval(interval);
                    resolve(el);
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

function performHiddenMenuClick(triggerButton, targetButtonText) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Operation timed out: The menu panel did not appear within 2 seconds.`));
        }, 2000);

        const observer = new MutationObserver(async (mutationsList, obs) => {
            for (const mutation of mutationsList) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType !== 1) continue;
                    if (addedNode.matches('.mat-mdc-menu-panel')) {
                        const menuPanel = addedNode;
                        
                        menuPanel.style.position = 'absolute';
                        menuPanel.style.top = '-9999px';
                        menuPanel.style.left = '-9999px';
                        
                        obs.disconnect();

                        try {
                            const targetButton = await waitForElementWithText('button.mat-mdc-menu-item', targetButtonText, menuPanel);
                            targetButton.click();
                            clearTimeout(timeoutId);
                            resolve(); 
                        } catch (error) {
                            clearTimeout(timeoutId);
                            reject(new Error(`Menu appeared, but button with text "${targetButtonText}" was not found inside it.`));
                        }
                        return;
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        triggerButton.click();
    });
}

async function handleCopyMarkdownClick(event, button, messageContainer, config) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonTooltip = button.dataset.tooltip;
    const turnContainer = messageContainer.closest('ms-chat-turn');
    if (!turnContainer) return;

    turnContainer.classList.add('keep-actions-visible');

    try {
        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');

        await performHiddenMenuClick(moreOptionsButton, 'Copy markdown');
        
        button.innerHTML = `<span class="material-symbols-outlined">check</span>`;
        button.style.setProperty('--custom-button-color', '#34a853');
        button.dataset.tooltip = 'Copied!';

    } catch (err) {
        console.error('Markdown copy failed:', err);
        button.innerHTML = `<span class="material-symbols-outlined">error</span>`;
        button.style.setProperty('--custom-button-color', '#ea4335');
        button.dataset.tooltip = 'Error!';
    } finally {
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.style.setProperty('--custom-button-color', config.color);
            button.dataset.tooltip = originalButtonTooltip;
            turnContainer.classList.remove('keep-actions-visible');
        }, 2000);
    }
}

async function handleSendMarkdownClick(event, button, messageContainer, config) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonTooltip = button.dataset.tooltip;
    const turnContainer = messageContainer.closest('ms-chat-turn');
    if (!turnContainer) return;

    turnContainer.classList.add('keep-actions-visible');

    try {
        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');
        
        await performHiddenMenuClick(moreOptionsButton, 'Copy markdown');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const markdownContent = await navigator.clipboard.readText();

        button.innerHTML = `<span class="material-symbols-outlined">sync</span>`;
        button.dataset.tooltip = 'Sending...';
        button.disabled = true;

        chrome.runtime.sendMessage({ action: "sendMarkdown", content: markdownContent }, (response) => {
            if (response && response.status === "success") {
                button.innerHTML = `<span class="material-symbols-outlined">check</span>`;
                button.style.setProperty('--custom-button-color', '#34a853');
                button.dataset.tooltip = 'Sent!';
            } else {
                const errorMessage = response ? response.message : 'Unknown error';
                if (errorMessage === 'AI Bridge server is not running.') {
                    button.innerHTML = `<span class="material-symbols-outlined">cloud_off</span>`;
                    button.style.setProperty('--custom-button-color', '#fbbc05');
                    button.dataset.tooltip = 'Server not running';
                } else {
                    console.error('Failed to send:', errorMessage);
                    button.innerHTML = `<span class="material-symbols-outlined">error</span>`;
                    button.style.setProperty('--custom-button-color', '#ea4335');
                    button.dataset.tooltip = 'Error!';
                }
            }

            setTimeout(() => {
                button.innerHTML = originalButtonHTML;
                button.style.setProperty('--custom-button-color', config.color);
                button.dataset.tooltip = originalButtonTooltip;
                button.disabled = false;
                turnContainer.classList.remove('keep-actions-visible');
            }, 2000);
        });

    } catch (err) {
        console.error('Markdown send process failed:', err);
        button.innerHTML = `<span class="material-symbols-outlined">error</span>`;
        button.style.setProperty('--custom-button-color', '#ea4335');
        button.dataset.tooltip = 'Error!';
        
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.style.setProperty('--custom-button-color', config.color);
            button.dataset.tooltip = originalButtonTooltip;
            button.disabled = false;
            turnContainer.classList.remove('keep-actions-visible');
        }, 2000);
    }
}

/**
 * Detects if the site is in dark mode and sets a 'data-ai-bridge-theme' 
 * attribute on the body tag for CSS to hook into.
 */
function detectAndApplyTheme() {
    // FIX: Check for the 'dark-theme' class on document.body
    const isDarkMode = document.body.classList.contains('dark-theme');
    document.body.setAttribute('data-ai-bridge-theme', isDarkMode ? 'dark' : 'light');
}

/**
 * Sets up a MutationObserver to watch for theme changes on the site.
 */
function observeThemeChanges() {
    // Run on initial load, but wait for body to be fully available.
    // A small delay ensures the class is present when we first check.
    setTimeout(() => {
      detectAndApplyTheme();

      // FIX: Observe the document.body element for class changes
      const themeObserver = new MutationObserver(() => {
          detectAndApplyTheme();
      });

      themeObserver.observe(document.body, { 
          attributes: true, 
          attributeFilter: ['class'] 
      });
    }, 500);
}

// Ensure the final lines of your file call both functions
observeMessages();
observeThemeChanges();
