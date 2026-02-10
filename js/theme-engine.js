class ThemeEngine {
    constructor() {
        this.predefinedThemes = {
            'dark': {
                background: '#282a36',
                foreground: '#f8f8f2',
                cursor: '#f8f8f2',
                selection: '#44475a',
                black: '#000000',
                red: '#ff5555',
                green: '#50fa7b',
                yellow: '#f1fa8c',
                blue: '#bd93f9',
                magenta: '#ff79c6',
                cyan: '#8be9fd',
                white: '#f8f8f2',
                brightBlack: '#6272a4',
                brightRed: '#ff6e6e',
                brightGreen: '#69ff94',
                brightYellow: '#ffffa5',
                brightBlue: '#d6acff',
                brightMagenta: '#ff92df',
                brightCyan: '#a4ffff',
                brightWhite: '#ffffff'
            },
            'light': {
                background: '#fdf6e3',
                foreground: '#657b83',
                cursor: '#657b83',
                selection: '#eee8d5',
                black: '#073642',
                red: '#dc322f',
                green: '#859900',
                yellow: '#b58900',
                blue: '#268bd2',
                magenta: '#d33682',
                cyan: '#2aa198',
                white: '#eee8d5',
                brightBlack: '#002b36',
                brightRed: '#cb4b16',
                brightGreen: '#586e75',
                brightYellow: '#657b83',
                brightBlue: '#839496',
                brightMagenta: '#6c71c4',
                brightCyan: '#93a1a1',
                brightWhite: '#fdf6e3'
            },
            'blue': {
                background: '#272822',
                foreground: '#f8f8f2',
                cursor: '#f8f8f2',
                selection: '#49483e',
                black: '#272822',
                red: '#f92672',
                green: '#a6e22e',
                yellow: '#f4bf75',
                blue: '#66d9ef',
                magenta: '#ae81ff',
                cyan: '#a1efe4',
                white: '#f8f8f2',
                brightBlack: '#75715e',
                brightRed: '#f92672',
                brightGreen: '#a6e22e',
                brightYellow: '#f4bf75',
                brightBlue: '#66d9ef',
                brightMagenta: '#ae81ff',
                brightCyan: '#a1efe4',
                brightWhite: '#f9f8f5'
            }
        };
    }

    applyTheme(sessionId, themeConfig) {
        if (!window.receiver || !window.receiver.terminalManager) {
            console.error("TerminalManager not initialized.");
            return;
        }
        
        const terminalEntry = window.receiver.terminalManager.terminals.get(sessionId);
        if (terminalEntry) {
            let themeToApply = {};
            if (typeof themeConfig === 'string' && this.predefinedThemes[themeConfig]) {
                // Apply a predefined theme by name
                themeToApply = this.predefinedThemes[themeConfig];
            } else if (typeof themeConfig === 'object') {
                // Apply a custom theme object
                themeToApply = {
                    background: themeConfig.backgroundColor,
                    foreground: themeConfig.foregroundColor,
                    cursor: themeConfig.cursorColor,
                    // Assuming the themeConfig might have a 'colors' object for the palette
                    ...themeConfig.colors 
                };
            }

            if (Object.keys(themeToApply).length > 0) {
                terminalEntry.term.options.theme = themeToApply;
                console.log(`Theme applied to session ${sessionId}`);
            } else {
                console.warn(`Theme not found or invalid theme config for session ${sessionId}`);
            }
        } else {
            console.warn(`Terminal for session ${sessionId} not found.`);
        }
    }
}