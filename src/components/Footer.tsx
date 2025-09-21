import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/footballtop-logo-20.png" alt="Football Top Logo" width={40} height={40} />
              <span className="text-xl font-extrabold tracking-tight text-white">FOOTBALL TOP</span>
            </Link>
            <p className="text-sm">Official Website of the Football Club.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/news" className="hover:text-amber-400 transition-colors">ニュース</Link></li>
              <li><Link href="/matches" className="hover:text-amber-400 transition-colors">試合</Link></li>
              <li><Link href="/players" className="hover:text-amber-400 transition-colors">選手</Link></li>
              <li><Link href="/stats" className="hover:text-amber-400 transition-colors">スタッツ</Link></li>
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">More</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors"><FaXTwitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors"><FaInstagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors"><FaYoutube size={24} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 mt-12 py-4">
        <div className="container mx-auto text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Football Top. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
