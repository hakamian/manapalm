
import React, { useEffect, useRef } from 'react';
import { CloudIcon, ArrowUpTrayIcon } from '../icons';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  className?: string;
}

const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({ 
  onUploadSuccess, 
  buttonText = "آپلود تصویر",
  className = "" 
}) => {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Check if Cloudinary script is loaded
    if (typeof window !== 'undefined' && (window as any).cloudinary) {
      cloudinaryRef.current = (window as any).cloudinary;
      
      // Configure your Cloud Name and Upload Preset here
      // Note: In a real app, use environment variables. 
      // For this demo, we use placeholders. You MUST create an 'unsigned' upload preset in Cloudinary.
      const cloudName = "YOUR_CLOUD_NAME"; // Replace with your Cloud Name
      const uploadPreset = "YOUR_UNSIGNED_PRESET"; // Replace with your Unsigned Upload Preset

      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          clientAllowedFormats: ['image', 'video'], // Allow images and videos
          maxFileSize: 10000000, // 10MB
          text: {
            en: {
              queue: {
                done: "تکمیل شد"
              },
              menu: {
                files: "فایل‌های من",
                web: "آدرس وب"
              },
              local: {
                 browse: "انتخاب فایل",
                 dd_title_single: "فایل را اینجا رها کنید"
              }
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            // Pass the secure_url back to the parent
            onUploadSuccess(result.info.secure_url);
          }
        }
      );
    }
  }, [onUploadSuccess]);

  const openWidget = () => {
    if (widgetRef.current) {
        // If config is missing, show alert for demo purposes
        if (widgetRef.current.cloudName === "YOUR_CLOUD_NAME") {
            alert("لطفاً ابتدا Cloud Name و Upload Preset خود را در فایل CloudinaryUploadWidget.tsx تنظیم کنید.");
            return;
        }
        widgetRef.current.open();
    } else {
        console.warn("Cloudinary widget not initialized. Script might not be loaded.");
    }
  };

  return (
    <button 
      onClick={openWidget} 
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors ${className}`}
    >
      <ArrowUpTrayIcon className="w-5 h-5" />
      <span>{buttonText}</span>
    </button>
  );
};

export default CloudinaryUploadWidget;
