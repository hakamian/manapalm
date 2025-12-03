
import React, { useState } from 'react';
import { Deed, View, CoachingRole } from '../types';
import { CheckCircleIcon, XMarkIcon, TrophyIcon, SparklesIcon, ArrowLeftIcon, SitemapIcon, BrainCircuitIcon, BriefcaseIcon, ArrowDownTrayIcon, ArrowRightIcon } from './icons';
import { useAppDispatch, useAppState } from '../AppContext';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDeeds: () => void;
  deeds: Deed[];
  pointsEarned: number | null;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ isOpen, onClose, onViewDeeds, deeds, pointsEarned }) => {
  const dispatch = useAppDispatch();
  const { user, orders, pendingRedirectView } = useAppState();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  if (!isOpen) return null;

  // Get the latest order to check for specific products
  const lastOrder = orders[orders.length - 1];
  
  // Check for Web Dev Project
  const hasWebProject = user?.webDevProject && user.webDevProject.status === 'requested' && lastOrder?.items.some(i => i.webDevDetails);

  // Check for Specialized Consulting Sessions
  const hasLifeCoachSession = lastOrder?.items.some(i => i.id === 'p_life_coach_session' || i.productId === 'p_life_coach_session');
  const hasBusinessMentorSession = lastOrder?.items.some(i => i.id === 'p_business_mentor_session' || i.productId === 'p_business_mentor_session');
  const hasCoachingLabAccess = lastOrder?.items.some(i => i.id === 'p_coaching_lab_access' || i.productId === 'p_coaching_lab_access');

  // Check for Digital Products
  const digitalItems = lastOrder?.items.filter(i => i.type === 'digital') || [];
  const hasDigitalItems = digitalItems.length > 0;

  const handleGeneratePost = (deed: Deed) => {
    dispatch({ type: 'SHOW_SOCIAL_POST_GENERATOR_MODAL', payload: { isOpen: true, deed } });
    onClose();
  };

  const handleGoToDashboard = () => {
      dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'dashboard' });
      onClose();
  };

  const handleCloseAndNavigate = () => {
      // If there is a pending redirect (e.g., back to a tool), use it
      if (pendingRedirectView) {
          dispatch({ type: 'SET_VIEW', payload: pendingRedirectView });
          dispatch({ type: 'SET_PENDING_REDIRECT', payload: undefined }); // Clear it
      } else {
          // Default behavior: prevent dead end
          dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'orders' });
      }
      onClose();
  };

  const handleStartSession = (type: 'life_coach' | 'business_mentor' | 'lab') => {
      let role: CoachingRole = 'coachee';
      let topic = 'آزاد';
      let isReal = false;

      if (type === 'life_coach') {
          role = 'coachee';
          topic = 'مشاوره زندگی (آغاز شده)';
          isReal = true;
      } else if (type === 'business_mentor') {
          role = 'business_client';
          topic = 'استراتژی کسب‌وکار (آغاز شده)';
          isReal = true;
      } else if (type === 'lab') {
          dispatch({ type: 'SET_VIEW', payload: View.COACHING_LAB });
          onClose();
          return;
      }

      dispatch({ 
        type: 'START_COACHING_SESSION', 
        payload: {
            role,
            topic,
            currentStep: 1,
            startTime: new Date().toISOString(),
            isRealSession: isReal
        }
      });
      dispatch({ type: 'SET_VIEW', payload: View.COACHING_SESSION });
      onClose();
  };

  const handleDownload = (itemId: string, itemName: string) => {
      setDownloadingId(itemId);
      // Simulate download delay and then download a mock file
      setTimeout(() => {
          const element = document.createElement("a");
          const file = new Blob([`This is a mock download content for: ${itemName}\n\nThank you for your purchase from Nakhlestan Ma'na.`], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${itemName.replace(/\s+/g, '_')}_Download.txt`;
          document.body.appendChild(element); 
          element.click();
          document.body.removeChild(element);
          setDownloadingId(null);
      }, 1500);
  };

  // Determine content based on purchase type
  const isSpecialSession = hasLifeCoachSession || hasBusinessMentorSession || hasCoachingLabAccess;
  const isStandardPurchase = !hasWebProject && !isSpecialSession && !hasDigitalItems;

  // Resolve Redirect Button Text
  let redirectButtonText = "بازگشت به ابزار";
  if (pendingRedirectView === View.AI_CREATION_STUDIO) redirectButtonText = "بازگشت به استودیو";
  else if (pendingRedirectView === View.ENGLISH_ACADEMY) redirectButtonText = "بازگشت به آکادمی";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
      onClick={handleCloseAndNavigate}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-lg p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.3s ease-out forwards;
          }
        `}</style>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-700 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-300" />
          </div>
          
          <h2 id="success-modal-title" className="text-2xl font-bold mb-2 text-green-300">
              {hasWebProject ? 'پروژه "معمار میراث دیجیتال" شما آغاز شد!' : 
               isSpecialSession ? 'جلسه شما آماده است!' :
               'خرید شما با موفقیت ثبت شد!'}
          </h2>
          
          <p className="text-gray-300 mb-6">
            {hasWebProject 
                ? 'سفر ساخت میراث دیجیتال شما با موفقیت شروع شد. اکنون می‌توانید اولین قدم را با گفتگوی کشف پروژه بردارید.'
                : hasLifeCoachSession 
                    ? 'رزرو مشاور هوشمند با موفقیت انجام شد. می‌توانید همین حالا جلسه را شروع کنید.'
                : hasBusinessMentorSession
                    ? 'جلسه منتورینگ بیزینس شما آماده است. برای دریافت استراتژی آماده‌اید؟'
                : hasCoachingLabAccess
                    ? 'اشتراک آزمایشگاه کوچینگ فعال شد. اکنون به تمام ابزارهای تمرینی دسترسی دارید.'
                : hasDigitalItems
                    ? 'محصولات دیجیتال شما آماده دانلود هستند.'
                : (deeds.length > 0
                    ? `${deeds.length > 1 ? `${deeds.length} اصله نخل` : 'یک اصله نخل'} با موفقیت به نام شما ثبت گردید و سند آن صادر شد.`
                    : 'از خرید شما سپاسگزاریم.')
            }
          </p>
          
          {pointsEarned && pointsEarned > 0 && (
            <div className="my-6 bg-yellow-900/40 border-2 border-yellow-700/50 text-yellow-200 p-4 rounded-lg text-center animate-fade-in-scale" style={{ animationDelay: '200ms', opacity: 0 }}>
                <p className="flex items-center justify-center text-lg">
                    <TrophyIcon className="w-8 h-8 ml-3" />
                    <span className="font-bold">+{pointsEarned.toLocaleString('fa-IR')}</span>
                    <span className="mr-2">امتیاز برکت دریافت کردید!</span>
                </p>
                <p className="text-xs text-yellow-300 mt-2">این امتیاز شما را در سفر قهرمانی‌تان یک قدم به جلو می‌برد.</p>
            </div>
          )}
          
          {/* Display Digital Items for Download */}
          {hasDigitalItems && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <ArrowDownTrayIcon className="w-5 h-5"/> دانلود فایل‌ها
                  </h3>
                  <div className="space-y-3">
                      {digitalItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-md">
                              <div className="text-right">
                                  <p className="font-semibold text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-400">{item.fileType || 'FILE'}</p>
                              </div>
                              <button 
                                onClick={() => handleDownload(item.id, item.name)}
                                disabled={downloadingId === item.id}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-1"
                              >
                                  {downloadingId === item.id ? (
                                      <span className="animate-pulse">در حال دانلود...</span>
                                  ) : (
                                      <>
                                        <ArrowDownTrayIcon className="w-4 h-4"/> دانلود
                                      </>
                                  )}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Display Deeds if any (Standard purchase) */}
          {deeds.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4 text-right max-h-48 overflow-y-auto mb-6 border border-gray-600">
              <h3 className="font-semibold mb-3">اسناد صادر شده:</h3>
              <ul className="space-y-2">
                {deeds.map(deed => (
                  <li key={deed.id} className="text-sm">
                    <span className="font-semibold text-green-400">{deed.intention}</span>
                    <span className="text-gray-400"> به نام </span>
                    <span className="font-semibold text-white">{deed.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Special Section for Web Project */}
          {hasWebProject && (
              <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-lg p-5 border border-amber-500/30 mb-6 text-center">
                  <SitemapIcon className="w-12 h-12 text-amber-400 mx-auto mb-3"/>
                  <h3 className="font-bold text-white mb-2">پنل مدیریت پروژه فعال شد</h3>
                  <p className="text-sm text-stone-300">
                      برای شروع طراحی، وارد داشبورد خود شوید و در «گفتگوی کشف» شرکت کنید.
                  </p>
              </div>
          )}

          {/* Social Share for Deeds - Simplified */}
           {isStandardPurchase && deeds.length > 0 && (
            <div className="my-6">
               <button onClick={() => handleGeneratePost(deeds[0])} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">
                <SparklesIcon className="w-5 h-5" />
                ساخت پست با هوشمانا
              </button>
            </div>
          )}

          <div className="flex justify-center space-x-reverse space-x-4">
            {pendingRedirectView ? (
                <button
                    onClick={handleCloseAndNavigate}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                >
                    {redirectButtonText}
                    <ArrowLeftIcon className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={handleCloseAndNavigate}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    بستن
                </button>
            )}
            
            {hasWebProject ? (
                 <button
                    onClick={handleGoToDashboard}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                >
                    پیگیری پروژه در داشبورد
                    <ArrowLeftIcon className="w-4 h-4" />
                </button>
            ) : hasLifeCoachSession ? (
                <button
                    onClick={() => handleStartSession('life_coach')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                >
                    <BrainCircuitIcon className="w-5 h-5"/>
                    شروع مشاوره هوشمند
                </button>
            ) : hasBusinessMentorSession ? (
                <button
                    onClick={() => handleStartSession('business_mentor')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                >
                    <BriefcaseIcon className="w-5 h-5"/>
                    ورود به جلسه منتورینگ
                </button>
             ) : hasCoachingLabAccess ? (
                <button
                    onClick={() => handleStartSession('lab')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                >
                    ورود به آزمایشگاه
                    <ArrowLeftIcon className="w-4 h-4"/>
                </button>
            ) : (
                !pendingRedirectView && deeds.length > 0 && (
                    <button
                    onClick={onViewDeeds}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                    مشاهده در گاهشمار
                    </button>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
