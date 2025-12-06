
import React from 'react';
import { View, Product } from '../../types';

interface SEOIndexProps {
    products: Product[];
}

const SEOIndex: React.FC<SEOIndexProps> = ({ products }) => {
    // This component renders links that are visually hidden but accessible to crawlers.
    // It creates the "Spider Web" structure.
    
    return (
        <div className="sr-only" aria-hidden="true">
            <nav>
                <h2>دسترسی سریع (نقشه سایت)</h2>
                <ul>
                    {/* Main Views */}
                    {Object.values(View).map((view) => (
                        <li key={view}>
                            <a href={`/?view=${view}`}>{view.replace(/_/g, ' ')}</a>
                        </li>
                    ))}
                    
                    {/* Product Direct Links */}
                    {products.map((product) => (
                        <li key={product.id}>
                            <a href={`/?view=${View.Shop}&product_id=${product.id}`}>
                                خرید {product.name} - {product.category}
                            </a>
                        </li>
                    ))}
                    
                    {/* Intent Landing Pages (Programmatic SEO) */}
                    <li><a href={`/?view=${View.Home}&intent=father`}>کاشت نخل به یاد پدر</a></li>
                    <li><a href={`/?view=${View.Home}&intent=mother`}>کاشت نخل به یاد مادر</a></li>
                    <li><a href={`/?view=${View.Home}&intent=success`}>ثبت موفقیت شغلی</a></li>
                    <li><a href={`/?view=${View.Home}&intent=peace`}>نخل صلح و دوستی</a></li>
                </ul>
            </nav>
        </div>
    );
};

export default SEOIndex;
