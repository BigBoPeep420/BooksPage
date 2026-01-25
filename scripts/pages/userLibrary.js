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


    document.addEventListener('click', async e => {
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

        targ = e.target.closest('#dlgBookInfo .close');
        if(targ){
            dlgBookInfo.close();
            return;
        }

        targ = e.target.closest('#dlgBookInfo .delete');
        if(targ){
            await bookMgr.deleteBookByISBN(dlgBookInfo.dataset.isbn);
            const index = booksMem.findIndex(book => book.isbn == dlgBookInfo.dataset.isbn);
            booksMem.splice(index, 1);
            document.getElementById('bookSearch').dispatchEvent(new InputEvent('input'));
            dlgBookInfo.close();
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
            utilities.notify('iconFailure', ['Book with ISBN already exists!']);
            return;
        }

        try{
            const book = new Book(title, author, pages, summary, isbn, read);
            await bookMgr.addBook(book);
            booksMem.push({...book, searchBlob: `${book.title} ${book.author} ${book.isbn}`.toLowerCase()});
            utilities.notify('iconSuccess', [`Added '${book.title}' to library!`]);
            dlgAddBook.hidePopover();
            bkSearchDrawer.querySelector('#bookSearch').dispatchEvent(new InputEvent('input'));
        }catch (e) {
            utilities.notify('iconFailure', ['Failed to add book :(', `${e}`]);
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
        read.classList.add('hasTooltip');
        let readIco;
        switch(book.read){
            case 'Yes':
                readIco = utilities.createIcon('iconReadYes');
                read.classList.add('yes');
                read.dataset.tip = "You've read this book!";
                break;
            case 'Started':
                readIco = utilities.createIcon('iconReadStarted');
                read.classList.add('started');
                read.dataset.tip = "You've started this book.";
                break;
            default:
                readIco = utilities.createIcon('iconReadNo');
                read.classList.add('no');
                read.dataset.tip = "You haven't started this one yet...";
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
        dlgBookInfo.dataset.isbn = book.isbn;
        dlgBookInfo.querySelector('.title p').textContent = book.title;
        dlgBookInfo.querySelector('.author p').textContent = book.author;
        dlgBookInfo.querySelector('.pages p').textContent = book.pages;
        dlgBookInfo.querySelector('.summary p').textContent = book.summary;
        const read = dlgBookInfo.querySelector('.read');
        const icon = read.querySelector('.icon');
        switch(book.read){
            case 'Yes':
                icon.replaceWith(utilities.createIcon('iconReadYes'));
                read.classList.remove('Started', 'No');
                read.dataset.tip = "You've read this book!";
                break;
            case 'Started':
                icon.replaceWith(utilities.createIcon('iconReadStarted'));
                read.classList.remove('Yes', 'No');
                read.dataset.tip = "You've started reading this book";
                break;
            default:
                icon.replaceWith(utilities.createIcon('iconReadNo'));
                read.classList.remove('Yes', 'Started');
                read.dataset.tip = "You haven't started this book yet..."
                break;
        }
        read.classList.add(book.read);
        dlgBookInfo.querySelector('.isbn p').textContent = 'ISBN: ' + isbn;
        dlgBookInfo.showModal();
    }
}