import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as memberService from '../services/memberService';
import * as borrowService from '../services/borrowService';
import type { BorrowRecord } from '../types/borrowRecord';
import type { Member } from '../types/member';
import DataTable from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

export const MemberHistory: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReturningId, setIsReturningId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadHistory = useCallback(async () => {
    if (!memberId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [membersRes, historyRes] = await Promise.all([
        memberService.getMembers(),
        memberService.getMemberHistory(memberId),
      ]);

      const foundMember = membersRes.data.find((m) => m._id === memberId) || null;
      setMember(foundMember);
      setHistory(historyRes.data);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj?.message || 'Failed to load borrowing history.');
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const stats = useMemo(() => {
    const total = history.length;
    const now = new Date();
    const overdue = history.filter(
      (r) => !r.returnDate && (r.status === 'overdue' || new Date(r.dueDate) < now)
    ).length;
    const active = history.filter(
      (r) => !r.returnDate && r.status !== 'overdue' && new Date(r.dueDate) >= now
    ).length;
    const returned = history.filter((r) => r.status === 'returned' || !!r.returnDate).length;
    return { total, active, overdue, returned };
  }, [history]);

  const handleReturnBook = async (borrowId: string, bookTitle: string) => {
    try {
      setIsReturningId(borrowId);
      await borrowService.returnBook(borrowId);
      showToast(`"${bookTitle}" returned successfully. Available stock updated.`, 'success');
      await loadHistory();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      showToast(errorObj?.message || 'Failed to return book.', 'error');
    } finally {
      setIsReturningId(null);
    }
  };

  const columns: Column<BorrowRecord>[] = [
    {
      key: 'index',
      header: '#',
      headerClassName: 'w-10 text-slate-400 font-normal',
      className: 'w-10 text-slate-400 text-xs font-mono',
      render: (_, index) => index + 1,
    },
    {
      key: 'book',
      header: 'Book Title',
      headerClassName: 'text-slate-600',
      render: (record) => (
        <div>
          <span className="font-semibold text-[#172033]">
            {record.book?.title || 'Unknown Title'}
          </span>
          <div className="text-[11px] text-slate-500 mt-0.5">
            By {record.book?.author || 'Unknown'} · ISBN: {record.book?.ISBN || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      headerClassName: 'text-slate-600',
      className: 'text-xs text-slate-600',
      render: (record) =>
        new Date(record.issueDate).toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      headerClassName: 'text-slate-600',
      render: (record) => {
        const isPastDue = !record.returnDate && new Date(record.dueDate) < new Date();
        return (
          <span
            className={`text-xs ${
              isPastDue ? 'text-[#C53030] font-semibold' : 'text-slate-600'
            }`}
          >
            {new Date(record.dueDate).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      headerClassName: 'text-slate-600',
      className: 'text-xs text-slate-600',
      render: (record) => {
        if (!record.returnDate) {
          return <span className="text-slate-400 italic">Not returned</span>;
        }
        return (
          <span>
            {new Date(record.returnDate).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'text-slate-600',
      render: (record) => {
        const isReturned = record.status === 'returned' || !!record.returnDate;
        const isOverdue =
          !isReturned &&
          (record.status === 'overdue' || new Date(record.dueDate) < new Date());

        if (isReturned) {
          return (
            <span className="inline-flex items-center text-xs font-medium text-[#16845B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] mr-1.5" />
              Returned
            </span>
          );
        }

        if (isOverdue) {
          return (
            <span className="inline-flex items-center text-xs font-semibold text-[#C53030]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] mr-1.5" />
              Overdue
            </span>
          );
        }

        return (
          <span className="inline-flex items-center text-xs font-medium text-[#B7791F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F] mr-1.5" />
            Issued
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      headerClassName: 'text-right text-slate-600',
      className: 'text-right',
      render: (record) => {
        const isReturned = record.status === 'returned' || !!record.returnDate;
        if (isReturned) {
          return <span className="text-slate-400 text-xs">—</span>;
        }

        const isCurrentReturning = isReturningId === record._id;

        return (
          <button
            onClick={() => handleReturnBook(record._id, record.book?.title || 'Book')}
            disabled={isCurrentReturning}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1769AA] hover:bg-[#125488] text-white transition disabled:opacity-60"
            title="Mark as returned and increment available stock"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isCurrentReturning ? 'Returning...' : 'Return Book'}</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Back Nav & Member Record Header */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#1769AA] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Member Directory</span>
        </button>

        {/* Member Administrative Profile Card */}
        <div className="bg-white border border-[#E3E8EE] rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#172033]">
                {member?.name || 'Member Record'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>
                  Membership ID: <strong className="text-slate-700 font-mono">{member?.membershipId || memberId}</strong>
                </span>
                <span>·</span>
                <span>{member?.email || '—'}</span>
                {member?.joinedDate && (
                  <>
                    <span>·</span>
                    <span>
                      Enrolled: {new Date(member.joinedDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/issue-book')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition w-fit"
            >
              <span>+ Issue Book</span>
            </button>
          </div>

          {/* Compact Administrative Loan Summary */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-5 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-900">{stats.total}</span>{' '}
              <span className="text-slate-500">total borrowed</span>
            </div>
            <span>·</span>
            <div>
              <span className="font-bold text-[#B7791F]">{stats.active}</span>{' '}
              <span className="text-slate-500">currently issued</span>
            </div>
            <span>·</span>
            <div>
              <span className="font-bold text-[#C53030]">{stats.overdue}</span>{' '}
              <span className="text-slate-500">overdue</span>
            </div>
            <span>·</span>
            <div>
              <span className="font-bold text-[#16845B]">{stats.returned}</span>{' '}
              <span className="text-slate-500">returned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && <ErrorMessage message={errorMessage} onRetry={loadHistory} />}

      {/* Borrowing History Table Header */}
      <div>
        <h2 className="text-sm font-semibold text-[#172033]">Borrowing History Ledger</h2>
      </div>

      {/* History Data Table */}
      <DataTable<BorrowRecord>
        data={history}
        columns={columns}
        loading={isLoading}
        emptyTitle="No borrowing records"
        emptyMessage="This member currently has no loan history on record."
      />
    </div>
  );
};

export default MemberHistory;
