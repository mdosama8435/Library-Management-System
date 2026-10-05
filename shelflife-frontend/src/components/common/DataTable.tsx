import React from 'react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  keyExtractor?: (item: T, index: number) => string;
  className?: string;
}

/**
 * Reusable, strictly-typed Generic DataTable Component.
 * Restyled with clean academic catalog aesthetic (8px radius, crisp borders, subtle hover).
 */
export function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No records found matching your criteria.',
  emptyTitle = 'No Records Found',
  keyExtractor,
  className = '',
}: DataTableProps<T>): React.ReactElement {
  // Skeleton Loading State
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-[#E3E8EE] overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E8EE] bg-[#F8FAFC] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {columns.map((col) => (
                  <th key={col.key} className={`py-3 px-4 ${col.headerClassName || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((_, colIdx) => (
                    <td key={`skeleton-col-${colIdx}`} className="py-3.5 px-4">
                      <div
                        className="h-3.5 bg-slate-100 rounded"
                        style={{ width: `${Math.max(40, (colIdx * 19 + 45) % 85)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-[#E3E8EE] p-6 text-center ${className}`}>
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-[#E3E8EE] overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E3E8EE] bg-[#F8FAFC] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`py-3 px-4 select-none ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((item, index) => {
              const itemRecord = item as Record<string, unknown>;
              const rowKey = keyExtractor
                ? keyExtractor(item, index)
                : typeof itemRecord._id === 'string'
                ? itemRecord._id
                : `row-${index}`;

              return (
                <tr
                  key={rowKey}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${rowKey}-${col.key}`}
                      className={`py-3.5 px-4 align-middle ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (itemRecord[col.key] as React.ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
