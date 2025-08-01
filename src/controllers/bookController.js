const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { bookSchema } = require('../validations/book');

const getBooks = async (req, res) => {
  const books = await prisma.book.findMany({ where: { ownerId: req.user.id } });
  res.json(books);
};

const getBook = async (req, res) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (book && book.ownerId === req.user.id) {
    res.json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

const createBook = async (req, res) => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, author, publishedYear, isbn } = value;
  const book = await prisma.book.create({
    data: {
      title,
      author,
      isbn,
      publishedYear,
      ownerId: req.user.id,
    },
  });
  res.status(201).json(book);
};

const updateBook = async (req, res) => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, author, publishedYear, isbn } = value;
  const book = await prisma.book.updateMany({
    where: { id: req.params.id, ownerId: req.user.id },
    data: {
      title,
      author,
      isbn,
      publishedYear,
    },
  });

  if (book.count > 0) {
    res.json({ message: 'Book updated' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

const deleteBook = async (req, res) => {
  const book = await prisma.book.deleteMany({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (book.count > 0) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};