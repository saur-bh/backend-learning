const express = require('express');
const app = express();
const port = 3000;

const logger = (req,res,next)=>{
  
  req.requestTime = Date.now();
  console.log(`I m logged...${req.cookies}`)
  next()
}
// 1. Built-in middleware to parse JSON bodies
app.use(express.json());
app.use( "/book", logger)

// 2. Security Middleware: Catch malformed JSON syntax errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload provided.' });
  }
  next();
});

// In-memory data store
const books = [
  { id: 1, title: 'Learning JavaScript', author: 'Saurabh Verma' },
  { id: 2, title: 'Learning TypeScript', author: 'Saras Verma' }
];

// Helper: Ensure numeric ID
function extractNumber(str) {
  if (typeof str !== 'string') return false;
  return /^\d+$/.test(str.trim()) ? Number(str) : false;
}

// Route 1: Root check
app.get('/', (req, res) => {
  res.send('Saurabh Verma Server...');
});

// Route 2: Get all books
app.get('/book', (req, res) => {
  res.status(200).json(books);
});

// Route 3: Get single book by numeric ID
app.get('/book/:id', (req, res) => {
  const targetID = req.params.id;
  const searchID = extractNumber(targetID);

  if (!searchID) {
    return res.status(400).json({ error: 'Invalid ID format. Please provide a numeric ID.' });
  }

  const book = books.find((b) => b.id === searchID);

  if (!book) {
    return res.status(404).json({ error: 'No such book found.' });
  }

  return res.status(200).json(book);
});

// Route 4: Create a new book
app.post('/book', (req, res) => {
  // A. Guard against undefined body
  const body = req.body || {};

  // B. Whitelist: Block unexpected keys (Mass Assignment protection)
  const allowedKeys = ['title', 'author'];
  const incomingKeys = Object.keys(body);
  const unexpectedKeys = incomingKeys.filter((key) => !allowedKeys.includes(key));

  if (unexpectedKeys.length > 0) {
    return res.status(400).json({
      error: `Invalid payload. Unknown fields: ${unexpectedKeys.join(', ')}`
    });
  }

  // C. Safe Destructuring
  const { title, author } = body;

  // D. Validate 'title'
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed: "title" is required and must be a non-empty string.'
    });
  }

  // E. Validate 'author'
  if (!author || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed: "author" is required and must be a non-empty string.'
    });
  }

  // F. Business Logic: Generate ID, save to array, and return 201 Created
  const newBook = {
    id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
    title: title.trim(),
    author: author.trim()
  };

  books.push(newBook);

  return res.status(201).json({
    message: 'Book created successfully',
    data: newBook
  });
});

// 404 Catch-All Middleware (MUST stay at the very bottom)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});