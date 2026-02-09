const NAMESPACE = 'urn:x-cast:com.bifo.carminal';

class CarminalReceiver {
    constructor() {
        this.debugLog('Initializing CarminalReceiver...');

        try {
            this.context = cast.framework.CastReceiverContext.getInstance();
            this.debugLog('Got CastReceiverContext');
        } catch (e) {
            this.debugLog('ERROR getting CastReceiverContext: ' + e.message);
            return;
        }

        this.terminalDiv = null;
        this.setupDebugUI();
        this.setupMessageListener();
        this.start();
    }

    setupDebugUI() {
        // Create a visible terminal output area (no xterm.js dependency for now)
        const container = document.getElementById('terminal-container');
        if (!container) {
            this.debugLog('ERROR: terminal-container not found');
            return;
        }

        container.style.cssText = 'width:100vw;height:100vh;background:#0D0D0D;color:#F8F8F2;font-family:monospace;font-size:18px;padding:20px;overflow-y:auto;white-space:pre-wrap;word-wrap:break-word;';

        // Status header
        const status = document.createElement('div');
        status.id = 'status';
        status.style.cssText = 'color:#50FA7B;margin-bottom:10px;font-size:14px;';
        status.textContent = 'Carminal Receiver loaded. Waiting for messages...';
        container.appendChild(status);

        // Terminal output area
        this.terminalDiv = document.createElement('div');
        this.terminalDiv.id = 'terminal-output';
        container.appendChild(this.terminalDiv);

        this.debugLog('Debug UI created');
    }

    setupMessageListener() {
        try {
            this.context.addCustomMessageListener(NAMESPACE, (event) => {
                this.debugLog('Message received on namespace: ' + NAMESPACE);
                try {
                    const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    this.debugLog('Message type: ' + message.type);
                    this.handleMessage(message);
                } catch (e) {
                    this.debugLog('ERROR parsing message: ' + e.message);
                    this.debugLog('Raw data: ' + JSON.stringify(event.data).substring(0, 200));
                }
            });
            this.debugLog('Message listener registered for: ' + NAMESPACE);
        } catch (e) {
            this.debugLog('ERROR setting up listener: ' + e.message);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'terminal_output':
                if (this.terminalDiv) {
                    // Strip ANSI escape codes for plain text display
                    const cleanText = message.data.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
                                                   .replace(/\x1b\][^\x07]*\x07/g, '')
                                                   .replace(/\x1b\[[?][0-9]*[a-zA-Z]/g, '');
                    this.terminalDiv.textContent += cleanText;

                    // Keep only last 5000 chars to prevent memory issues
                    if (this.terminalDiv.textContent.length > 5000) {
                        this.terminalDiv.textContent = this.terminalDiv.textContent.slice(-4000);
                    }

                    // Auto-scroll to bottom - use requestAnimationFrame for reliability
                    requestAnimationFrame(() => {
                        const container = document.getElementById('terminal-container');
                        container.scrollTop = container.scrollHeight;
                    });

                    // Update status (only once)
                    const status = document.getElementById('status');
                    if (status && status.textContent !== 'Connected') {
                        status.textContent = 'Connected';
                        status.style.color = '#50FA7B';
                    }
                }
                break;

            default:
                this.debugLog('Unknown message type: ' + message.type);
        }
    }

    debugLog(msg) {
        console.log('[Carminal] ' + msg);
        // Also show on screen briefly
        const status = document.getElementById('status');
        if (status) {
            status.textContent = msg;
        }
    }

    start() {
        try {
            this.context.start();
            this.debugLog('Receiver started successfully');
        } catch (e) {
            this.debugLog('ERROR starting receiver: ' + e.message);
        }
    }
}

// Initialize when DOM is ready
window.receiver = new CarminalReceiver();
