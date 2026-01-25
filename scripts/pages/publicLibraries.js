import { Book } from '../modules/bookManager.module.js'

export async function init(utilities) {
    const cardsGrid = document.getElementById('cardsGrid');
    const numBooks = Math.floor(Math.random() * 10 + 10);
    for(let i = 0; i < numBooks; i++){
        const book = Book.generateBook();
        const card = makeBookCard(book);
        cardsGrid.append(card);
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
}