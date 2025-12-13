let books = [];
let originalBooks = [];
let currentId = 1;
const RENDER_BOOK = 'render-book';
const BOOK_SAVED = 'buku-saved';

const checkbox = document.getElementById('bookFormIsComplete');
const placeLabel = document.getElementById('placeLabel');
const STORAGE_KEY = 'local-storage';

checkbox.addEventListener('change', function () {
    placeLabel.innerText = checkbox.checked
        ? "Sudah selesai dibaca"
        : "Belum selesai dibaca";
})

function generateId() {
    return currentId++;
}

function addBook() {
    const bookId = generateId();
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const yearReleased = document.getElementById('bookFormYear').value;
    const isDoneRead = document.getElementById('bookFormIsComplete').checked;

    const book = { bookId, bookTitle, bookAuthor, yearReleased, isDoneRead };

    books.push(book);
    originalBooks.push(book);

    console.log(books);

    document.getElementById('bookForm').reset();
    placeLabel.innerText = "Belum selesai dibaca";

    document.dispatchEvent(new Event(RENDER_BOOK));
    saveBookToLocal('insert');
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    const searchBookForm = document.getElementById('searchBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (typeof Storage !== undefined) {
        loadDataFromLocal();
    }
});

document.addEventListener('render-book', function () {
    const incompleteList = document.getElementById('incompleteBookList');
    const completedList = document.getElementById('completeBookList');

    // Kosongkan list dulu
    incompleteList.innerHTML = '';
    completedList.innerHTML = '';

    let incompleteCount = 0;
    let completeCount = 0;

    // Render ulang semua buku
    for (const book of books) {
        const bookElement = makeBook(book);

        if (book.isDoneRead) {
            completedList.appendChild(bookElement);
            completeCount++;
        } else {
            incompleteList.appendChild(bookElement);
            incompleteCount++;
        }
    }

    // Kalau list belum selesai kosong → tampilkan H1 default
    if (incompleteCount === 0) {
        const empty = document.createElement('h1');
        empty.classList.add('no-book');
        empty.innerText = "Belum ada buku yang dimasukkan";
        incompleteList.appendChild(empty);
    }

    // Kalau list selesai kosong → tampilkan H1 default
    if (completeCount === 0) {
        const empty = document.createElement('h1');
        empty.classList.add('no-book');
        empty.innerText = "Belum ada buku yang dimasukkan";
        completedList.appendChild(empty);
    }
});


function makeBook(bookObject) {
    const { bookId, bookTitle, bookAuthor, yearReleased, isDoneRead } = bookObject;

    // Container buku
    const bookContainer = document.createElement('div');
    bookContainer.classList.add('book-container');
    bookContainer.setAttribute('data-bookid', bookId);
    bookContainer.setAttribute('data-testid', 'bookItem');

    // Judul buku
    const titleElement = document.createElement('h3');
    titleElement.setAttribute('data-testid', 'bookItemTitle');
    titleElement.classList.add('title');
    titleElement.innerText = bookTitle;

    // Penulis buku
    const authorElement = document.createElement('p');
    authorElement.setAttribute('data-testid', 'bookItemAuthor');
    authorElement.classList.add('author');
    authorElement.innerText = "Penulis: " + bookAuthor;

    // Tahun buku
    const yearElement = document.createElement('p');
    yearElement.setAttribute('data-testid', 'bookItemYear');
    yearElement.classList.add('year');
    yearElement.innerText = "Tahun: " + yearReleased;

    // Tombol
    const buttonContainer = document.createElement('div');

    if (!isDoneRead) {
        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fa-solid fa-check"></i>';
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        completeButton.addEventListener('click', function (event) {
            addBookToDone(bookId);
        });

        buttonContainer.append(completeButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.addEventListener('click', function () {
        deleteBook(bookId);
    });

    buttonContainer.append(deleteButton);

    // Gabungkan ke container
    bookContainer.append(titleElement, authorElement, yearElement, buttonContainer);

    return bookContainer;
}

function addBookToDone(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === null) return;

    bookTarget.isDoneRead = true;
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveBookToLocal('move');
}

function findBook(bookId) {
    for (const book of books) {
        if (book.bookId === bookId) {
            return book;
        }
    }
    return null;
}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === null) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveBookToLocal('delete');
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].bookId === bookId) {
            return index;
        }
    }

    return null;
}

function saveBookToLocal(method) {
    if (typeof Storage !== undefined) {
        const parsedData = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedData);
        document.dispatchEvent(new CustomEvent(BOOK_SAVED, {
            detail: { method }
        }));
    }
}

document.addEventListener('buku-saved', function (event) {
    console.log('buku berhasil disimpan');

    switch (event.detail.method) {
        case 'insert':
            showToast('buku ditambahkan');
            break;
        case 'move':
            showToast('buku dipindahkan');
            break;
        case 'delete':
            showToast('buku dihapus');
            break;
        default:
            showToast('method tidak diketahui');
    }
});

function loadDataFromLocal() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let parsedData = JSON.parse(rawData);

    if (parsedData !== null) {
        books = parsedData;
        originalBooks = [...parsedData];
    }

    document.dispatchEvent(new Event(RENDER_BOOK));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function searchBook() {
    const userInput = document.getElementById('searchBookTitle').value.trim().toLowerCase();

    if (userInput) {
        books = originalBooks.filter(book =>
            book.bookTitle.toLowerCase().includes(userInput) ||
            book.bookAuthor.toLowerCase().includes(userInput) ||
            book.yearReleased.toLowerCase().includes(userInput)
        );
    } else {
        books = [...originalBooks];
    }

    document.dispatchEvent(new Event(RENDER_BOOK));
}