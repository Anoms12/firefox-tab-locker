console.log("Hi mom, I'm loaded!");

(function () {
    function addLockTabMenuItem() {
        const tabContextMenu = document.getElementById("tabContextMenu");

        if (!tabContextMenu || document.getElementById("context_lockTab")) {
            return;
        }

        const lockTabMenuItem = document.createXULElement("menuitem");
        lockTabMenuItem.id = "context_lockTab";
        lockTabMenuItem.setAttribute("label", getLockTabLabel(gBrowser.selectedTab)); // Initialize the label based on the current tab's state
        lockTabMenuItem.addEventListener("command", toggleLockTab);

        const referenceItem = document.getElementById("context_pinTab");
        tabContextMenu.insertBefore(lockTabMenuItem, referenceItem.nextSibling);

        console.log("Lock Tab menu item added to the context menu.");
    }

    function getLockTabLabel(tab) {
        return tab.getAttribute("locked") === "true" ? "Unlock Tab" : "Lock Tab";
    }

    function toggleLockTab() {
        const tab = gBrowser.selectedTab;
        const lockTabMenuItem = document.getElementById("context_lockTab");

        if (tab.getAttribute("locked") === "true") {
            tab.removeAttribute("locked");
            restoreCloseButton(tab);
            lockTabMenuItem.setAttribute("label", "Lock Tab"); // Update context menu label
            console.log(`Tab unlocked: ${tab.linkedBrowser.currentURI.spec}`);
        } else {
            tab.setAttribute("locked", "true");
            replaceCloseButtonWithLock(tab);
            lockTabMenuItem.setAttribute("label", "Unlock Tab"); // Update context menu label
            console.log(`Tab locked: ${tab.linkedBrowser.currentURI.spec}`);
        }
    }

    function replaceCloseButtonWithLock(tab) {
        const closeButton = tab.querySelector(".tab-close-button");
        if (closeButton) {
            closeButton.style.display = "none"; // Hide the close button

            // Add SVG lock icon
            const lockIcon = document.createElement("span");
            lockIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 50 50">
                    <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.355469 20 6 21.355469 6 23 L 6 47 C 6 48.644531 7.355469 50 9 50 L 41 50 C 42.644531 50 44 48.644531 44 47 L 44 23 C 44 21.355469 42.644531 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 9 22 L 41 22 C 41.554688 22 42 22.445313 42 23 L 42 47 C 42 47.554688 41.554688 48 41 48 L 9 48 C 8.445313 48 8 47.554688 8 47 L 8 23 C 8 22.445313 8.445313 22 9 22 Z M 25 30 C 23.300781 30 22 31.300781 22 33 C 22 33.898438 22.398438 34.6875 23 35.1875 L 23 38 C 23 39.101563 23.898438 40 25 40 C 26.101563 40 27 39.101563 27 38 L 27 35.1875 C 27.601563 34.6875 28 33.898438 28 33 C 28 31.300781 26.699219 30 25 30 Z"></path>
                </svg>
            `;
            lockIcon.className = "lock-icon";
            lockIcon.style.cursor = "pointer";
            lockIcon.addEventListener("click", (event) => {
                event.preventDefault(); // Prevent default actions
                shakeTab(tab);
            });

            tab.appendChild(lockIcon);
        }

        console.log("Lock icon added to the tab.");
    }

    function restoreCloseButton(tab) {
        const lockIcon = tab.querySelector(".lock-icon");
        if (lockIcon) {
            lockIcon.remove(); // Remove lock icon
        }

        const closeButton = tab.querySelector(".tab-close-button");
        if (closeButton) {
            closeButton.style.display = ""; // Restore the close button
        }

        console.log("Close button restored for the tab.");
    }

    function shakeTab(tab) {
        if (!tab.classList.contains("shake")) {
            tab.classList.add("shake");
            console.log("Tab is shaking!");
            setTimeout(() => {
                tab.classList.remove("shake");
            }, 500);
        }
    }

    // Prevent tab from closing when Ctrl+W is pressed on a locked tab
    function blockTabClose(event) {
        const tab = gBrowser.selectedTab;
        if (tab.getAttribute("locked") === "true") {
            if ((event.ctrlKey && event.key === "w") || (event.key === "F4")) {
                event.preventDefault(); // Prevent closing
                console.log("Attempted to close a locked tab, but it was blocked.");
            }
        }
    }

    const style = document.createElement("style");
    style.textContent = `
        .shake {
            animation: shake 0.5s;
        }
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
        addLockTabMenuItem();
    });

    observer.observe(document, { childList: true, subtree: true });

    gBrowser.tabContainer.addEventListener("TabOpen", (event) => {
        const tab = event.target;
        tab.removeAttribute("locked");
        console.log("New tab opened and initialized as unlocked.");
    });

    gBrowser.tabContainer.addEventListener("TabClose", (event) => {
        const tab = event.target;
        if (tab.getAttribute("locked") === "true") {
            restoreCloseButton(tab);
        }
    });

    // Add event listener for blocking tab close (Ctrl+W or F4)
    window.addEventListener("keydown", blockTabClose);

    console.log("Script initialized and observing for context menu changes.");
})();
