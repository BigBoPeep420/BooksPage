import { BookManager } from "../modules/bookManager.module.js";

export async function init(utilities){
    
    const bookMgr = new BookManager(utilities.dbi);
    let booksMem = [];
    loadBooksFromDB();
    let booksToShow = [];
    const bkSearchDrawer = document.getElementById('bookSearchDrawer');
    const cardsGrid = document.getElementById('cardsGrid');
    const addBookBtn = document.getElementById('addBookButton');
    const dlgAddBook = document.getElementById('dlgAddBook');


    dlgAddBook.showPopover() // < ----------------------- DELETE!


    document.addEventListener('click', e => {
        let targ = e.target.closest('#bookSearchToggle');
        if(targ){
            bkSearchDrawer.classList.toggle('collapsed');
            return;
        }

        targ = addBookBtn.contains(e.target);
        if(targ){
            dlgAddBook.showPopover();
        }

    }, {signal: utilities.abort});

    bkSearchDrawer.querySelector('#bookSearch').addEventListener('input', e => {
        const input = e.target.value.toLowerCase().trim();
        if(!input) {
            cardsGrid.replaceChildren();
            booksMem.forEach(book => {
                cardsGrid.append(makeBookCard(book));
            });
        }
        
    });

    async function loadBooksFromDB() {
        const allBooks = await bookMgr.getAllBooks();
        booksMem = allBooks.map(book => ({...book, searchBlob: `${book.title} ${book.author} ${book.isbn}`.toLocaleLowerCase()}));
    }

    function makeBookCard(book){
        const card = document.createElement('div'); card.classList.add('bookCard');
        const tit = document.createElement('p'); tit.classList.add('title');
        const auth = document.createElement('p'); auth.classList.add('author');
        const pgs = document.createElement('p'); pgs.classList.add('pages');
        const pgsDem = document.createElement('span'); pgsDem.textContent = 'pgs';
        const sum = document.createElement('p'); sum.classList.add('summary');
        const isbn = document.createElement('p'); isbn.classList.add('isbn');
        tit.textContent = book.title; auth.textContent = book.auth;
        pgs.textContent = book.pages; pgs.append(pgsDem);
        sum.textContent = book.summary; isbn.textContent = book.isbn;
        card.append(tit, auth, pgs, sum, isbn);
        return card;
    }
}