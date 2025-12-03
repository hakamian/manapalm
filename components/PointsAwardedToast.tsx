
import React, { useEffect } from 'react';
import { TrophyIcon, SparklesIcon } from './icons';

interface PointsAwardedToastProps {
  points: number;
  action: string;
  type?: 'barkat' | 'mana';
  onClose: () => void;
}

const PointsAwardedToast: React.FC<PointsAwardedToastProps> = ({ points, action, type = 'barkat', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Disappear after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isMana = type === 'mana';
  const borderColor = isMana ? 'border-indigo-400' : 'border-yellow-400';
  const textColor = isMana ? 'text-indigo-300' : 'text-yellow-300';
  const Icon = isMana ? SparklesIcon : TrophyIcon;

  return (
    <div
      className={`fixed top-24 right-5 z-[100] bg-gray-900 border-2 ${borderColor} text-white rounded-lg shadow-2xl w-full max-w-sm p-4 transform transition-all duration-500 ease-in-out`}
      style={{ animation: 'slide-in-out 4s ease-in-out forwards' }}
    >
      <style>{`
        @keyframes slide-in-out {
          0% { transform: translateX(100%); opacity: 0; }
          20% { transform: translateX(0); opacity: 1; }
          80% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`w-8 h-8 ${isMana ? 'text-indigo-400' : 'text-yellow-400'}`} />
        </div>
        <div className="mr-4">
          <p className={`font-bold text-lg ${textColor}`}>
            +{points.toLocaleString('fa-IR')} امتیاز {isMana ? 'معنا' : 'برکت'}!
          </p>
          <p className="text-sm text-gray-300">{action}</p>
        </div>
      </div>
    </div>
  );
};

export default PointsAwardedToast;
