// =================================================================
// SECTION 1: GLOBAL STATE & CONFIGURATION
// All high-level constants and configuration objects that drive the extension's behavior.
// =================================================================

let textareaSpecificObserver = null;
let rollingPlaceholderSpecificObserver = null;
let currentPlatform = null;

const PLATFORM_CONFIGS = {
  'aistudio': {
    name: 'Google AI Studio',
    domains: ['aistudio.google.com'],
    messageContainerSelector: 'ms-chat-turn',
    actionsContainerSelector: '.actions.hover-or-edit',
    copyMethod: {
      type: 'AI_STUDIO_MENU_CLICK',
      args: {
        optionsButtonSelector: 'button[aria-label="More options"], button[aria-label="Open options"]',
        menuItemText: 'Copy markdown'
      }
    },
    placeholderConfig: {
      desiredText: 'Message',
      textareaSelector: 'textarea.textarea.gmat-body-medium, textarea[placeholder*="example prompt"], textarea[aria-label*="example prompt"]',
      rollingPlaceholderSelector: 'ms-input-rolling-placeholder',
      overlaySelector: 'div.placeholder-overlay[slot="autosize-textarea"]'
    },
    buttonsToInject: ['send', 'copy']
  },
  't3chat': {
    name: 'T3 Chat',
    domains: ['t3.chat'],
    messageContainerSelector: 'div[data-message-id]',
    actionsContainerSelector: '[role="article"][aria-label="Assistant message"] + div',
    copyMethod: {
      type: 'DIRECT_COPY_BUTTON',
      args: {
        buttonSelector: 'button[aria-label="Copy response to clipboard"]'
      }
    },
    buttonsToInject: ['send']
  }
};

const ICONS = {
  // Action Icons
  send: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m640-280-57-56 184-184-184-184 57-56 240 240-240 240ZM80-200v-160q0-83 58.5-141.5T280-560h247L383-704l57-56 240 240-240 240-57-56 144-144H280q-50 0-85 35t-35 85v160H80Z"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm210-360h60v-180h40v120h60v-120h40v180h60v-200q0-17-11.5-28.5T630-680H450q-17 0-28.5 11.5T410-640v200Zm-50 120v-480 480Z"/></svg>`,
  // Status Icons
  check: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M389-267 195-460l51-52 143 143 325-324 51 51-376 375Z"/></svg>`,
  sync: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M216-192v-72h74q-45-40-71.5-95.5T192-480q0-101 61-177.5T408-758v75q-63 23-103.5 77.5T264-480q0 48 19.5 89t52.5 70v-63h72v192H216Zm336-10v-75q63-23 103.5-77.5T696-480q0-48-19.5-89T624-639v63h-72v-192h192v72h-74q45 40 71.5 95.5T768-480q0 101-61 177.5T552-202Z"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M479.79-288q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5ZM444-432h72v-240h-72v240Zm36.28 336Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>`,
  cloud_off: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M768-90 666-192H240q-80.29 0-136.15-55.85Q48-303.71 48-384q0-76 52-131t127-60q3.33-10.78 6.67-20.89Q237-606 242-616L90-768l51-51 678 678-51 51ZM240-264h354L298-560q-4 13-7.5 26.5T283-507l-51 4q-48 4-80 37.68T120-384q0 49.71 35.14 84.86Q190.29-264 240-264Zm206-148Zm394 190-53-52q23-12 38-34.82 15-22.81 15-51.18 0-40.32-27.84-68.16Q784.32-456 744-456h-66l-6-65q-7-74-62-124.5T479.78-696q-24.47 0-47.12 6Q410-684 389-673l-52-52q32-20 67.65-31.5Q440.29-768 480-768q103 0 179 69.5T744-528q70 0 119 49t49 119q0 43-19.5 79T840-222ZM588-474Z"/></svg>`
};


// =================================================================
// SECTION 2: CORE INITIALIZATION & OBSERVATION LOGIC
// This is the main sequence of events: initialize, find the platform, and start observing for changes.
// =================================================================

function initializeExtension() {
  const platformConfig = getCurrentPlatform();
  if (!platformConfig) {
    console.log("AI Bridge: Not on a supported platform.");
    return;
  }
  
  currentPlatform = platformConfig;

  const platformIdentifier = platformConfig.name.toLowerCase().replace(/\s+/g, '-');
  document.body.setAttribute('data-ai-bridge-platform', platformIdentifier);

  observeUIChanges();
}

function observeUIChanges() {
  ensureStaticInputPlaceholder();
  detectAndApplyTheme();

  const mainObserver = new MutationObserver((mutationsList) => {
    ensureStaticInputPlaceholder();
    
    const bodyClassChange = mutationsList.find(m => m.type === 'attributes' && m.attributeName === 'class' && m.target === document.body);
    if (bodyClassChange) {
      detectAndApplyTheme();
    }

    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE || !node.matches) continue;

          switch (currentPlatform.name) {
            case 'Google AI Studio':
              if (node.matches(currentPlatform.messageContainerSelector)) {
                waitForStableTextAndInsertButtons(node);
              }
              break;

            case 'T3 Chat':
              if (node.matches(currentPlatform.messageContainerSelector)) {
                observeT3ChatHydration(node);
              }
              break;
            
            default:
              // console.warn("AI Bridge: No specific observer logic for platform:", currentPlatform.name);
              break;
          }
        }
      }
    }
  });

  mainObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

function observeT3ChatHydration(shellNode, timeout = 3000) {
  // --- STEP 1: CHECK IMMEDIATELY (for reloads) ---
  const actionsSelector = currentPlatform.actionsContainerSelector;
  const actionsContainer = shellNode.querySelector(actionsSelector);

  if (actionsContainer) {
    const messageContainer = actionsContainer.closest(currentPlatform.messageContainerSelector);
    if (messageContainer) {
      createAndInjectButtons(messageContainer);
    }
    return;
  }

  // --- STEP 2: OBSERVE FOR CHANGES (for new dynamic messages) ---
  const observer = new MutationObserver((mutations, obs) => {
    // Now we can use the same logic as the initial check.
    const newlyAddedActionsContainer = shellNode.querySelector(actionsSelector);
    if (newlyAddedActionsContainer) {
      obs.disconnect();
      const messageContainer = newlyAddedActionsContainer.closest(currentPlatform.messageContainerSelector);
      if (messageContainer) {
        createAndInjectButtons(messageContainer);
      }
    }
  });

  observer.observe(shellNode, { childList: true, subtree: true });

  setTimeout(() => observer.disconnect(), timeout);
}

function waitForStableTextAndInsertButtons(messageContainer) {
    if (!messageContainer) return;

    const isStreamingPlatform = currentPlatform.name === 'Google AI Studio';

    if (isStreamingPlatform && messageContainer.querySelector('ms-thought-chunk')) {
        return; 
    }

    if (isStreamingPlatform) {
        // --- Logic for streaming platforms like AI Studio ---
        const checkInterval = setInterval(() => {
            const moreOptionsButton = messageContainer.querySelector(currentPlatform.copyMethod.args.optionsButtonSelector);
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
                        // Call our new top-level function
                        createAndInjectButtons(messageContainer);
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
    } else {
        // --- Simpler logic for non-streaming platforms ---
        // Call our new top-level function
        createAndInjectButtons(messageContainer);
    }
}


// =================================================================
// SECTION 3: BUTTON CREATION & EVENT HANDLING
// Functions responsible for creating the UI, handling user clicks, and communicating with the background script.
// =================================================================

function createButtonElement(config) {
    const button = document.createElement('button');

    // --- START: NEW DYNAMIC CLASS LOGIC ---

    // 1. Get a clean, CSS-friendly identifier for the platform.
    const platformIdentifier = currentPlatform.name.toLowerCase().replace(/\s+/g, '-');

    // 2. Get the base classes for the platform to ensure it matches the native look.
    let nativeClasses = '';
    if (currentPlatform.name === 'T3 Chat') {
      nativeClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0';
    } else {
      nativeClasses = 'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed';
    }

    // 3. Combine native classes with our custom classes for easy styling.
    // e.g., "mdc-icon-button ... custom-send-markdown-button google-ai-studio"
    button.className = `${nativeClasses} ${config.className} ${platformIdentifier}`;
    
    // --- END: NEW DYNAMIC CLASS LOGIC ---
    
    button.dataset.customButton = "true";
    button.dataset.tooltip = config.text;
    
    const iconSVG = ICONS[config.iconName];
    if (iconSVG) {
        button.innerHTML = iconSVG;
    }

    addEventListenersToButton(button, config);

    return button;
}

function createAndInjectButtons(messageContainer) {
    // Find the container ONCE.
    const turnContainer = messageContainer.closest(currentPlatform.messageContainerSelector);
    if (!turnContainer) return;
    const actionsContainer = turnContainer.querySelector(currentPlatform.actionsContainerSelector);
    if (!actionsContainer) return;

    // Before doing anything, check if our send button already exists.
    if (actionsContainer.querySelector('.custom-send-markdown-button')) {
        return;
    }

    // Use a DocumentFragment to build the buttons off-screen
    const fragment = document.createDocumentFragment();
    const buttonsToCreate = currentPlatform.buttonsToInject || [];

    // --- Create SEND button if needed ---
    if (buttonsToCreate.includes('send')) {
        const sendButton = createButtonElement({
            className: 'custom-send-markdown-button',
            text: 'Send to VS Code',
            iconName: 'send',
            handler: handleSendMarkdownClick,
            messageContainer: messageContainer 
        });
        fragment.appendChild(sendButton);
    }
    
    // --- Create COPY button if needed ---
    if (buttonsToCreate.includes('copy')) {
        const copyButton = createButtonElement({
            className: 'custom-copy-markdown-button',
            text: 'Copy Markdown',
            iconName: 'copy',
            handler: handleCopyMarkdownClick,
            messageContainer: messageContainer
        });
        fragment.appendChild(copyButton);
    }

    // Inject all buttons at once
    actionsContainer.prepend(fragment);
}

function addEventListenersToButton(button, config) {
    const hideAllTooltips = () => {
        const tooltips = document.querySelectorAll('.ai-bridge-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.remove('visible');
            setTimeout(() => {
                tooltip.remove();
            }, 100); 
        });
    };

    button.addEventListener('mouseenter', () => {

        hideAllTooltips();

        const rect = button.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'ai-bridge-tooltip';
        tooltip.textContent = button.dataset.tooltip;
        document.body.appendChild(tooltip);

        const left = rect.left + (rect.width / 2);
        
        let top;
        if (currentPlatform.name === 'T3 Chat') {
          top = rect.bottom + 5;
        } else {
          top = rect.top - tooltip.offsetHeight - 8;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    });

    button.addEventListener('mouseleave', hideAllTooltips);

    button.addEventListener('click', (event) => {
        hideAllTooltips();
        config.handler(event, button, config.messageContainer, config);
    });
}

async function handleSendMarkdownClick(event, button, messageContainer, config) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonTooltip = button.dataset.tooltip;
    const turnContainer = messageContainer.closest(currentPlatform.messageContainerSelector);
    if (!turnContainer) return;

    turnContainer.classList.add('keep-actions-visible');

    try {
        const copyConfig = currentPlatform.copyMethod;
        switch (copyConfig.type) {
            case 'AI_STUDIO_MENU_CLICK':
                const moreOptionsButton = turnContainer.querySelector(copyConfig.args.optionsButtonSelector);
                if (!moreOptionsButton) throw new Error('Could not find "More options" button.');
                await performHiddenMenuClick(moreOptionsButton, copyConfig.args.menuItemText);
                break;
            case 'DIRECT_COPY_BUTTON':
                const directCopyButton = turnContainer.querySelector(copyConfig.args.buttonSelector);
                if (!directCopyButton) throw new Error('Could not find direct copy button.');
                directCopyButton.click();
                break;
            default:
                throw new Error(`Unknown copy method type: ${copyConfig.type}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        const markdownContent = await navigator.clipboard.readText();

        button.innerHTML = ICONS['sync'];
        button.dataset.tooltip = 'Sending...';
        button.classList.add('is-processing');

        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "sendMarkdown", content: markdownContent }, (res) => {
                resolve(res);
            });
        });

        if (response && response.status === "success") {
            button.innerHTML = ICONS['check'];
            button.classList.add('success');
            button.dataset.tooltip = 'Sent!';
        } else {
            const errorMessage = response ? response.message : 'Unknown error';
            if (errorMessage === 'AI Bridge server is not running.') {
                button.innerHTML = ICONS['cloud_off'];
                button.classList.add('server-off');
                button.dataset.tooltip = 'Server not running';
            } else {
                console.error('Failed to send:', errorMessage);
                button.innerHTML = ICONS['error'];
                button.classList.add('error');
                button.dataset.tooltip = 'Error!';
            }
        }
    } catch (err) {
        console.error('Markdown send process failed:', err);
        button.innerHTML = ICONS['error'];
        button.classList.add('error');
        button.dataset.tooltip = 'Error!';
    } finally {
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.classList.remove('success', 'server-off', 'error');
            button.dataset.tooltip = originalButtonTooltip;
            button.classList.remove('is-processing');
            turnContainer.classList.remove('keep-actions-visible');
        }, 1500);
    }
}

async function handleCopyMarkdownClick(event, button, messageContainer, config) {
    event.stopPropagation();
    const originalButtonHTML = button.innerHTML;
    const originalButtonTooltip = button.dataset.tooltip;
    const turnContainer = messageContainer.closest(currentPlatform.messageContainerSelector);
    if (!turnContainer) return;

    turnContainer.classList.add('keep-actions-visible');

    try {
        const copyConfig = currentPlatform.copyMethod;
        switch (copyConfig.type) {
            case 'AI_STUDIO_MENU_CLICK':
                const moreOptionsButton = turnContainer.querySelector(copyConfig.args.optionsButtonSelector);
                if (!moreOptionsButton) throw new Error('Could not find "More options" button.');
                await performHiddenMenuClick(moreOptionsButton, copyConfig.args.menuItemText);
                break;
            case 'DIRECT_COPY_BUTTON':
                const directCopyButton = turnContainer.querySelector(copyConfig.args.buttonSelector);
                if (!directCopyButton) throw new Error('Could not find direct copy button.');
                directCopyButton.click();
                break;
            default:
                throw new Error(`Unknown copy method type: ${copyConfig.type}`);
        }
        
        button.innerHTML = ICONS['check'];
        button.classList.add('success');
        button.dataset.tooltip = 'Copied!';
    } catch (err) {
        console.error('Markdown copy failed:', err);
        button.innerHTML = ICONS['error'];
        button.classList.add('error');
        button.dataset.tooltip = 'Error!';
    } finally {
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.classList.remove('success', 'error');
            button.dataset.tooltip = originalButtonTooltip;
            turnContainer.classList.remove('keep-actions-visible');
        }, 2000);
    }
}


// =================================================================
// SECTION 4: PLATFORM-SPECIFIC HELPERS & UTILITIES
// These functions are utilities, often specific to one platform's implementation details.
// =================================================================

function getCurrentPlatform() {
  const currentHostname = window.location.hostname;
  for (const key in PLATFORM_CONFIGS) {
    const platform = PLATFORM_CONFIGS[key];
    if (platform.domains.some(domain => currentHostname.includes(domain))) {
      return platform;
    }
  }
  return null;
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


// =================================================================
// SECTION 5: SECONDARY FEATURES (THEME & PLACEHOLDER)
// These functions handle optional, platform-specific UI enhancements.
// =================================================================

function detectAndApplyTheme() {
    const isDarkMode = document.body.classList.contains('dark-theme');
    document.body.setAttribute('data-ai-bridge-theme', isDarkMode ? 'dark' : 'light');
}

function ensureStaticInputPlaceholder() {
    const config = currentPlatform.placeholderConfig;
    if (!config) {
        disconnectSpecificObservers();
        return;
    }

    const { desiredText, textareaSelector, rollingPlaceholderSelector, overlaySelector } = config;

    const textarea = document.querySelector(textareaSelector);
    if (textarea) {
        if (textarea.placeholder !== desiredText) {
            textarea.placeholder = desiredText;
        }
        const currentAriaLabel = textarea.getAttribute('aria-label');
        if (currentAriaLabel && currentAriaLabel.includes("example prompt") && currentAriaLabel !== desiredText) {
            textarea.setAttribute('aria-label', desiredText);
        }
        if (!textareaSpecificObserver) {
            textareaSpecificObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes') {
                        if (mutation.attributeName === 'placeholder' && textarea.placeholder !== desiredText) {
                            textarea.placeholder = desiredText;
                        }
                        if (mutation.attributeName === 'aria-label') {
                            const newAriaLabel = textarea.getAttribute('aria-label');
                            if (newAriaLabel && newAriaLabel.includes("example prompt") && newAriaLabel !== desiredText) {
                                textarea.setAttribute('aria-label', desiredText);
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

    const rollingPlaceholder = document.querySelector(rollingPlaceholderSelector);
    if (rollingPlaceholder) {
        if (rollingPlaceholder.textContent.trim() !== desiredText) {
            while (rollingPlaceholder.firstChild) {
                rollingPlaceholder.removeChild(rollingPlaceholder.firstChild);
            }
            rollingPlaceholder.textContent = desiredText;
        }
        if (!rollingPlaceholderSpecificObserver) {
            rollingPlaceholderSpecificObserver = new MutationObserver(() => {
                if (rollingPlaceholder.textContent.trim() !== desiredText) {
                    while (rollingPlaceholder.firstChild) {
                        rollingPlaceholder.removeChild(rollingPlaceholder.firstChild);
                    }
                    rollingPlaceholder.textContent = desiredText;
                }
            });
            rollingPlaceholderSpecificObserver.observe(rollingPlaceholder, { childList: true, characterData: true, subtree: true });
        }
    } else {
        if (rollingPlaceholderSpecificObserver) rollingPlaceholderSpecificObserver.disconnect();
        rollingPlaceholderSpecificObserver = null;
        
        const placeholderOverlayDiv = document.querySelector(overlaySelector);
        if (placeholderOverlayDiv && !placeholderOverlayDiv.querySelector(rollingPlaceholderSelector)) {
             if (placeholderOverlayDiv.textContent.trim() !== desiredText) {
                while (placeholderOverlayDiv.firstChild) {
                    placeholderOverlayDiv.removeChild(placeholderOverlayDiv.firstChild);
                }
                placeholderOverlayDiv.textContent = desiredText;
            }
        }
    }
}

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


// =================================================================
// SECTION 6: EXECUTION START
// This is the single line that kicks off the entire extension.
// =================================================================

initializeExtension();
