
import React from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { SparklesIcon, ClockIcon } from './icons';

interface LiveSessionAccessModalProps {
  isOpen: boolean;
  onClose: () => void; // Ends session
  onExtendWithPoints: () => void; // Parent should handle reconnection
  featureName: string;
}

const EXTENSION_COST = 200; // Mana points
const EXTENSION_SECONDS = 300; // 5 minutes

const LiveSessionAccessModal: React.FC<LiveSessionAccessModalProps> = ({ isOpen, onClose, onExtendWithPoints, featureName }) => {
  const { user, products } = useAppState();
  const dispatch = useAppDispatch();
  
  if (!isOpen || !user) return null;

  const hasEnoughPoints = user.manaPoints >= EXTENSION_COST;
  
  const handlePurchaseAndClose = () => {
    // The parent component listens for changes in user state (e.g. access update) or just relies on manual restart.
    // Since purchase flow redirects to Cart -> OrderSuccess -> Back, 
    // we can't easily auto-resume here without more complex state.
    // However, if we assume "Weekly Pass" purchase is instant via points (future feature), we could do it.
    // For now, standard cart flow.
    const product = products.find(p => p.id === 'p_hoshmana_live_weekly');
    
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
      dispatch({ type: 'TOGGLE_CART', payload: true });
    } else {
        // Fallback
        const fallbackProduct = {
            id: 'p_hoshmana_live_weekly',
            name: 'بسته هفتگی هوشمانا لایو',
            price: 150000,
            type: 'service',
            image: 'https://picsum.photos/seed/service/400/400',
            points: 300,
            stock: 999,
            popularity: 100,
            dateAdded: new Date().toISOString(),
            category: 'ارتقا',
            description: 'دسترسی هفتگی به تمام ابزارهای گفتگوی زنده.'
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: fallbackProduct as any, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    }
    onClose(); // IMPORTANT: Close the modal so user can see the cart
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[70] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale text-center border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale { to { transform: scale(1); opacity: 1; } }
          .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
        `}</style>
        
        <div className="w-20 h-20 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-yellow-500 animate-pulse">
             <ClockIcon className="w-10 h-10 text-yellow-400" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white">
          زمان شما به پایان رسید
        </h2>
        <p className="text-gray-400 text-sm mb-8">
            برای ادامه گفتگو در {featureName}، لطفا یکی از گزینه‌های زیر را انتخاب کنید.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Extend with Points */}
          <button 
              onClick={onExtendWithPoints} 
              disabled={!hasEnoughPoints}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${hasEnoughPoints ? 'bg-indigo-900/20 border-indigo-500/50 hover:bg-indigo-900/40 hover:border-indigo-400' : 'bg-gray-700/30 border-gray-600 opacity-60 cursor-not-allowed'}`}
          >
             <div className="text-right">
                 <h3 className={`font-bold text-lg ${hasEnoughPoints ? 'text-indigo-300 group-hover:text-white' : 'text-gray-400'}`}>تمدید فوری (۵ دقیقه)</h3>
                 <p className="text-xs text-gray-500 mt-1">کسر از امتیازات معنا</p>
             </div>
             <div className="text-center bg-gray-800/50 px-3 py-2 rounded-lg">
                 <span className={`font-bold block ${hasEnoughPoints ? 'text-indigo-400' : 'text-gray-500'}`}>{EXTENSION_COST}</span>
                 <span className="text-[10px] text-gray-500">امتیاز</span>
             </div>
          </button>

          {/* Purchase Weekly Pass */}
          <button 
              onClick={handlePurchaseAndClose} 
              className="w-full p-4 rounded-xl border-2 border-green-600/50 bg-green-900/20 hover:bg-green-900/30 hover:border-green-500 transition-all flex items-center justify-between group"
          >
             <div className="text-right">
                 <h3 className="font-bold text-lg text-green-400 group-hover:text-white">خرید اشتراک هفتگی</h3>
                 <p className="text-xs text-gray-500 mt-1">دسترسی نامحدود به تمام ابزارها</p>
             </div>
             <div className="text-center bg-gray-800/50 px-3 py-2 rounded-lg">
                 <span className="font-bold block text-green-400">۱۵۰,۰۰۰</span>
                 <span className="text-[10px] text-gray-500">تومان</span>
             </div>
          </button>
        </div>

        <button onClick={onClose} className="mt-8 text-gray-500 hover:text-white transition-colors text-sm underline decoration-gray-600 underline-offset-4">
          پایان جلسه و خروج
        </button>
      </div>
    </div>
  );
};

export default LiveSessionAccessModal;
