class LayoutManager {
    constructor() {
        this.container = document.getElementById('terminal-container');
        this.currentLayout = 'SINGLE';
        this.terminalManager = null; // Will be set by receiver.js
    }

    setLayout(layout, sessions) {
        this.currentLayout = layout;
        this.container.className = `layout-${layout.toLowerCase()}`;
        
        // Remove all existing terminal panes to re-add them in the new layout
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        // Create and append terminal panes according to the new layout and sessions
        sessions.forEach(session => {
            const terminalEntry = this.terminalManager.terminals.get(session.sessionId);
            let terminalPane;

            if (terminalEntry) {
                // If terminal already exists, re-append its container
                terminalPane = terminalEntry.container;
            } else {
                // If not, create a new one (this should ideally be coordinated better)
                // For now, create a dummy div, terminalManager will create the xterm instance
                terminalPane = document.createElement('div');
                terminalPane.id = `term-${session.sessionId}`;
                terminalPane.className = 'terminal-pane'; // Add base class
                this.terminalManager.createTerminal(session.sessionId); // Ensure xterm instance exists
            }
            terminalPane.className = `terminal-pane position-${session.position}`; // Set position class
            this.container.appendChild(terminalPane);
        });

        // If there are sessions that were open but not in the new layout, remove them
        this.terminalManager.terminals.forEach((entry, sessionId) => {
            if (!sessions.some(s => s.sessionId === sessionId)) {
                this.terminalManager.removeTerminal(sessionId);
            }
        });

        // FitAddon for all terminals on window resize and after layout change
        this.refitAll();
    }
    
    refitAll() {
        if (this.terminalManager) {
            this.terminalManager.refitAllTerminals();
        }
    }
}