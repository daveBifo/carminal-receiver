class TerminalManager {
    constructor() {
        this.terminals = new Map(); // sessionId -> { term, fitAddon, container, resizeObserver }
        this.terminalContainer = document.getElementById('terminal-container');
    }
    
    // Creates a new xterm.js instance and appends it to the DOM
    createTerminal(sessionId) {
        if (this.terminals.has(sessionId)) {
            console.warn(`Terminal for session ${sessionId} already exists.`);
            return;
        }

        const terminalPane = document.createElement('div');
        terminalPane.id = `term-${sessionId}`;
        terminalPane.className = 'terminal-pane';
        this.terminalContainer.appendChild(terminalPane);

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 18,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            theme: this.getDefaultTheme() // Placeholder for actual theme from ThemeEngine
        });
        
        const fitAddon = new FitAddon.FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalPane);
        fitAddon.fit();

        // Observe parent element for size changes to refit the terminal
        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
        });
        resizeObserver.observe(terminalPane);
        
        this.terminals.set(sessionId, { term, fitAddon, container: terminalPane, resizeObserver });
        console.log(`Created terminal for session: ${sessionId}`);
        return term;
    }

    // Ensures a terminal exists for a session before writing to it
    ensureTerminal(sessionId) {
        if (!this.terminals.has(sessionId)) {
            // Need to create the actual DOM element for the terminal
            // This logic might be better placed in layout-manager or coordinated by receiver.js
            // For now, we'll just create it. Layout will be handled by layout-manager.js
            this.createTerminal(sessionId);
        }
        return this.terminals.get(sessionId).term;
    }
    
    write(sessionId, data) {
        const terminal = this.ensureTerminal(sessionId);
        terminal.write(data);
    }
    
    clear(sessionId) {
        const terminal = this.terminals.get(sessionId);
        if (terminal) {
            terminal.term.clear();
        }
    }

    removeTerminal(sessionId) {
        const terminalEntry = this.terminals.get(sessionId);
        if (terminalEntry) {
            terminalEntry.resizeObserver.disconnect();
            terminalEntry.term.dispose();
            terminalEntry.container.remove();
            this.terminals.delete(sessionId);
            console.log(`Removed terminal for session: ${sessionId}`);
        }
    }
    
    updateSessionInfo(sessionId, hostname, envType, frameColor) {
        const terminalEntry = this.terminals.get(sessionId);
        if (terminalEntry) {
            this.renderFrame(terminalEntry.container, envType, frameColor, hostname);
        } else {
            console.warn(`Attempted to update session info for non-existent terminal: ${sessionId}`);
        }
    }
    
    renderFrame(container, envType, frameColor, hostname) {
        // Halbtransparenter Rahmen
        const color = frameColor || this.getEnvColor(envType);
        container.style.boxShadow = `inset 0 0 0 4px ${color}40`; // 40 = 25% opacity
        
        // Label
        let label = container.querySelector('.env-label');
        if (!label) {
            label = document.createElement('div');
            label.className = 'env-label';
            container.appendChild(label);
        }
        label.textContent = `${envType} - ${hostname}`;
        label.style.backgroundColor = `${color}80`;
    }
    
    getEnvColor(envType) {
        const colors = {
            'PROD': '#FF5555',
            'DEV': '#50FA7B',
            'TEST': '#FFB86C',
            'CUSTOM': '#8BE9FD'
        };
        return colors[envType] || colors.CUSTOM;
    }
    
    getDefaultTheme() {
        return {
            background: '#0D0D0D',
            foreground: '#F8F8F2',
            cursor: '#F8F8F2',
            // Colors based on Dracula theme for better terminal experience
            black: '#21222C',
            red: '#FF5555',
            green: '#50FA7B',
            yellow: '#F1FA8C',
            blue: '#BD93F9',
            magenta: '#FF79C6',
            cyan: '#8BE9FD',
            white: '#F8F8F2',
            brightBlack: '#6272A4',
            brightRed: '#FF6E6E',
            brightGreen: '#69FF94',
            brightYellow: '#FFFF9D',
            brightBlue: '#CAB6F9',
            brightMagenta: '#FF92DF',
            brightCyan: '#A4FFFF',
            brightWhite: '#FFFFFF'
        };
    }

    refitAllTerminals() {
        this.terminals.forEach(entry => entry.fitAddon.fit());
    }
}