"use client";

import React, { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { Search, Loader2 } from "lucide-react";
import { Card } from ".";

export interface DataTableProps<TData, TValue> {
  title?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  total?: number;
  pagination?: ReactNode;
  onRowClick?: (row: TData) => void;
  size?: "default" | "sm";
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  renderRowDetails?: (row: TData) => ReactNode;
  expandableRowKey?: (row: TData) => string;
  expandedRowKeys?: Set<string>;
  onExpandedRowKeysChange?: (keys: Set<string>) => void;
}

export function DataTable<TData, TValue>({
  title,
  columns,
  data,
  isLoading,
  emptyMessage = "Tidak ada data ditemukan.",
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  actions,
  total = 0,
  pagination,
  onRowClick,
  size = "default",
  page = 1,
  perPage = 10,
  onPageChange,
  renderRowDetails,
  expandableRowKey,
  expandedRowKeys,
  onExpandedRowKeysChange,
}: DataTableProps<TData, TValue>) {
  const [internalExpandedKeys, setInternalExpandedKeys] = React.useState<Set<string>>(new Set());
  const isControlled = expandedRowKeys !== undefined;
  const activeExpandedKeys = isControlled ? expandedRowKeys : internalExpandedKeys;

  const toggleRow = (key: string) => {
    const nextKeys = new Set(activeExpandedKeys);
    if (nextKeys.has(key)) {
      nextKeys.delete(key);
    } else {
      nextKeys.add(key);
    }

    if (isControlled) {
      onExpandedRowKeysChange?.(nextKeys);
    } else {
      setInternalExpandedKeys(nextKeys);
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <Card className="p-0">
      <div className={`${size === 'sm' ? 'my-2 px-3' : 'my-4 px-4'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        {title && <h3 className={`${size === 'sm' ? 'text-lg' : 'text-2xl'} font-bold text-zinc-900 italic`}>{title}</h3>}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9582]" size={size === 'sm' ? 14 : 16} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className={`w-full sm:w-72 pl-10 pr-4 rounded-full border border-[#E4DDCB] bg-transparent italic text-zinc-700 placeholder:text-[#8A9582] focus:outline-none focus:ring-1 focus:ring-[#E4DDCB] transition-shadow ${size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'}`}
                value={search || ""}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-[#E4DDCB]">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={`${size === 'sm' ? 'px-3 py-2' : 'px-4 py-3'} text-left`}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className={`${size === 'sm' ? 'px-3 py-4' : 'px-4 py-8'} text-center text-zinc-500`}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Memuat data...
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowKey = expandableRowKey ? expandableRowKey(row.original) : undefined;
                const isExpanded = rowKey ? activeExpandedKeys.has(rowKey) : false;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => {
                        if (rowKey) {
                          toggleRow(rowKey);
                        } else {
                          onRowClick?.(row.original);
                        }
                      }}
                      className={`border-b border-zinc-200 transition-colors ${
                        onRowClick || rowKey ? 'cursor-pointer hover:bg-zinc-50' : 'hover:bg-zinc-50'
                      } ${isExpanded ? 'bg-zinc-50/50' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className={`${size === 'sm' ? 'px-3 py-2' : 'px-4 py-4'}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderRowDetails && (
                      <tr className="bg-zinc-50/40 border-b border-zinc-200">
                        <td colSpan={columns.length} className="px-6 py-3">
                          {renderRowDetails(row.original)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className={`${size === 'sm' ? 'px-3 py-4' : 'px-4 py-8'} text-center text-zinc-500`}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`${size === 'sm' ? 'my-2 px-3' : 'my-4 px-4'} flex items-center justify-between text-xs text-zinc-500 italic`}>
        <div>Showing {total === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total}</div>
        {pagination ? (
          pagination
        ) : onPageChange && total > 0 ? (
          <div className="flex items-center gap-2 not-italic">
            <button 
              className="p-1 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span>...</span>}
                  <button 
                    className={`w-6 h-6 rounded flex items-center justify-center ${p === page ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-100 text-zinc-700'}`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button 
              className="p-1 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
