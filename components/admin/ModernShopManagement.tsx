import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import {
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ViewColumnsIcon,
    Squares2X2Icon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PhotoIcon,
    CheckCircleIcon,
    XMarkIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ModernShopManagementProps {
    products: Product[];
    onUpdateProduct?: (productId: string, data: Partial<Product>) => void;
    onDeleteProduct?: (productId: string) => void;
    onCreateProduct?: (product: Partial<Product>) => void;
}

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | string;

const ModernShopManagement: React.FC<ModernShopManagementProps> = ({
    products = [],
    onUpdateProduct,
    onDeleteProduct,
    onCreateProduct
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['all', ...Array.from(cats)];
    }, [products]);

    // Filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, filterCategory]);

    // Statistics
    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter(p => (p.stock || 0) > 0).length;
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

        return { total, inStock, lowStock, outOfStock, totalValue };
    }, [products]);

    const handleToggleProduct = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    const handleExportProducts = () => {
        const csv = [
            ['نام', 'دسته‌بندی', 'قیمت', 'موجودی', 'امتیاز'].join(','),
            ...filteredProducts.map(p =>
                [p.name, p.category, p.price, p.stock || 0, p.points || 0].join(',')
            )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('fa-IR') + ' تومان';
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت محصولات
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            مدیریت و نظارت بر محصولات فروشگاه
                        </p>
                    </div>
                    <button className="admin-btn admin-btn-success">
                        <PlusIcon className="w-5 h-5" />
                        افزودن محصول جدید
                    </button>
                </div>

                {/* Stats Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1.5rem'
                    }}
                >
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>کل محصولات</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem' }}>
                            {stats.total.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>موجود در انبار</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem', color: 'var(--admin-green)' }}>
                            {stats.inStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>موجودی کم</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem', color: 'var(--admin-amber)' }}>
                            {stats.lowStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>ناموجود</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem', color: 'var(--admin-text-muted)' }}>
                            {stats.outOfStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                        <MagnifyingGlassIcon
                            className="w-5 h-5"
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--admin-text-muted)',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="جستجو بر اساس نام یا توضیحات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="admin-input"
                            style={{ paddingRight: '3rem' }}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="admin-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'همه دسته‌بندی‌ها' : cat}
                            </option>
                        ))}
                    </select>

                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'admin-btn admin-btn-primary' : 'admin-btn admin-btn-ghost'}
                            style={{ flex: 1 }}
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'admin-btn admin-btn-primary' : 'admin-btn admin-btn-ghost'}
                            style={{ flex: 1 }}
                        >
                            <ViewColumnsIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportProducts}
                        className="admin-btn admin-btn-ghost"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی CSV
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                    <div
                        style={{
                            padding: '1rem',
                            background: 'var(--admin-bg-tertiary)',
                            borderRadius: 'var(--admin-radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <span className="admin-caption">
                            {selectedProducts.size.toLocaleString('fa-IR')} محصول انتخاب شده
                        </span>
                        <button className="admin-btn admin-btn-danger" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                            حذف دسته‌جمعی
                        </button>
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="admin-btn admin-btn-ghost"
                            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                        >
                            لغو انتخاب
                        </button>
                    </div>
                )}
            </div>

            {/* Products Display */}
            {viewMode === 'grid' ? (
                // Grid View
                <div
                    className="admin-animate-fade-in"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    {filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <ShoppingCartIcon className="w-12 h-12" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هیچ محصولی یافت نشد
                            </p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Product Image */}
                                <div style={{
                                    height: '200px',
                                    background: product.image
                                        ? `url(${product.image}) center/cover`
                                        : 'var(--admin-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {!product.image && <PhotoIcon className="w-12 h-12" style={{ color: 'var(--admin-text-muted)' }} />}

                                    {/* Stock Badge */}
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                        {(product.stock || 0) === 0 ? (
                                            <span className="admin-badge admin-badge-danger">ناموجود</span>
                                        ) : (product.stock || 0) < 10 ? (
                                            <span className="admin-badge admin-badge-warning">موجودی کم</span>
                                        ) : (
                                            <span className="admin-badge admin-badge-success">موجود</span>
                                        )}
                                    </div>

                                    {/* Selection Checkbox */}
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => handleToggleProduct(product.id)}
                                            style={{
                                                cursor: 'pointer',
                                                width: '20px',
                                                height: '20px'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div style={{ padding: '1.5rem' }}>
                                    <span className="admin-badge admin-badge-purple" style={{ marginBottom: '0.5rem' }}>
                                        {product.category}
                                    </span>
                                    <h3 className="admin-heading-3" style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                        {product.name}
                                    </h3>
                                    {product.description && (
                                        <p className="admin-caption" style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {product.description.substring(0, 80)}...
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div>
                                            <p className="admin-label" style={{ marginBottom: '0.25rem' }}>قیمت</p>
                                            <p style={{ fontWeight: 700, color: 'var(--admin-green)', fontSize: '1.125rem' }}>
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p className="admin-label" style={{ marginBottom: '0.25rem' }}>موجودی</p>
                                            <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                                {(product.stock || 0).toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                                            <PencilIcon className="w-4 h-4" />
                                            ویرایش
                                        </button>
                                        <button className="admin-btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                            <TrashIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // List View
                <div className="admin-table-container admin-animate-fade-in">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>
                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                </th>
                                <th>تصویر</th>
                                <th>نام محصول</th>
                                <th>دسته‌بندی</th>
                                <th>قیمت</th>
                                <th>موجودی</th>
                                <th>امتیاز</th>
                                <th style={{ textAlign: 'center' }}>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                                        <ShoppingCartIcon className="w-12 h-12" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                                        <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                            هیچ محصولی یافت نشد
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.has(product.id)}
                                                onChange={() => handleToggleProduct(product.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: 'var(--admin-radius-md)',
                                                background: product.image
                                                    ? `url(${product.image}) center/cover`
                                                    : 'var(--admin-bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {!product.image && <PhotoIcon className="w-6 h-6" style={{ color: 'var(--admin-text-muted)' }} />}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                                                {product.name}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="admin-badge admin-badge-purple">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--admin-green)', fontFamily: 'monospace' }}>
                                                {formatPrice(product.price)}
                                            </span>
                                        </td>
                                        <td>
                                            {(product.stock || 0) === 0 ? (
                                                <span className="admin-badge admin-badge-danger">ناموجود</span>
                                            ) : (product.stock || 0) < 10 ? (
                                                <span className="admin-badge admin-badge-warning">{product.stock}</span>
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>{(product.stock || 0).toLocaleString('fa-IR')}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--admin-amber)' }}>
                                                {(product.points || 0).toLocaleString('fa-IR')}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button className="admin-btn-icon">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="admin-btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                                    <TrashIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div
                className="admin-card"
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <span className="admin-caption">
                    نمایش {filteredProducts.length.toLocaleString('fa-IR')} از {products.length.toLocaleString('fa-IR')} محصول
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>قبلی</button>
                    <button className="admin-btn admin-btn-primary" style={{ padding: '0.5rem 1rem' }}>1</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>2</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>بعدی</button>
                </div>
            </div>
        </div>
    );
};

export default ModernShopManagement;
