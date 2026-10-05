import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as bookService from '../services/bookService';
import * as memberService from '../services/memberService';
import type { Book } from '../types/book';
import type { Member } from '../types/member';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  BookOpen,
  BookmarkCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Radio,
  Clock,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [booksRes, membersRes] = await Promise.all([
        bookService.getBooks({ limit: 100 }),
        memberService.getMembers(),
      ]);

      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalBooks = books.length;
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const totalMembers = members.length;
  const lowStockCount = books.filter((b) => b.availableCopies <= 2 && b.availableCopies > 0).length;

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner message="Loading library system overview..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <ErrorMessage
        title="Unable to load dashboard"
        message={errorMessage}
        onRetry={loadDashboardData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Circulation metrics, holdings overview, and quick operations.
          </p>
        </div>

        <button
          onClick={() => navigate('/issue-book')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white rounded-lg font-medium text-xs transition active:scale-98 w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue Book</span>
        </button>
      </div>

      {/* Clean Editorial Metric Bar */}
      <div className="bg-white border border-[#E3E8EE] rounded-lg p-3.5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Total Titles</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">{totalBooks}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">catalog titles</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#16845B]" />
            <span>Available Copies</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">{availableCopies}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ready for checkout</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Registered Members</span>
          </div>
          <div className="text-xl font-bold text-[#172033] mt-1">{totalMembers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">active library accounts</div>
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
            <span>Low Stock</span>
          </div>
          <div className="text-xl font-bold text-[#B7791F] mt-1">{lowStockCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">&le; 2 copies remaining</div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Library Collection (clean table list) */}
        <div className="lg:col-span-8 bg-white border border-[#E3E8EE] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">
                Library Collection
              </h2>
              <p className="text-xs text-slate-500">
                Key titles currently cataloged in the library system
              </p>
            </div>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-medium text-[#1769AA] hover:underline flex items-center space-x-1"
            >
              <span>View all books</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-medium">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 px-3">Author</th>
                  <th className="py-2 px-3">Genre</th>
                  <th className="py-2 px-3">Availability</th>
                  <th className="py-2 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.slice(0, 6).map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-3 font-semibold text-[#172033]">
                        {book.title}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {book.author}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {book.genre}
                      </td>
                      <td className="py-2.5 px-3">
                        {isAvailable ? (
                          <span className="text-[#16845B] font-medium flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] mr-1.5" />
                            {book.availableCopies} available
                          </span>
                        ) : (
                          <span className="text-[#C53030] font-medium flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] mr-1.5" />
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        {isAvailable ? (
                          <button
                            onClick={() => navigate(`/issue-book?bookId=${book._id}`)}
                            className="text-[#1769AA] hover:underline font-medium"
                          >
                            Issue
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Status */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Actions (Simple links, not giant cards) */}
          <div className="bg-white border border-[#E3E8EE] rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => navigate('/issue-book')}
                className="w-full flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#1769AA] transition text-left"
              >
                <span>Issue a Book to Member</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/members')}
                className="w-full flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#1769AA] transition text-left"
              >
                <span>Manage Member Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/books')}
                className="w-full flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#1769AA] transition text-left"
              >
                <span>Search & Filter Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* System & Circulation Status */}
          <div className="bg-white border border-[#E3E8EE] rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              System Status
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Radio className="w-3 h-3 text-[#16845B]" />
                  <span>Library API</span>
                </span>
                <span className="font-medium text-[#16845B]">Online</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Default Due Period</span>
                </span>
                <span className="font-medium text-slate-800">14 Days</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
