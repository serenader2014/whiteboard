import bookshelf from 'bookshelf';
import knex from './connection';

const blogBookshelf = bookshelf(knex);
blogBookshelf.plugin('pagination');

export default blogBookshelf;
