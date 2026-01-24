import { dbi } from "../dbConfig.js";
import { BookManager, Book } from "../modules/bookManager.module.js";

export async function init(utilities){
    
    const bookMgr = new BookManager(utilities.dbi);
    let booksMem;
    let booksToShow = [];
    await loadBooksFromDB();
    const bkSearchDrawer = document.getElementById('bookSearchDrawer');
    const cardsGrid = document.getElementById('cardsGrid');
    const addBookBtn = document.getElementById('addBookButton');
    const dlgAddBook = document.getElementById('dlgAddBook');
    const dlgBookInfo = document.getElementById('dlgBookInfo');

    renderBookCards();


    document.addEventListener('click', e => {
        let targ = e.target.closest('#bookSearchToggle');
        if(targ){
            bkSearchDrawer.classList.toggle('collapsed');
            return;
        }

        targ = addBookBtn.contains(e.target);
        if(targ){
            dlgAddBook.querySelector('form').reset();
            dlgAddBook.showPopover();
            return;
        }

        targ = e.target.closest('#dlgAddBook .close');
        if(targ){
            dlgAddBook.hidePopover();
            return;
        }

        targ = e.target.closest('.bookCard');
        if(targ){
            showBookInfo(targ.dataset.isbn);
            return;
        }

        if(e.target == dlgBookInfo){
            const rect = dlgBookInfo.getBoundingClientRect();
            const inside = (e.clientX >= rect.left && e.clientX <= rect.right
                && e.clientY >= rect.top && e.clientY <= rect.bottom);
            if(!inside) dlgBookInfo.close();
        }
    }, {signal: utilities.abort});

    bkSearchDrawer.querySelector('#bookSearch').addEventListener('input', e => {
        const input = e.target.value.toLowerCase().trim().split(' ');
        if(!input) {
            cardsGrid.replaceChildren();
            booksToShow = [...booksMem];
        }else{
            console.log(input)
            booksToShow = booksMem.filter(book => input.every(term => book.searchBlob.includes(term)));
        }
        renderBookCards();
    });

    dlgAddBook.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        const title = data.get('title'); const author = data.get('author');
        const pages = data.get('pages'); const summary = data.get('summary');
        const isbn = data.get('isbn'); const read = data.get('read');
        console.log(await bookMgr.findByISBN(isbn))
        if(bookMgr.findByISBN(isbn)[0]){
            utilities.notify('failure', ['Book with ISBN already exists!']);
            return;
        }

        try{
            const book = new Book(title, author, pages, summary, isbn, read);
            await bookMgr.addBook(book);
            booksMem.push({...book, searchBlob: `${book.title} ${book.author} ${book.isbn}`.toLowerCase()});
            utilities.notify('success', [`Added '${book.title}' to library!`]);
            dlgAddBook.hidePopover();
            bkSearchDrawer.querySelector('#bookSearch').dispatchEvent(new InputEvent('input'));
        }catch (e) {
            utilities.notify('failure', ['Failed to add book :(', `${e}`]);
        }
    })








    async function loadBooksFromDB() {
        const allBooks = await bookMgr.getAllBooks();
        booksMem = allBooks.map(book => ({...book, searchBlob: `${book.title} ${book.author} ${book.isbn}`.toLocaleLowerCase()}));
        booksToShow = [...booksMem];
    }

    function makeBookCard(book){
        const card = document.createElement('div'); card.classList.add('bookCard');
        card.dataset.isbn = book.isbn; 
        const tit = document.createElement('p'); tit.classList.add('title');
        const auth = document.createElement('p'); auth.classList.add('author');
        const pgs = document.createElement('p'); pgs.classList.add('pages');
        const pgsDem = document.createElement('span'); pgsDem.textContent = 'pgs';
        const sum = document.createElement('p'); sum.classList.add('summary');
        const read = document.createElement('div'); read.classList.add('read');
        const readIco = document.createElement('img');
        switch(book.read){
            case 'Yes':
                readIco.src = './images/icons/emoticon-cool-outline.svg';
                read.classList.add('yes');
                break;
            case 'Started':
                readIco.src = './images/icons/emoticon-happy-outline.svg';
                read.classList.add('started');
                break;
            default:
                readIco.src = './images/icons/emoticon-cry-outline.svg';
                read.classList.add('no');
                break;
        }
        read.append(readIco);
        tit.textContent = book.title; auth.textContent = book.author;
        pgs.textContent = book.pages; pgs.append(pgsDem);
        sum.textContent = book.summary;
        card.append(tit, auth, pgs, sum, read);
        return card;
    }

    function renderBookCards(){
        cardsGrid.replaceChildren();
        booksToShow.forEach(book => {
                cardsGrid.append(makeBookCard(book));
            });
    }

    function showBookInfo(isbn){
        const book = booksMem.filter(book => book.searchBlob.includes(isbn))[0];
        dlgBookInfo.querySelector('.title p').textContent = book.title;
        dlgBookInfo.querySelector('.author p').textContent = book.author;
        dlgBookInfo.querySelector('.pages p').textContent = book.pages;
        dlgBookInfo.querySelector('.summary p').textContent = book.summary;
        const img = dlgBookInfo.querySelector('.read img');
        switch(book.read){
            case 'Yes':
                img.src = './images/icons/emoticon-cool-outline.svg';
                break;
            case 'Started':
                img.src = './images/icons/emoticon-happy-outline.svg';
                break;
            default:
                img.src = './images/icons/emoticon-cry-outline.svg';
                break;
        }
        dlgBookInfo.querySelector('.read').dataset.read = book.read.toLowerCase();
        dlgBookInfo.querySelector('.isbn p').textContent = 'ISBN: ' + isbn;
        dlgBookInfo.showModal();
    }
}