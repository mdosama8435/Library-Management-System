import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as memberService from '../services/memberService';
import type { Member, CreateMemberRequest } from '../types/member';
import DataTable from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Plus,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Member Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<CreateMemberRequest>({
    name: '',
    email: '',
    membershipId: '',
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await memberService.getMembers();
      setMembers(response.data);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj?.message || 'Unable to load member directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Client-side search across name, email, or membership ID
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.membershipId.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.membershipId.trim()) {
      showToast('Please fill out all member fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await memberService.createMember({
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        membershipId: newMember.membershipId.trim().toUpperCase(),
      });

      showToast(`Member "${newMember.name}" enrolled successfully.`, 'success');
      setIsModalOpen(false);
      setNewMember({ name: '', email: '', membershipId: '' });
      fetchMembers();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      showToast(errorObj?.message || 'Failed to enroll member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMemberInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Administrative Directory Columns
  const columns: Column<Member>[] = [
    {
      key: 'index',
      header: '#',
      headerClassName: 'w-10 text-slate-400 font-normal',
      className: 'w-10 text-slate-400 text-xs font-mono',
      render: (_, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      key: 'name',
      header: 'Member',
      headerClassName: 'text-slate-600',
      render: (member) => (
        <div className="flex items-center space-x-2.5 py-0.5">
          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px] flex items-center justify-center flex-shrink-0 border border-slate-200">
            {getMemberInitials(member.name)}
          </div>
          <span className="font-semibold text-[#172033] hover:text-[#1769AA] transition-colors">
            {member.name}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      headerClassName: 'text-slate-600',
      className: 'text-xs text-slate-600',
      render: (member) => member.email,
    },
    {
      key: 'membershipId',
      header: 'Membership ID',
      headerClassName: 'text-slate-600',
      className: 'text-xs font-mono text-slate-700',
      render: (member) => member.membershipId,
    },
    {
      key: 'joinedDate',
      header: 'Joined',
      headerClassName: 'text-slate-600',
      className: 'text-xs text-slate-500',
      render: (member) =>
        new Date(member.joinedDate).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: 'Action',
      headerClassName: 'text-right text-slate-600',
      className: 'text-right',
      render: (member) => (
        <button
          onClick={() => navigate(`/members/${member._id}/history`)}
          className="inline-flex items-center space-x-1 text-xs font-medium text-[#1769AA] hover:text-[#125488] hover:underline"
        >
          <span>View History</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Members Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage registered library cardholders, staff, and student accounts.
        </p>
      </div>

      {/* Toolbar: Search input and Add Member button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members by name, ID or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#1769AA] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white rounded-lg font-medium text-xs transition active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <ErrorMessage
          title="Unable to load members"
          message={errorMessage}
          onRetry={fetchMembers}
        />
      )}

      {/* Directory Data Table */}
      <DataTable<Member>
        data={paginatedMembers}
        columns={columns}
        loading={isLoading}
        emptyTitle="No members found"
        emptyMessage={
          searchQuery
            ? `No registered members match "${searchQuery}".`
            : "No library members registered yet. Click 'Add Member' to enroll a cardholder."
        }
      />

      {/* Pagination Footer */}
      {!isLoading && filteredMembers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredMembers.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredMembers.length}</span> members
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-6 h-6 rounded-md text-xs font-medium transition ${
                  p === currentPage
                    ? 'bg-[#1769AA] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Register Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 animate-fade-in">
          <div className="bg-white rounded-xl shadow-modal border border-slate-200 max-w-md w-full p-5 sm:p-6 animate-scale-in">
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Enroll New Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a library cardholder account</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@university.edu"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Membership ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEM001"
                  value={newMember.membershipId}
                  onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#1769AA]"
                />
              </div>

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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-medium rounded-lg transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Enrolling...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
