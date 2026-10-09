// model/bookModel.js

// 1. In-memory data store
const books = [
  { id: 1, title: 'Learning JavaScript', author: 'Saurabh Verma' },
  { id: 2, title: 'Learning TypeScript', author: 'Saras Verma' }
];

// 2. Helper to validate that an ID can be converted to an integer
function extractNumber(str) {
  if (typeof str !== 'string') return false;
  return /^\d+$/.test(str.trim()) ? Number(str) : false;
}

// 3. Export data operations
const BookModel = {
  // Return the entire list
  findAll: () => {
    return books;
  },

  // Find a specific book by ID
  findById: (id) => {
    const searchID = extractNumber(id);
    if (!searchID) return { error: 'INVALID_ID' };

    const book = books.find((b) => b.id === searchID);
    return book || null;
  },

  // Append a new book and return the created object
  create: (title, author) => {
    const newBook = {
      id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
      title: title.trim(),
      author: author.trim()
    };
    books.push(newBook);
    return newBook;
  }
};

module.exports = BookModel;