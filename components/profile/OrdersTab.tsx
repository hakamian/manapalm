
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
                        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-gray-700/50" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                            <div>
                                <p className="font-bold">شماره سفارش: <span className="font-mono">#{order.id.slice(-6)}</span></p>
                                <p className="text-sm text-gray-400">تاریخ: {new Date(order.date).toLocaleDateString('fa-IR')}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-right">
                                <p className="font-semibold">{order.total.toLocaleString('fa-IR')} تومان</p>
                                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${order.status === 'تحویل داده شده' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black'}`}>{order.status}</span>
                            </div>
                        </div>
                        {expandedOrderId === order.id && (
                            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                                <h4 className="font-semibold mb-3">اقلام سفارش:</h4>
                                <ul className="space-y-3 mb-4">
                                    {order.items.map(item => (
                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                            <span>{item.name} (x{item.quantity})</span>
                                            <span>{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                                        </li>
                                    ))}
                                </ul>
                                 <h4 className="font-semibold mb-3">تاریخچه وضعیت:</h4>
                                <div className="relative pl-4">
                                    <div className="absolute top-0 bottom-0 right-2 w-0.5 bg-gray-600"></div>
                                    {order.statusHistory.map((s, i) => (
                                        <div key={i} className="relative mb-3 flex items-center">
                                            <div className="absolute right-0 translate-x-[45%] w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                            <div className="pr-6">
                                                <p className="font-semibold">{s.status}</p>
                                                <p className="text-xs text-gray-400">{new Date(s.date).toLocaleString('fa-IR')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                 {order.deeds && order.deeds.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">اسناد نخل مربوطه:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {order.deeds.map(deed => (
                                                <button key={deed.id} onClick={() => onOpenDeedModal(deed)} className="text-sm bg-green-800 hover:bg-green-700 py-1 px-3 rounded-md flex items-center gap-1">
                                                    <PhotoIcon className="w-4 h-4"/> مشاهده سند "{deed.intention}"
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
