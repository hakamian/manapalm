
import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon, Bars3Icon, Squares2x2Icon } from '../icons';

interface ShopFiltersProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priceRange: number;
    setPriceRange: (price: number) => void;
    maxPrice: number;
    inStockOnly: boolean;
    setInStockOnly: (checked: boolean) => void;
    wishlistOnly: boolean;
    setWishlistOnly: (checked: boolean) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    dateFilter: string;
    setDateFilter: (filter: string) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    maxPrice,
    inStockOnly,
    setInStockOnly,
    wishlistOnly,
    setWishlistOnly,
    sortBy,
    setSortBy,
    dateFilter,
    setDateFilter,
    viewMode,
    setViewMode
}) => {
    return (
        <div className="mb-10 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-6">
                {/* Search */}
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="جستجو در محصولات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedCategory === cat ? 'bg-green-600 text-white font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                 {/* Price Range */}
                <div>
                     <label className="block text-xs text-gray-400 mb-2">حداکثر قیمت: {priceRange.toLocaleString('fa-IR')} تومان</label>
                     <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="50000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full accent-green-500"
                    />
                </div>

                 {/* Toggles */}
                <div className="flex flex-col gap-2">
                     <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="form-checkbox h-4 w-4 text-green-500 rounded bg-gray-700 border-gray-600 focus:ring-green-500" />
                        <span className="mr-2 text-sm text-gray-300">فقط کالاهای موجود</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={wishlistOnly} onChange={e => setWishlistOnly(e.target.checked)} className="form-checkbox h-4 w-4 text-red-500 rounded bg-gray-700 border-gray-600 focus:ring-red-500" />
                        <span className="mr-2 text-sm text-gray-300">فقط علاقه‌مندی‌ها</span>
                    </label>
                </div>

                {/* Sort & Date */}
                <div className="flex gap-2">
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                        <option value="popularity">محبوب‌ترین</option>
                        <option value="newest">جدیدترین</option>
                        <option value="price-asc">ارزان‌ترین</option>
                        <option value="price-desc">گران‌ترین</option>
                    </select>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                        <option value="all">همه زمان‌ها</option>
                        <option value="7days">۷ روز گذشته</option>
                        <option value="30days">۳۰ روز گذشته</option>
                    </select>
                </div>

                {/* View Mode */}
                <div className="flex justify-end gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        <Squares2x2Icon className="w-5 h-5" />
                    </button>
                     <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopFilters;
