'use client';

import React, { useState, useMemo } from 'react';
import {
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Column<T> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    emptyIcon?: React.ComponentType<{ className?: string }>;
}

export default function DataTable<T extends { id?: string }>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'جستجو...',
    pageSize = 10,
    onRowClick,
    emptyMessage = 'داده‌ای یافت نشد',
    emptyIcon: EmptyIcon,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;

        return data.filter((item) => {
            return columns.some((col) => {
                const value = (item as any)[col.key];
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            });
        });
    }, [data, searchQuery, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal);
            const bStr = String(bVal);
            return sortDirection === 'asc'
                ? aStr.localeCompare(bStr, 'fa')
                : bStr.localeCompare(aStr, 'fa');
        });
    }, [filteredData, sortKey, sortDirection]);

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const getValue = (item: T, key: string) => {
        const keys = key.split('.');
        let value: any = item;
        for (const k of keys) {
            value = value?.[k];
        }
        return value;
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            {searchable && (
                <div className="relative max-w-sm">
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm 
                                   placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 
                                   focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={`px-4 py-3 text-right font-medium text-stone-400 ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''} ${col.className || ''}`}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{col.title}</span>
                                        {col.sortable && sortKey === col.key && (
                                            sortDirection === 'asc'
                                                ? <ChevronUpIcon className="w-3 h-3" />
                                                : <ChevronDownIcon className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, idx) => (
                                <tr
                                    key={item.id || idx}
                                    onClick={() => onRowClick?.(item)}
                                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className={`px-4 py-3 text-stone-300 ${col.className || ''}`}>
                                            {col.render
                                                ? col.render(getValue(item, String(col.key)), item)
                                                : getValue(item, String(col.key)) ?? '-'
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-stone-500">
                                    {EmptyIcon && <EmptyIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />}
                                    <p>{emptyMessage}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">
                        نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, sortedData.length)} از {sortedData.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === page
                                            ? 'bg-emerald-500 text-white'
                                            : 'hover:bg-white/5 text-stone-400'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
