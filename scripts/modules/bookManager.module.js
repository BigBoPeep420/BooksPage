export class BookManager{
    constructor(dbi){
        this.dbi = dbi;
    }

    async addBook(book){
        return await this.dbi.add('books', book);
    }

    async getBook(id){
        return await this.dbi.get('books', id);
    }

    async getAllBooks(){
        return await this.dbi.getAll('books');
    }

    async findByAuthor(author){
        return await this.dbi.queryByIndex('books', 'author', author);
    }

    async findByTitle(title){
        return await this.dbi.queryByIndex('books', 'title', title);
    }

    async findByISBN(isbn){
        return await this.dbi.queryByIndex('books', 'isbn', isbn);
    }

    async updateBook(book){
        return await this.dbi.put('books', book);
    }

    async deleteBookByID(id){
        return await this.dbi.delete('books', id);
    }

    async deleteBookByISBN(isbn){
        const key = await this.dbi.getKeyByIndex('books', 'isbn', isbn);
        if(key){
            return await this.dbi.delete('books', key);
        }
    }
}

export class Book{
    title;
    author;
    pages;
    summary;
    isbn;
    read;

    constructor(title = '', author = '', pages = 1, summary = '', isbn = 1, read){
        if(title.length < 3) throw new RangeError('Title must be at least 3 characters');
        if(author.length < 3) throw new RangeError('Author must be at least 3 characters');
        if(pages < 1) throw new RangeError(`Pages must be at least 1`);
        const isbnDig = isbn.toString().length;
        if(/^(\d{10}|\d{13})$/.test(isbn)){
            this.title = title;
            this.author = author;
            this.pages = pages;
            this.summary = summary;
            this.isbn = isbn;
            this.read = read ? read : 'No';
        }else throw new RangeError('ISBN must be 10 or 13 digits');
    }

    static generateBook(){
        //GenTitle
        let randNum = this.#randInt(2, 6);
        const title = [];
        for(let i = 0; i < randNum; i++){
            title.push(this.#generateWord(true));
        }
        //GenAuthor
        randNum = this.#randInt(2, 4);
        const author = [];
        for(let i = 0; i < randNum; i++){
            let word = this.#generateWord(true, true);
            if(word.length == 1) word = word + '.';
            author.push(word);
        }
        //GenPages
        const pages = this.#randInt(50, 1000);
        //GenSummary
        randNum = this.#randInt(3, 6);
        const summary = [];
        for(let i = 0; i < randNum; i++){
            const sentLength = this.#randInt(6, 16);
            const sent = [];
            for(let i = 0; i < sentLength; i++){
                sent.push(this.#generateWord(i == 0));
            }
            summary.push(sent.join(' '));
        }
        //GenISBN
        const isbn = [];
        const isbnLength = Math.random() >= 0.5 ? 10 : 13;
        for(let i = 0; i < isbnLength; i++){
            isbn.push(Math.floor(Math.random() * 9));
        }
        //GenRead
        const rand = Math.floor(Math.random() * 3);
        let read = rand > 0 ? 'Yes' : 'Started';
        read = rand > 1 ? 'No' : read;

        return new Book(title.join(' '), author.join(' '), pages, summary.join('. '), isbn.join(''), read);
    }

    static #generateWord(capitalize = false, allowSingles = false){
        const consonants = ['b','c','d','f','g','h','j','k',
            'l','m','n','p','q','r','s','t','v','w','x','z'];
        const vowels = ['a','e','i','o','u','y']
        const randNum = Math.floor(Math.random() * 9 + 1);
        let word = [];
        if(randNum == 1){
            const bool = Math.random() >= 0.5;
            if(allowSingles){
                word.push(bool ? consonants[this.#randInt(0, consonants.length)] : vowels[this.#randInt(0, vowels.length)]);
            }else word.push(bool ? 'a' : 'I');
        }else if(randNum == 2){
            word.push(getConsonant());
            word.push(getVowel());
        }else if(randNum == 3){
            const lets = [getConsonant(), getConsonant(), getVowel()];
            for(let i = lets.length - 1; i > 0; i--){
                const x = Math.floor(Math.random() * (i + 1));
                [lets[i], lets[x]] = [lets[x], lets[i]];
            }
            word = [...lets];
        }else for(let i = 0; i < randNum; i++){
            word.push(Math.random() >= 0.5 ? getConsonant() : getVowel());
        }

        if(capitalize){
            const fL = word.shift().toLocaleUpperCase();
            word.unshift(fL);
        }
        return word.join('');

        function getConsonant(){
            return consonants[Math.floor(Math.random() * consonants.length)];
        }
        function getVowel(){
            return vowels[Math.floor(Math.random() * vowels.length)];
        }

    }

    static #randInt(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
}