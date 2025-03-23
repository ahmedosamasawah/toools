import {writable} from 'svelte/store'

const defaultSettings = {
    theme: 'light',
    fontSize: 'medium',
    normalizeText: true,
    fontFamily: 'Kitab',
    textDirection: 'rtl',
    autoFormatQuotes: true,
    showSpecialChars: false,
    autoFormatPunctuation: true,
    experimentalFeatures: false,
}

export const settings = writable(defaultSettings)
