import { SitePreferences, ThemeManager } from "./modules/sitePreferences.module.js";
import { dbi } from "./dbConfig.js";
dbi.open();

//#region Define Themes
const helheim = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#404046', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE', 
    '--colorTextLight': '#FFFFFF', '--colorTextDark': '#999999',}

const asgard = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#d8d8c2', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE',
    '--colorTextLight': '#FFFFFF', '--colorTextDark': '#999999',}

const midgard = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#816d53', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#898989', '--colorValid': '#AEAEAE',
    '--colorTextLight': '#FFFFFF', '--colorTextDark': '#999999',}

const muspelheim = {'--colorPrimDark': '#55534e', '--colorPrimMid': '#8b8981','--colorPrimLight': '#b4b1a8', 
    '--colorSecDark': '#461b1b', '--colorSecMid': '#642727', '--colorSecLight': '#803131', 
    '--colorHighlight': '#965f18', '--colorInvalid': '#881717', '--colorValid': '#144412',
    '--colorTextLight': '#d6c287', '--colorTextDark': '#ad9c69',}

const niflheim = {'--colorPrimDark': '#544455', '--colorPrimMid': '#898989','--colorPrimLight': '#AEAEAE', 
    '--colorSecDark': '#544455', '--colorSecMid': '#222552', '--colorSecLight': '#AEAEAE', 
    '--colorHighlight': '#544455', '--colorInvalid': '#491414', '--colorValid': '#AEAEAE',
    '--colorTextLight': '#FFFFFF', '--colorTextDark': '#999999',}
//#endregion



async function init(){
    const sitePrefs = new SitePreferences(dbi);
    let abortCont = null;
    const navBar = document.getElementById('navBar');
    const dlgPrefs = document.getElementById('dlgPreferences');
    const notification = document.getElementById('notification');
    const tooltip = document.getElementById('tooltip');
    let notificationTimer = null;
    const utilities = {prefs: sitePrefs, abort: abortCont, navigate: navigate, dbi: dbi, notify: notify, createIcon: createIcon};

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
            return;
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
            return;
        }
    })

    document.addEventListener('mousemove', e => {
        const targ = e.target.closest('.hasTooltip');
        if(targ){
            tooltip.querySelector('p').textContent = targ.dataset.tip;
            const x = e.clientX + 20;
            const rEd = window.innerWidth - tooltip.offsetWidth;
            const fX = x > rEd ? e.clientX - tooltip.offsetWidth - 20 : x;
            tooltip.style.transform = `translate(${fX}px, ${e.clientY + 20}px)`;
            tooltip.showPopover();
        }else{
            tooltip.hidePopover();
        }
    })

    navBar.querySelector('#navBarToggle').addEventListener('click', e => {
        e.stopPropagation();
        toggleNavBar();
    })

    notification.querySelector('.close').addEventListener('click', e => {
        e.stopPropagation();
        notification.hidePopover();
        clearTimeout(notificationTimer);
        notificationTimer = null;
    })


    navigate('userLibrary');

    async function navigate(page){
        const resp = await fetch(`./pages/${page}.html`);
        const cont = document.getElementById('content');
        cont.replaceChildren();
        if(!resp.ok){
            const err = document.createElement('div'); err.classList.add('errMsg');
            const icon = createIcon('iconFailure');
            const msg = document.createElement('p'); msg.textContent = 'Page Not Found :(';
            const msg2 = document.createElement('p'); msg2.textContent = "Don't worry, you can blame someone else this time."
            err.append(icon, msg, msg2); cont.append(err);
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
                utilities.abort = abortCont.signal;
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
        if(navBar.classList.contains('collapsed')){
            navBar.querySelector('#navBarToggle svg').replaceWith(createIcon('iconNavBarOpen'));
        }else{
            navBar.querySelector('#navBarToggle svg').replaceWith(createIcon('iconNavBarClose'))
        }
    }

    function notify(icon, message = []){
        const notifIcon = notification.querySelector('.icon');
        const notifMsg = notification.querySelector('.message');
        notifIcon.replaceWith(createIcon(icon ? icon : 'iconError'))
        const p1 = document.createElement('p');
        if(!message.length > 1){
            p1.textContent = message[0] ? message[0] : 'Uh oh! Someone else messed up...';
            notifMsg.replaceChildren(p1);
        }else{
            notifMsg.replaceChildren();
            message.forEach(v => {
                const p = document.createElement('p');
                p.textContent = v;
                notifMsg.append(p);
            });
        }
        if(notificationTimer){
            clearTimeout(notificationTimer);
            notificationTimer = null;
        }
        notificationTimer = setTimeout(() => {
            notification.hidePopover();
            clearTimeout(notificationTimer);
            notificationTimer = null;
        }, 4000);
        if(!notification.matches(':popover-open')) notification.showPopover();
    }

    function createIcon(iconID){
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('icon'); const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${iconID}`);
        svg.append(use);
        return svg;
    }

}
init();

