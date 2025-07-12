
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
                    
                    createAndAddButton(messageContainer, {
                        className: 'custom-send-markdown-button',
                        text: 'Send',
                        iconName: 'send',
                        handler: handleSendMarkdownClick,
                        style: `background-color:rgb(52, 75, 168);`
                    });
                    createAndAddButton(messageContainer, {
                        className: 'custom-copy-markdown-button',
                        text: 'Copy',
                        iconName: 'markdown_copy',
                        handler: handleCopyMarkdownClick
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
    if (!messageContainer || messageContainer.querySelector(`.${config.className}`)) {
        return;
    }
    const button = document.createElement('button');
    button.className = config.className;
    
    button.style.cssText = `
        padding: 4px 12px; 
        background-color: #4285f4; 
        color: white; 
        border: none;
        border-radius: 16px; 
        cursor: pointer; 
        font-size: 13px; 

        display: flex;
        align-items: center;
        gap: 6px;
        ${config.style || ''}
    `;

    let innerHTML = '';
    if (config.iconName) {
        innerHTML += `<span class="material-symbols-outlined">${config.iconName}</span>`;
    }
    innerHTML += `<span>${config.text}</span>`;
    button.innerHTML = innerHTML;

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

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        triggerButton.click();
    });
}

async function handleCopyMarkdownClick(event, button, messageContainer) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonStyle = button.style.backgroundColor;

    try {
        const turnContainer = messageContainer.closest('ms-chat-turn');
        if (!turnContainer) throw new Error('Could not find the parent turn container.');

        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');

        await performHiddenMenuClick(moreOptionsButton, 'Copy markdown');
        
        button.innerHTML = 'Copied!';
        button.style.backgroundColor = '#34a853';

    } catch (err) {
        console.error('Markdown copy failed:', err);
        button.innerHTML = 'Error!';
        button.style.backgroundColor = '#ea4335';
    } finally {
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.style.backgroundColor = originalButtonStyle;
        }, 2000);
    }
}

async function handleSendMarkdownClick(event, button, messageContainer) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonStyle = button.style.backgroundColor;

    try {
        const turnContainer = messageContainer.closest('ms-chat-turn');
        if (!turnContainer) throw new Error('Could not find the parent turn container.');

        const moreOptionsButton = turnContainer.querySelector('button[aria-label="More options"], button[aria-label="Open options"]');
        if (!moreOptionsButton) throw new Error('Could not find "More options" button.');

        await performHiddenMenuClick(moreOptionsButton, 'Copy markdown');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const markdownContent = await navigator.clipboard.readText();

        button.innerHTML = 'Sending...';
        button.disabled = true;

        chrome.runtime.sendMessage({ action: "sendMarkdown", content: markdownContent }, (response) => {
            if (response) {
                if (response.status === "success") {
                    button.innerHTML = 'Sent!';
                    button.style.backgroundColor = '#34a853';
                } else if (response.message === 'AI Bridge server is not running.') {
                    console.log('User action feedback: AI Bridge server is off.');
                    button.innerHTML = 'Server Off';
                    button.style.backgroundColor = '#fbbc05';
                } else {
                    console.error('Failed to send due to a server-side error:', response.message);
                    button.innerHTML = 'Error!';
                    button.style.backgroundColor = '#ea4335';
                }
            } else {
                console.error('Failed to send: No response from the background script.');
                button.innerHTML = 'Error!';
                button.style.backgroundColor = '#ea4335';
            }

            setTimeout(() => {
                button.innerHTML = originalButtonHTML;
                button.style.backgroundColor = originalButtonStyle;
                button.disabled = false;
            }, 2000);
        });

    } catch (err) {
        console.error('Markdown send process failed:', err);
        button.innerHTML = 'Error!';
        button.style.backgroundColor = '#ea4335';
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.style.backgroundColor = originalButtonStyle;
            button.disabled = false;
        }, 2000);
    }
}

observeMessages();
