import { SitePreferences, ThemeManager } from "./modules/sitePreferences.module.js";
import { dbi } from "./dbConfig.js";
dbi.open();

//#region Define Themes
const helheim = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#404046', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE', }
const asgard = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#d8d8c2', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE', }
const midgard = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#816d53', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE', }
const muspelheim = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#864c4c', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE', }
const niflheim = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#222552', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#491414', '--colorValid': '#AEAEAE', }
//#endregion

async function init(){
    const sitePrefs = new SitePreferences(dbi);
    let abortCont = null;
    const navBar = document.getElementById('navBar');
    const dlgPrefs = document.getElementById('dlgPreferences');
    const utilities = {prefs: 'sitePrefs', abort: abortCont, navigate: navigate, dbi: dbi};

    //#region Initialize Themes
    const themeMgr = new ThemeManager(sitePrefs);
    themeMgr.registerTheme('helheim', helheim);
    themeMgr.registerTheme('asgard', asgard);
    themeMgr.registerTheme('midgard', midgard);
    themeMgr.registerTheme('muspelheim', muspelheim);
    themeMgr.registerTheme('niflheim', niflheim);
    themeMgr.loadSavedTheme();
    dlgPrefs.querySelectorAll('.themeButton').forEach( v => {
        const theme = themeMgr.themes.get(v.dataset.theme)
        const box = v.querySelector('div');
        box.style.setProperty('background-color', theme['--colorSecMid'])
    })
    //#endregion

    document.addEventListener('click', async e => {
        if(!navBar.contains(e.target) && !navBar.classList.contains('collapsed')){
            toggleNavBar();
        }

        let targ = e.target.closest('#navBar li');
        if(targ){
            if(targ.dataset.page == 'about'){

            }else if(targ.dataset.page == 'preferences'){
                dlgPrefs.showPopover();
            }else await navigate(targ.dataset.page);
            toggleNavBar();
            return;
        }

        targ = e.target.closest('.themeButton');
        if(targ){
            themeMgr.applyTheme(targ.dataset.theme);
            return;
        }

        targ = e.target.closest('#dlgPreferences .close');
        if(targ){
            dlgPrefs.hidePopover();
        }
    })


    document.getElementById('navBarToggle').addEventListener('click', e => {
        e.stopPropagation();
        toggleNavBar();
    })


    const INDEXES = {
        'books': [{name: 'title', keyPath: 'title', options: {unique: false}},
            { name: 'author', keyPath: 'author', options: {unique: false}},
            { name: 'isbn', keyPath: 'isbn', options: {unique: true}},]
    }
    const storename = 'books';


    navigate('userLibrary');



    async function navigate(page){
        const resp = await fetch(`./pages/${page}.html`);
        const cont = document.getElementById('content');
        cont.replaceChildren();
        if(!resp.ok){
            const err = document.createElement('div'); err.classList.add('errMsg');
            const img = document.createElement('img'); img.src = '../images/icons/car-brake-alert.svg';
            const msg = document.createElement('p'); msg.textContent = 'Page Not Found :(';
            const msg2 = document.createElement('p'); msg2.textContent = "Don't worry, you can blame someone else this time."
            err.append(img, msg, msg2); cont.append(err);
        }else{
            const pg = await resp.text();
            cont.innerHTML = pg;
            if(abortCont) {
                abortCont.abort();
                abortCont = null;
            }
            const code = await import(`./pages/${page}.js`);
            if(code){
                abortCont = new AbortController;
                utilities.abort = abortCont;
                code.init(utilities);
            }
        }
    }

    function toggleNavBar(bool){
        switch(bool){
            case true:
                navBar.classList.remove('collapsed');
                break;
            case false:
                navBar.classList.add('collapsed');
                break;
            default:
                navBar.classList.toggle('collapsed')
        }
    }

}
init();

