'use client';

import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick?: () => void;
}

export default function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {

  // Handle both 'image' (from types) and 'imageUrl' (legacy/potential typo)

  const imageSrc = product.image || (product as any).imageUrl;



  return (

    <div 

      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"

      onClick={onClick}

    >

      {imageSrc && (

        <img 

          src={imageSrc} 

          alt={product.name}

          className="w-full h-48 object-cover"

        />

      )}
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-emerald-600 font-bold text-xl">
            {product.price.toLocaleString('fa-IR')} تومان
          </span>
          
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              افزودن به سبد
            </button>
          )}
        </div>
        
        {product.category && (
          <div className="mt-3">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}