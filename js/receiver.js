const NAMESPACE = 'urn:x-cast:com.bifo.carminal';

class CarminalReceiver {
    constructor() {
        console.log('[Carminal] Initializing CarminalReceiver...');

        try {
            this.context = cast.framework.CastReceiverContext.getInstance();
        } catch (e) {
            console.error('[Carminal] ERROR getting CastReceiverContext: ' + e.message);
            return;
        }

        this.terminalManager = new TerminalManager();
        this.layoutManager = new LayoutManager();
        this.themeEngine = new ThemeEngine();

        // Wire up LayoutManager <-> TerminalManager
        this.layoutManager.terminalManager = this.terminalManager;

        this.setupMessageListener();
        this.start();
    }

    setupMessageListener() {
        try {
            this.context.addCustomMessageListener(NAMESPACE, (event) => {
                console.log('[Carminal] Message received on namespace: ' + NAMESPACE);
                try {
                    const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    console.log('[Carminal] Message type: ' + message.type);
                    this.handleMessage(message, event.senderId);
                } catch (e) {
                    console.error('[Carminal] ERROR parsing message: ' + e.message);
                }
            });
            console.log('[Carminal] Message listener registered for: ' + NAMESPACE);
        } catch (e) {
            console.error('[Carminal] ERROR setting up listener: ' + e.message);
        }
    }

    handleMessage(message, senderId) {
        const sessionId = message.sessionId || 'default';

        switch (message.type) {
            case 'terminal_output':
                this.terminalManager.write(sessionId, message.data);
                this.sendTerminalSize(sessionId, senderId);
                break;

            case 'clear_terminal':
                this.terminalManager.clear(sessionId);
                break;

            case 'layout_change':
                this.layoutManager.setLayout(message.layout, message.sessions || []);
                break;

            case 'theme_update':
                this.themeEngine.applyTheme(sessionId, message.theme);
                break;

            case 'session_info':
                this.terminalManager.updateSessionInfo(
                    sessionId,
                    message.hostname || '',
                    message.envType || 'CUSTOM',
                    message.frameColor || null
                );
                break;

            default:
                console.warn('[Carminal] Unknown message type: ' + message.type);
        }
    }

    sendTerminalSize(sessionId, senderId) {
        const entry = this.terminalManager.terminals.get(sessionId);
        if (!entry) return;

        const cols = entry.term.cols;
        const rows = entry.term.rows;

        // Only send if we have a valid senderId and the size is reasonable
        if (!senderId || cols <= 0 || rows <= 0) return;

        // Avoid sending duplicate resize messages
        const sizeKey = `${cols}x${rows}`;
        if (entry._lastSentSize === sizeKey) return;
        entry._lastSentSize = sizeKey;

        try {
            this.context.sendCustomMessage(NAMESPACE, senderId, JSON.stringify({
                type: 'terminal_resize',
                sessionId: sessionId,
                cols: cols,
                rows: rows
            }));
            console.log(`[Carminal] Sent terminal size: ${cols}x${rows} for session ${sessionId}`);
        } catch (e) {
            console.error('[Carminal] ERROR sending terminal size: ' + e.message);
        }
    }

    start() {
        try {
            this.context.start();
            console.log('[Carminal] Receiver started successfully');
        } catch (e) {
            console.error('[Carminal] ERROR starting receiver: ' + e.message);
        }
    }
}

// Initialize when DOM is ready
window.receiver = new CarminalReceiver();
