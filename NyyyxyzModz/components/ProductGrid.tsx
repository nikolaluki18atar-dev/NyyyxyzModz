import ProductCard from './ProductCard'; import {Product} from '@/lib/catalog';
export default function ProductGrid({products}:{products:Product[]}){return <div className="grid">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>}
