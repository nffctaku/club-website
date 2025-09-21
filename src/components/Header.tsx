'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaBars, FaTimes, FaTshirt, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();


  const navLinks = [
    { href: '/news', label: 'ニュース' },
    { href: '/matches', label: '試合' },
    { href: '/teams', label: 'TEAMS' },
    { href: '/stats', label: 'スタッツ' },
  ];

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png" // Assuming the logo is in the public folder
              alt="FC26 Logo"
              width={150} // Adjust width as needed
              height={40} // Adjust height as needed
              className="object-contain w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-amber-400 transition-all duration-300">
              {link.label}
            </Link>
          ))}

          {/* Auth Buttons */}
          <div className="ml-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-all duration-300">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
                <Image src={user.photoURL!} alt={user.displayName!} width={40} height={40} className="rounded-full" />
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 transition-all duration-300">
                <FaSignInAlt />
                <span>Login</span>
              </button>
            )}
          </div>
                </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800">
          <nav className="flex flex-col items-center space-y-2 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block w-full text-center px-4 py-3 rounded-md text-base font-medium hover:bg-gray-700 hover:text-amber-400 transition-all duration-300" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}

            {/* Auth Buttons for Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-700 w-full">
              {user ? (
                <div className="flex flex-col items-center gap-4">
                   <Image src={user.photoURL!} alt={user.displayName!} width={48} height={48} className="rounded-full" />
                   <span className='text-sm font-medium'>{user.displayName}</span>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-base font-medium hover:bg-gray-700 transition-all duration-300">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => { signInWithGoogle(); setIsOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-base font-medium bg-red-600 hover:bg-red-500 transition-all duration-300">
                  <FaSignInAlt />
                  <span>Login</span>
                </button>
              )}
            </div>
                    </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
