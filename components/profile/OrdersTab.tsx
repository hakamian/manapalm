
import React, { useState } from 'react';
import { Order, View, Deed } from '../../types';
import { PhotoIcon } from '../icons';

interface OrdersTabProps {
    orders: Order[];
    onNavigate: (view: View) => void;
    onOpenDeedModal: (deed: Deed) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onNavigate, onOpenDeedModal }) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">سفارش‌های من</h2>
            <div className="space-y-4">
                {orders.length > 0 ? [...orders].reverse().map(order => (
                    <div key={order.id} className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${order.status === 'تحویل داده شده' || order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {order.status === 'تحویل داده شده' || order.status === 'completed' ? '✅' : '📦'}
                                </div>
                                <div>
                                    <p className="font-bold text-white">سفارش <span className="font-mono text-emerald-400">#{order.id.slice(-6).toUpperCase()}</span></p>
                                    <p className="text-sm text-gray-400">{new Date(order.date || order.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 text-right">
                                <p className="font-black text-lg text-white">{(order.totalAmount || order.total).toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-400">تومان</span></p>
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md mt-1 inline-block font-bold ${order.status === 'تحویل داده شده' || order.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {expandedOrderId === order.id && (
                            <div className="p-6 border-t border-gray-700 bg-gray-900/30 animate-fade-in">
                                {/* Visual Timeline */}
                                <div className="mb-10 px-2">
                                    <div className="flex justify-between items-center relative">
                                        <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-1/2 -translate-y-1/2 z-0"></div>
                                        {[
                                            { label: 'ثبت', key: 'pending', icon: '📝' },
                                            { label: 'پرداخت', key: 'paid', icon: '💳' },
                                            { label: 'آماده‌سازی', key: 'planting', icon: '🌱' },
                                            { label: 'تکمیل/ارسال', key: 'completed', icon: '✨' }
                                        ].map((step, idx, arr) => {
                                            const statuses = (order.statusHistory || []).map(h => h.status.toLowerCase());
                                            const isDone = statuses.includes(step.key) || (step.key === 'completed' && (order.status === 'تحویل داده شده' || order.status === 'completed' || order.status === 'shipped'));
                                            const isCurrent = order.status.toLowerCase() === step.key || (idx === 0 && order.status === 'pending');

                                            return (
                                                <div key={step.key} className="relative z-10 flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 ${isDone ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : isCurrent ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                                        {isDone ? '✓' : step.icon}
                                                    </div>
                                                    <span className={`text-[10px] mt-2 font-bold whitespace-nowrap ${isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-gray-500'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                            اقلام سفارش
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-white">{item.name} <span className="text-gray-500 text-xs">(x{item.quantity})</span></span>
                                                    </div>
                                                    <span className="text-sm font-bold text-emerald-400">{(item.price * item.quantity).toLocaleString('fa-IR')} <span className="text-[10px] font-normal opacity-60">تومان</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                            اطلاعات تحویل
                                        </h4>
                                        {order.physicalAddress ? (
                                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-2">
                                                <p className="text-white font-bold text-sm">{order.physicalAddress.recipientName}</p>
                                                <p className="text-gray-300 text-xs leading-relaxed">
                                                    {order.physicalAddress.province}، {order.physicalAddress.city}
                                                    {order.physicalAddress.neighborhood ? `، ${order.physicalAddress.neighborhood}` : ''}
                                                    {`، ${order.physicalAddress.fullAddress}`}
                                                </p>
                                                <div className="flex gap-4 pt-2 border-t border-white/5 mt-2">
                                                    <p className="text-[10px] text-gray-400">پلاک: <span className="text-white font-mono">{order.physicalAddress.plaque || '—'}</span></p>
                                                    <p className="text-[10px] text-gray-400">واحد: <span className="text-white font-mono">{order.physicalAddress.unit || order.physicalAddress.floor || '—'}</span></p>
                                                    <p className="text-[10px] text-gray-400">کد پستی: <span className="text-white font-mono">{order.physicalAddress.postalCode}</span></p>
                                                </div>
                                            </div>
                                        ) : order.digitalAddress ? (
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                                                <p className="text-xs text-gray-400 mb-1">تحویل دیجیتال به:</p>
                                                <p className="text-white font-mono text-sm">{order.digitalAddress.email || order.digitalAddress.phone}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-xs italic">اطلاعات آدرس ثبت نشده است.</p>
                                        )}

                                        {order.shipment && (
                                            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-gray-400">کد رهگیری:</span>
                                                    <span className="text-xs font-mono text-emerald-400">{order.shipment.trackingCode}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">روش ارسال:</span>
                                                    <span className="text-xs text-white">{order.shipment.carrier}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {order.deeds && order.deeds.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-700">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                            اسناد نخل میراث
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {order.deeds.map(deed => (
                                                <button
                                                    key={deed.id}
                                                    onClick={() => onOpenDeedModal(deed)}
                                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/20 rounded-xl shadow-sm transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📜</div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-white">سند به نام {deed.ownerName || deed.intention}</p>
                                                            <p className="text-[10px] text-emerald-400/70">مشاهده گواهی و جزئیات</p>
                                                        </div>
                                                    </div>
                                                    <PhotoIcon className="w-5 h-5 text-emerald-400 opacity-50 group-hover:opacity-100" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) :
                    <div className="bg-gray-800 p-8 rounded-lg text-center">
                        <p>تاکنون سفارشی ثبت نکرده‌اید.</p>
                        <button onClick={() => onNavigate(View.Shop)} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                            رفتن به فروشگاه
                        </button>
                    </div>}
            </div>
        </div>
    );
};

export default OrdersTab;
