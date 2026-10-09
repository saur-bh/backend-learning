const express = require('express');
const app = express();
const port = 3000;
const BookModel = require('./model/bookModel');

const logger = (req,res,next)=>{
  
  req.requestTime = new Date().toISOString();
  console.log(`[${req.requestTime}] ${req.method} ${req.originalUrl}`);
  next();
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

// Route 1: Root check
app.get('/', (req, res) => {
  res.send('<H1> HELLO.....<H1>');
});

// Route 2: Get all books
app.get('/book', (req, res) => {
  return res.status(200).json(BookModel.findAll());
});

app.get('/book/:id', (req, res) => {
  // 1. Read the parameter from req.params
  const targetId = req.params.id;

  // 2. Query the Model
  const result = BookModel.findById(targetId);

  // 3. Branch A: Malformed ID (Client Error -> 400 Bad Request)
  if (result && result.error === 'INVALID_ID') {
    return res.status(400).json({ error: 'Invalid ID format. Please provide a numeric ID.' });
  }

  // 4. Branch B: Valid ID format, but not in our list (404 Not Found)
  if (!result) {
    return res.status(404).json({ error: 'No such book found.' });
  }

  // 5. Branch C: Book found (200 OK)
  return res.status(200).json(result);
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

  // F. Call Model ONCE: It handles ID generation and storage internally
  const createdBook = BookModel.create(title, author);

  // G. Return the single created book
  return res.status(201).json({
    message: 'Book created successfully',
    data: createdBook
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