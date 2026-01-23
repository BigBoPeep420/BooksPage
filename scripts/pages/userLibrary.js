import { BookManager } from "../modules/bookManager.module.js";

export async function init(){
    
    //const bookMgr = new BookManager();
    let booksMem = [];
    const bkSearchDrawer = document.getElementById('bookSearchDrawer');




    document.addEventListener('click', e => {
        let targ = e.target.closest('#bookSearchToggle');
        if(targ){
            bkSearchDrawer.classList.toggle('collapsed');
            return;
        }
    });

    bkSearchDrawer.querySelector('#bookSearch').addEventListener('input', e => {
        
    })

    async function loadBooksFromDB() {
        const allBooks = await bookMgr.getAllBooks();

    }
}