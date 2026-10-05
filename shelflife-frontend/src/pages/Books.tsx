import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as bookService from '../services/bookService';
import type { Book, CreateBookRequest } from '../types/book';
import type { PaginationMeta } from '../types/common';
import DataTable from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import { useToast } from '../context/ToastContext';
import {
  Search,
  BookOpen,
  X,
  BookmarkCheck,
  Layers,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state for adding a new book
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmittingBook, setIsSubmittingBook] = useState<boolean>(false);
  const [newBook, setNewBook] = useState<CreateBookRequest>({
    title: '',
    author: '',
    ISBN: '',
    genre: '',
    totalCopies: 5,
    availableCopies: 5,
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Curated genre list for filtering
  const genreList = useMemo(() => {
    return [
      'All Genres',
      'Programming',
      'Computer Science',
      'Software Architecture',
      'Fiction',
      'Dystopian',
      'Artificial Intelligence',
      'Mathematics',
    ];
  }, []);

  // Fetch books from backend API with pagination and genre query
  const fetchBooks = useCallback(async (page: number, genre: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const queryParams: { page: number; limit: number; genre?: string } = {
        page,
        limit: 10,
      };

      if (genre && genre !== 'All' && genre !== 'All Genres') {
        queryParams.genre = genre;
      }

      const response = await bookService.getBooks(queryParams);
      setBooks(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const msg = errorObj?.message || 'Unable to load books from server.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(pagination.page, selectedGenre);
  }, [fetchBooks, pagination.page, selectedGenre]);

  // Client-side search on title
  const displayedBooks = useMemo(() => {
    if (!searchTitle.trim()) {
      return books;
    }
    const query = searchTitle.toLowerCase().trim();
    return books.filter((book) => book.title.toLowerCase().includes(query));
  }, [books, searchTitle]);

  // Summary stats calculated from loaded book data
  const summaryStats = useMemo(() => {
    const totalTitles = pagination.total || books.length;
    const availableCopiesCount = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const distinctGenres = new Set(books.map((b) => b.genre)).size;
    const lowStockCount = books.filter((b) => b.availableCopies <= 2 && b.availableCopies > 0).length;
    return {
      totalTitles,
      availableCopiesCount,
      distinctGenres,
      lowStockCount,
    };
  }, [books, pagination.total]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.ISBN.trim() || !newBook.genre.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    if (newBook.availableCopies > newBook.totalCopies) {
      showToast('Available copies cannot exceed total copies.', 'error');
      return;
    }

    try {
      setIsSubmittingBook(true);
      await bookService.createBook(newBook);
      showToast(`Book "${newBook.title}" added to library collection.`, 'success');
      setIsModalOpen(false);
      setNewBook({
        title: '',
        author: '',
        ISBN: '',
        genre: '',
        totalCopies: 5,
        availableCopies: 5,
      });
      fetchBooks(pagination.page, selectedGenre);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      showToast(errorObj?.message || 'Failed to add book.', 'error');
    } finally {
      setIsSubmittingBook(false);
    }
  };

  // Human-designed Academic Catalog Columns
  const columns: Column<Book>[] = [
    {
      key: 'index',
      header: '#',
      headerClassName: 'w-10 text-slate-400 font-normal',
      className: 'w-10 text-slate-400 text-xs font-mono',
      render: (_, index) => (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      key: 'title',
      header: 'Title & Author',
      headerClassName: 'text-slate-600',
      render: (book) => (
        <div className="py-0.5">
          <div className="font-semibold text-[#172033] hover:text-[#1769AA] transition-colors leading-snug">
            {book.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{book.author}</div>
        </div>
      ),
    },
    {
      key: 'ISBN',
      header: 'ISBN',
      headerClassName: 'text-slate-600',
      className: 'text-xs font-mono text-slate-600',
      render: (book) => book.ISBN,
    },
    {
      key: 'genre',
      header: 'Genre',
      headerClassName: 'text-slate-600',
      className: 'text-xs text-slate-600',
      render: (book) => book.genre,
    },
    {
      key: 'totalCopies',
      header: 'Total',
      headerClassName: 'text-center text-slate-600',
      className: 'text-center text-xs font-medium text-slate-700',
      render: (book) => book.totalCopies,
    },
    {
      key: 'availableCopies',
      header: 'Available',
      headerClassName: 'text-center text-slate-600',
      className: 'text-center text-xs font-semibold text-slate-800',
      render: (book) => book.availableCopies,
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'text-slate-600',
      render: (book) => {
        if (book.availableCopies === 0) {
          return (
            <span className="inline-flex items-center text-xs font-medium text-[#C53030]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] mr-1.5" />
              Out of stock
            </span>
          );
        }
        if (book.availableCopies <= 2) {
          return (
            <span className="inline-flex items-center text-xs font-medium text-[#B7791F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F] mr-1.5" />
              Low stock
            </span>
          );
        }
        return (
          <span className="inline-flex items-center text-xs font-medium text-[#16845B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] mr-1.5" />
            Available
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      headerClassName: 'text-right text-slate-600',
      className: 'text-right',
      render: (book) => {
        const canIssue = book.availableCopies > 0;
        return (
          <button
            onClick={() => navigate(`/issue-book?bookId=${book._id}`)}
            disabled={!canIssue}
            className={`inline-flex items-center space-x-1 text-xs font-medium transition ${
              canIssue
                ? 'text-[#1769AA] hover:text-[#125488] hover:underline'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{canIssue ? 'Issue Loan' : 'Unavailable'}</span>
            {canIssue && <ArrowRight className="w-3 h-3" />}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Catalog & Books
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your library collection, review holdings, and track inventory.
        </p>
      </div>

      {/* Restrained Editorial Metrics Bar - Single divided panel instead of 4 giant cards */}
      <div className="bg-white border border-[#E3E8EE] rounded-lg p-3.5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Total Titles</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">
            {summaryStats.totalTitles}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">registered in catalog</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#16845B]" />
            <span>Available Copies</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">
            {summaryStats.availableCopiesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">on shelf for lending</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Genres</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">
            {summaryStats.distinctGenres}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">subject classifications</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
            <span>Low Stock</span>
          </div>
          <div className="text-xl font-bold text-[#B7791F] mt-1">
            {summaryStats.lowStockCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">&le; 2 copies remaining</div>
        </div>
      </div>

      {/* Clean Toolbar: Search, Genre Select, and Add Book Button directly on page */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search books by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#1769AA] transition"
            />
            {searchTitle && (
              <button
                onClick={() => setSearchTitle('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Genre Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#1769AA] cursor-pointer"
            >
              {genreList.map((g) => (
                <option key={g} value={g === 'All Genres' ? 'All' : g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white rounded-lg font-medium text-xs transition active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <ErrorMessage
          title="Unable to load catalog"
          message={errorMessage}
          onRetry={() => fetchBooks(pagination.page, selectedGenre)}
        />
      )}

      {/* Catalog Data Table */}
      <DataTable<Book>
        data={displayedBooks}
        columns={columns}
        loading={isLoading}
        emptyTitle="No books found"
        emptyMessage={
          searchTitle
            ? `No titles match "${searchTitle}".`
            : 'No books found in this genre classification.'
        }
      />

      {/* Editorial Pagination Footer */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {displayedBooks.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total || displayedBooks.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{pagination.total || displayedBooks.length}</span> titles
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-6 h-6 rounded-md text-xs font-medium transition ${
                  p === pagination.page
                    ? 'bg-[#1769AA] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add New Book Modal - Clean 12px radius, enterprise form feel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 animate-fade-in">
          <div className="bg-white rounded-xl shadow-modal border border-slate-200 max-w-lg w-full p-5 sm:p-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Add Book to Catalog</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter publication and accession details</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBook} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Structure and Interpretation of Computer Programs"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9780262510875"
                    value={newBook.ISBN}
                    onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Genre / Classification *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newBook.totalCopies}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setNewBook({
                        ...newBook,
                        totalCopies: val,
                        availableCopies: Math.min(newBook.availableCopies, val),
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Available Copies *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newBook.totalCopies}
                    required
                    value={newBook.availableCopies}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        availableCopies: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBook}
                  className="px-4 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-medium rounded-lg transition disabled:opacity-60"
                >
                  {isSubmittingBook ? 'Adding Title...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
