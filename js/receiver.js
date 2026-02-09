const NAMESPACE = 'urn:x-cast:com.bifo.carminal';

class CarminalReceiver {
    constructor() {
        this.context = cast.framework.CastReceiverContext.getInstance();
        this.terminalManager = new TerminalManager();
        this.layoutManager = new LayoutManager();
        this.layoutManager.terminalManager = this.terminalManager; // Pass reference
        this.themeEngine = new ThemeEngine();
        
        this.setupMessageListener();
        this.start();
    }
    
    setupMessageListener() {
        this.context.addCustomMessageListener(NAMESPACE, (event) => {
            console.log('Received message:', event.data);
            try {
                const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                this.handleMessage(message);
            } catch (e) {
                console.error('Failed to parse message:', e, event.data);
            }
        });
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'terminal_output':
                this.terminalManager.write(message.sessionId, message.data);
                break;
                
            case 'layout_change':
                this.layoutManager.setLayout(message.layout, message.sessions);
                break;
                
            case 'theme_update':
                this.themeEngine.applyTheme(message.sessionId, message.theme);
                break;
                
            case 'session_info':
                this.terminalManager.updateSessionInfo(
                    message.sessionId, message.hostname, message.environmentType, message.frameColor
                );
                break;
                
            case 'clear_terminal':
                this.terminalManager.clear(message.sessionId);
                break;
        }
    }
    
    start() {
        this.context.start();
        console.log('Carminal Receiver started');
    }
}

// Initialize
window.receiver = new CarminalReceiver();
