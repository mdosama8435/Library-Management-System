import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as bookService from '../services/bookService';
import * as memberService from '../services/memberService';
import * as borrowService from '../services/borrowService';
import type { Book } from '../types/book';
import type { Member } from '../types/member';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';

export const IssueBook: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get('bookId') || '';

  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId);

  // Default due date to 14 days from today
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const tomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadPrerequisites = async () => {
    try {
      setIsLoadingData(true);
      setLoadError(null);

      const [membersRes, booksRes] = await Promise.all([
        memberService.getMembers(),
        bookService.getBooks({ limit: 100 }),
      ]);

      setMembers(membersRes.data);
      setBooks(booksRes.data);

      if (preselectedBookId) {
        setSelectedBookId(preselectedBookId);
      } else if (booksRes.data.length > 0) {
        setSelectedBookId(booksRes.data[0]._id);
      }
      if (membersRes.data.length > 0) {
        setSelectedMemberId(membersRes.data[0]._id);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setLoadError(errorObj?.message || 'Failed to load catalog and member data.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadPrerequisites();
  }, [preselectedBookId]);

  const selectedBook = books.find((b) => b._id === selectedBookId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      showToast('Please select a member.', 'error');
      return;
    }

    if (!selectedBookId) {
      showToast('Please select a book to issue.', 'error');
      return;
    }

    if (!selectedBook || selectedBook.availableCopies <= 0) {
      showToast('No copies available for this book.', 'error');
      return;
    }

    if (!dueDate) {
      showToast('Please specify a valid due date.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await borrowService.issueBook({
        memberId: selectedMemberId,
        bookId: selectedBookId,
        dueDate,
      });

      showToast('Book issued successfully to member.', 'success');

      // Refresh catalog data
      const updatedBooksRes = await bookService.getBooks({ limit: 100 });
      setBooks(updatedBooksRes.data);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      showToast(errorObj?.message || 'Unable to issue book.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner message="Loading circulation data..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorMessage
        title="Failed to Load Prerequisites"
        message={loadError}
        onRetry={loadPrerequisites}
      />
    );
  }

  const availabilityPercentage = selectedBook && selectedBook.totalCopies > 0
    ? Math.round((selectedBook.availableCopies / selectedBook.totalCopies) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Issue a Book
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Create a new borrowing record and assign inventory holdings to a member.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Issue Form */}
        <div className="lg:col-span-7 bg-white border border-[#E3E8EE] rounded-lg p-5">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-[#172033]">
              Circulation Form
            </h2>
            <p className="text-xs text-slate-500">Record a loan transaction</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Select Member */}
            <div>
              <label
                htmlFor="memberSelect"
                className="block font-medium text-slate-700 mb-1"
              >
                Member *
              </label>
              <select
                id="memberSelect"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="">— Select an enrolled member —</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.membershipId})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Book */}
            <div>
              <label
                htmlFor="bookSelect"
                className="block font-medium text-slate-700 mb-1"
              >
                Book Title *
              </label>
              <select
                id="bookSelect"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="">— Select a title from catalog —</option>
                {books.map((book) => {
                  const isOutOfStock = book.availableCopies <= 0;
                  return (
                    <option
                      key={book._id}
                      value={book._id}
                      disabled={isOutOfStock}
                    >
                      {book.title} — {book.author} ({book.availableCopies} available)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Due Date Input */}
            <div>
              <label
                htmlFor="dueDate"
                className="block font-medium text-slate-700 mb-1"
              >
                Due Date *
              </label>
              <input
                id="dueDate"
                type="date"
                required
                min={tomorrowDate()}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] cursor-pointer"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standard circulation period: 14 days from checkout.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedMemberId ||
                  !selectedBookId ||
                  (selectedBook && selectedBook.availableCopies <= 0)
                }
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white rounded-lg font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Recording Loan...' : 'Issue Book'}</span>
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Official Catalog Information Panel */}
        <div className="lg:col-span-5 bg-white border border-[#E3E8EE] rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#172033]">
              Catalog Information Panel
            </h2>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {selectedBook ? (
            <div className="space-y-4 text-xs">
              
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {selectedBook.genre}
                </div>
                <h3 className="text-base font-bold text-[#172033] mt-0.5 leading-snug">
                  {selectedBook.title}
                </h3>
                <div className="text-xs text-slate-600 mt-0.5">By {selectedBook.author}</div>
              </div>

              {/* Restrained Availability Section with Thin Progress Bar */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Inventory Status:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBook.availableCopies} of {selectedBook.totalCopies} copies available
                  </span>
                </div>

                {/* Thin 4px Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      selectedBook.availableCopies > 0 ? 'bg-[#16845B]' : 'bg-[#C53030]'
                    }`}
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Out of Stock Warning */}
              {selectedBook.availableCopies <= 0 && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>No physical copies currently available on shelf.</span>
                </div>
              )}

              {/* Bibliographic Details */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ISBN</span>
                  <span className="font-mono text-slate-800">{selectedBook.ISBN}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Accessioned Copies</span>
                  <span className="text-slate-800 font-medium">{selectedBook.totalCopies}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Shelf Availability</span>
                  <span className="font-semibold text-[#16845B]">
                    {selectedBook.availableCopies > 0 ? `${selectedBook.availableCopies} in stack` : 'None'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
              <BookOpen className="w-6 h-6 stroke-[1.5]" />
              <p>Select a book from the circulation form to review catalog holdings.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default IssueBook;
