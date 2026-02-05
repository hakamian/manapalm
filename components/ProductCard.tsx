'use client';

import React from 'react';

import { Product } from '../types';

import { ShoppingCartIcon, SparklesIcon } from './icons';



import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  onViewDetails?: () => void;
  onClick?: () => void;
  user?: any;
}

export default function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  onClick,
  user
}: ProductCardProps) {
  const imageSrc = product.image || (product as any).imageUrl;
  const realImageSrc = product.realImage;

  return (
    <div
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-900">
        {/* Primary Image (2D / Artistic) */}
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={product.name}
            width={400}
            height={300}
            priority={true}
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${realImageSrc
                ? 'group-hover:opacity-0 group-hover:scale-110 group-hover:blur-sm'
                : 'group-hover:scale-105'
              }`}
          />
        )}

        {/* Secondary Image (Real Photo) - Shows on Hover */}
        {realImageSrc && (
          <Image
            src={realImageSrc}
            alt={`${product.name} (Real)`}
            width={400}
            height={300}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-105 blur-md group-hover:blur-0 transition-all duration-700 ease-in-out"
          />
        )}

        {/* Overlay Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">
            {product.category}
          </span>
        </div>

        {/* Real Photo Badge Indicator */}
        {realImageSrc && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-emerald-600/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              تصویر واقعی
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors">{product.name}</h3>

        {product.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">قیمت</span>
            <span className="text-emerald-400 font-bold text-lg">
              {product.price === 0 ? 'رایگان' : `${product.price.toLocaleString('fa-IR')} تومان`}
            </span>
          </div>

          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 group-active:scale-95"

              aria-label="افزودن به سبد خرید"

            >

              <ShoppingCartIcon className="w-5 h-5" />

            </button>
          )}
        </div>
      </div>
    </div>
  );
}