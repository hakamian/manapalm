import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import {
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PhotoIcon,
    CheckCircleIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon
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

        return { total, inStock, lowStock, outOfStock };
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

    // ... inside ModernShopManagement
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditForm({ ...product });
    };

    const handleAddClick = () => {
        // Create a blank product template
        const newProduct: Product = {
            id: `p_new_${Date.now()}`,
            name: '',
            price: 0,
            category: 'محصولات خرما',
            image: '',
            stock: 0,
            description: '',
            points: 0,
            popularity: 0,
            type: 'physical',
            dateAdded: new Date().toISOString(),
            isActive: true
        };
        setEditingProduct(newProduct);
        setEditForm(newProduct);
    };

    const handleSaveEdit = () => {
        if (!editingProduct) return;

        // Check if it's a new product (by checking if it exists in current products list)
        const isNew = !products.find(p => p.id === editingProduct.id);

        if (isNew && onCreateProduct) {
            onCreateProduct(editForm);
        } else if (!isNew && onUpdateProduct) {
            onUpdateProduct(editingProduct.id, editForm);
        } else {
            // Fallback if handlers are missing (e.g. just logging)
            console.log(isNew ? 'Creating:' : 'Updating:', editForm);
        }

        setEditingProduct(null);
        // Show success/toast (omitted for brevity)
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
                    <button
                        onClick={handleAddClick}
                        className="admin-btn admin-btn-success"
                    >
                        <PlusIcon className="w-5 h-5" />
                        افزودن محصول جدید
                    </button>
                </div>
                {/* ... existing stats ... */}
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
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem' }}>
                            {stats.inStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>کمبود موجودی</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem' }}>
                            {stats.lowStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>ناموجود</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem' }}>
                            {stats.outOfStock.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    {/* Search */}
                    <div className="admin-input-group" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <MagnifyingGlassIcon className="w-4 h-4" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="جستجوی محصول..."
                            className="admin-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="admin-input-group" style={{ minWidth: '150px' }}>
                        <FunnelIcon className="w-4 h-4" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                        <select
                            className="admin-input"
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'همه دسته‌بندی‌ها' : cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="admin-toggle-group">
                        <button
                            className={`admin-toggle-btn ${viewMode === 'grid' ? 'admin-toggle-btn-active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                            </svg>
                            گرید
                        </button>
                        <button
                            className={`admin-toggle-btn ${viewMode === 'list' ? 'admin-toggle-btn-active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            </svg>
                            لیست
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportProducts}
                        className="admin-btn admin-btn-secondary"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی CSV
                    </button>
                </div>
            </div>

            {/* Products View */}
            {viewMode === 'grid' ? (
                <div
                    className="admin-animate-fade-in"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', opacity: product.isActive ? 1 : 0.6 }}>
                            {/* Image Area */}
                            <div style={{
                                height: '200px',
                                background: product.image ? `url("${product.image}") center/cover` : 'var(--admin-bg-tertiary)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: product.stock > 0 ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
                                    color: product.stock > 0 ? 'var(--admin-success-text)' : 'var(--admin-danger-text)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {product.stock > 0 ? `موجودی: ${product.stock.toLocaleString('fa-IR')}` : 'ناموجود'}
                                </div>
                                {!product.isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        left: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        غیرفعال
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <span className="admin-label" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                                    {product.points && (
                                        <span style={{ color: 'var(--admin-accent)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {product.points.toLocaleString('fa-IR')} امتیاز
                                        </span>
                                    )}
                                </div>
                                <h3 className="admin-heading-3" style={{ marginBottom: '1rem' }}>{product.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="admin-heading-2" style={{ fontSize: '1.1rem', color: 'var(--admin-text-primary)' }}>
                                        {formatPrice(product.price)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => onUpdateProduct?.(product.id, { isActive: !product.isActive })}
                                        className={`admin-btn ${product.isActive ? 'admin-btn-ghost' : 'admin-btn-success'}`}
                                        style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}
                                        title={product.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                                    >
                                        {product.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="admin-btn admin-btn-primary"
                                        style={{ flex: 3, padding: '0.5rem' }}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        ویرایش
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
                                                onDeleteProduct?.(product.id);
                                            }
                                        }}
                                        className="admin-btn admin-btn-danger"
                                        style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-card admin-animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead style={{ background: 'var(--admin-bg-tertiary)', borderBottom: '1px solid var(--admin-border)' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>محصول</th>
                                <th style={{ padding: '1rem' }}>دسته‌بندی</th>
                                <th style={{ padding: '1rem' }}>قیمت</th>
                                <th style={{ padding: '1rem' }}>موجودی</th>
                                <th style={{ padding: '1rem' }}>وضعیت</th>
                                <th style={{ padding: '1rem' }}>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '0.5rem',
                                                background: product.image ? `url("${product.image}") center/cover` : 'var(--admin-bg-tertiary)'
                                            }} />
                                            <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{product.category}</td>
                                    <td style={{ padding: '1rem' }}>{formatPrice(product.price)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: product.stock > 0 ? 'var(--admin-success-text)' : 'var(--admin-danger-text)',
                                            fontWeight: 'bold'
                                        }}>
                                            {product.stock.toLocaleString('fa-IR')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={product.isActive ? 'admin-badge admin-badge-success' : 'admin-badge admin-badge-danger'}>
                                            {product.isActive ? 'فعال' : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => onUpdateProduct?.(product.id, { isActive: !product.isActive })}
                                                className={product.isActive ? 'text-gray-400 hover:text-yellow-400' : 'text-green-400 hover:text-green-300'}
                                                title={product.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                                            >
                                                {product.isActive ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => handleEditClick(product)} className="text-blue-400 hover:text-blue-300">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => {
                                                if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
                                                    onDeleteProduct?.(product.id);
                                                }
                                            }} className="text-red-500 hover:text-red-400">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }

            {/* EDIT MODAL */}
            {
                editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                                <h2 className="text-xl font-bold text-white">ویرایش محصول: {editingProduct.name}</h2>
                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Image Input Section */}
                                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 border-dashed">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">لینک تصویر (Image URL)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.image || ''}
                                            onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none dir-ltr"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">لینک کپی شده از استودیو هوش مصنوعی را اینجا قرار دهید.</p>

                                    {editForm.image && (
                                        <div className="mt-4 relative h-40 rounded-lg overflow-hidden border border-gray-700">
                                            <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">نام محصول</label>
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">دسته‌بندی</label>
                                        <input
                                            type="text"
                                            value={editForm.category || ''}
                                            onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">قیمت (تومان)</label>
                                        <input
                                            type="number"
                                            value={editForm.price || 0}
                                            onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white dir-ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">موجودی</label>
                                        <input
                                            type="number"
                                            value={editForm.stock || 0}
                                            onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white dir-ltr"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                                    <textarea
                                        rows={4}
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0 flex justify-end gap-3 z-10">
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    انصراف
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/40 transition-all transform active:scale-95"
                                >
                                    ذخیره تغییرات
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ModernShopManagement;
