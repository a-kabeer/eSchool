import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  widthClass?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  paginate?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  pageSize = 5,
  loading = false,
  emptyTitle = 'No matching records',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  emptyAction,
  onRowClick,
  paginate = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, columns, sortKey, sortDir]);

  const totalPages = paginate ? Math.max(1, Math.ceil(sorted.length / rowsPerPage)) : 1;
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    if (!paginate) return sorted;
    const start = (safePage - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, paginate, safePage, rowsPerPage]);

  const pageKeys = pageRows.map(rowKey);
  const allOnPageSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selectedKeys.includes(k));

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    if (allOnPageSelected) {
      onSelectionChange(selectedKeys.filter((k) => !pageKeys.includes(k)));
    } else {
      const next = Array.from(new Set([...selectedKeys, ...pageKeys]));
      onSelectionChange(next);
    }
  };

  const handleToggleRow = (key: string | number) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable || !col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return <LoadingState rows={pageSize} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const startIdx = (safePage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(safePage * rowsPerPage, sorted.length);

  return (
    <div>
      <div className="overflow-x-auto mm-scrollbar">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              {selectable && (
                <th className="w-10 py-3.5 pl-1 pr-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allOnPageSelected}
                    onChange={handleToggleAll}
                    className="h-4 w-4 rounded border-border accent-[var(--mm-primary)] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => {
                const alignCls =
                  col.align === 'right'
                    ? 'text-right justify-end'
                    : col.align === 'center'
                      ? 'text-center justify-center'
                      : 'text-left justify-start';
                return (
                  <th
                    key={col.key}
                    className={`py-3.5 px-3 text-sm font-semibold text-ink whitespace-nowrap ${
                      col.widthClass ?? ''
                    }`}
                  >
                    {col.sortable && col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className={`inline-flex w-full items-center gap-1.5 hover:text-primary ${alignCls}`}
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted/60" />
                        )}
                      </button>
                    ) : (
                      <div className={`flex items-center ${alignCls}`}>{col.header}</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/75">
            {pageRows.map((row) => {
              const key = rowKey(row);
              const checked = selectedKeys.includes(key);
              return (
                <tr
                  key={String(key)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors hover:bg-subtle/60 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${checked ? 'bg-light-primary/35' : ''}`}
                >
                  {selectable && (
                    <td
                      className="py-4 pl-1 pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select row ${key}`}
                        checked={checked}
                        onChange={() => handleToggleRow(key)}
                        className="h-4 w-4 rounded border-border accent-[var(--mm-primary)] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const alignCls =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                    return (
                      <td
                        key={col.key}
                        className={`py-4 px-3 text-sm text-ink whitespace-nowrap ${alignCls}`}
                      >
                        {col.render(row)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paginate && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-xs font-medium text-muted">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              aria-label="Items per page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {startIdx} – {endIdx} of {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-subtle disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-subtle disabled:opacity-35"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
