import './globals.css';
import Link from 'next/link';
import BrandParticleOverlay from '@/components/BrandParticleOverlay';
export const metadata={title:'NyyyxyzModz — Premium Digital Store',description:'NyyyxyzModzOfc — Premium Digital Store'};
export default function RootLayout({children}:{children:React.ReactNode}){return <>
<BrandParticleOverlay /><header className="nav"><div className="container navin"><Link className="brand" href="/">Nyyyxyz<span>Modz</span></Link><nav className="navlinks"><Link href="/products">Produk</Link><Link href="/help">Bantuan</Link><Link href="/orders">Pesanan</Link><Link href="/cart">Keranjang</Link><Link href="/wishlist">Wishlist</Link><Link href="/account">Akun</Link></nav><Link className="btn primary" href="/products">Belanja</Link></div></header>{children}<a className="cs" href="https://wa.me/6285770528356" target="_blank" aria-label="Customer service">⌁</a><footer className="footer"><div className="container"><b>NyyyxyzModzOfc</b><p>PREMIUM DIGITAL STORE · Manual QRIS · Support WhatsApp</p><small>Produk game digital memiliki risiko sesuai kebijakan game. Tidak ada jaminan anti-ban/anti-deteksi.</small></div></footer></>}
