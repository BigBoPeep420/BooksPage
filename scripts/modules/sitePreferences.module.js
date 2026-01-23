import { DBI } from "./dbi.module.js";

export class SitePreferences{
    constructor(dbi){
        this.dbi = dbi;
        this.cache = new Map();
    }

    async getPref(key, defaultValue = null){
        if(this.cache.has(key)) return this.cache.get(key);
        try{
            const res = await this.dbi.get('preferences',  key);
            const val = res ? res.value : defaultValue;
            this.cache.set(key, val);
            return val;
        }catch (error) {
            console.error(`Failed to get [Preference: ${key}:${typeof key}] : ` +
                `[Reason: ${error}]`);
            return defaultValue;
        }
    }

    async setPref(key, value){
        try{
            await this.dbi.put('preferences', {key, value});
            this.cache.set(key, value);
        }catch (error) {
            console.error(`Failed to set preference [Reason: ${error}]`);
        }
    }
}

export class ThemeManager{
    constructor(prefsManager){
        this.prefsManager = prefsManager;
        this.themes = new Map();
        this.currentTheme = null;
    }

    registerTheme(name, cssVariables){
        this.themes.set(name, cssVariables);
    }

    async applyTheme(name){
        const theme = this.themes.get(name);
        if(!theme){
            console.error(`Theme not found [Theme: ${name}:${typeof name}]`);
            return;
        }

        const root = document.documentElement;
        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        this.currentTheme = theme;
        await this.prefsManager.setPref('theme', name);
    }

    async loadSavedTheme(){
        const savedTheme = await this.prefsManager.getPref('theme', 'default');
        if(this.themes.has(savedTheme)){
            await this.applyTheme(savedTheme);
        }
    }

    getAvailableThemes(){
        return Array.from(this.themes.keys());
    }
}