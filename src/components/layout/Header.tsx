"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronDownIcon, BellIcon, Search, X, Menu, Shield } from "lucide-react";
import { UserRoleDisplay, UserRole } from "@/types/core";

const navList = [
  { 
    name: "About", 
    slug: "about",
    hasDropdown: true,
    dropdownItems: [
      { name: "About SSG", slug: "aboutSSG", href: "/aboutSSG" },
      { name: "Members", slug: "members", href: "/members" },
      { name: "Activities", slug: "activities", href: "/activities" },
      { name: "SSG News", slug: "ssg-news", href: "/news" },
      { name: "FAQs", slug: "faqs", href: "/faqs" },
    ]
  },
  { name: "Topics", slug: "topics", href: "/topics" },
  { name: "Projects", slug: "projects", href: "/projects" },
  { name: "Articles", slug: "articles", href: "/articles" },
  { name: "Newsletter", slug: "newsletter", href: "/newsletter" },
];

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [dropdowns, setDropdowns] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (slug: string) => {
    setDropdowns(prev => ({
      ...prev,
      [slug]: !prev[slug],
      // Close other dropdowns
      ...Object.keys(prev).reduce((acc, key) => {
        if (key !== slug) acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>)
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setDropdowns({}); // Close all dropdowns when toggling mobile menu
  };

  const isActive = (href: string) => pathname === href;
  
  const isDropdownActive = (dropdownItems?: Array<{href: string}>) => {
    return dropdownItems?.some(item => pathname === item.href) || false;
  };

  const handleLogout = async () => {
    await logout();
    setDropdowns({});
    setIsMobileMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  // ✅ FIX: Better user data handling with debugging
  const displayName = user?.nickname || user?.full_name || '김민준';
  const displayEmail = user?.email || 'kdr123@naver.com';
  const displayRole = user?.role ? UserRoleDisplay[user.role as UserRole] : '외부인';  
  const userInitial = displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center h-16">
          {/* Left Side: Logo + Navigation Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href={"/"} className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
              <img src={"/logo.svg"} alt="SSG Logo" className="filter" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navList.map((navItem) => (
                <div key={navItem.slug} className="relative">
                  {navItem.hasDropdown ? (
                    <div ref={el => { dropdownRefs.current[navItem.slug] = el; }}>
                      <button
                        onClick={() => toggleDropdown(navItem.slug)}
                        className={`flex items-center space-x-1 py-2 px-1 transition-all duration-200 relative group ${
                          isDropdownActive(navItem.dropdownItems) 
                            ? "text-primary-600 font-bold" 
                            : "text-gray-900 hover:text-primary-600"
                        }`}
                      >
                        <span>{navItem.name}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdowns[navItem.slug] ? 'rotate-180' : ''}`} />
                        {isDropdownActive(navItem.dropdownItems) && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full"></div>
                        )}
                      </button>
                      
                      {dropdowns[navItem.slug] && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          {navItem.dropdownItems?.map((item) => (
                            <Link 
                              key={item.slug} 
                              href={item.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors text-sm"
                              onClick={() => setDropdowns({})}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link 
                      href={navItem.href!}
                      className={`py-2 px-1 transition-all duration-200 relative group ${
                        isActive(navItem.href!) 
                          ? "text-primary-600 font-bold" 
                          : "text-gray-900 hover:text-primary-600"
                      }`}
                    >
                      {navItem.name}
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                        isActive(navItem.href!) ? "w-full" : "w-0 group-hover:w-full"
                      }`}></div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Search, Notifications, Auth */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* Search - Hidden on small screens */}
            <div className="hidden sm:block relative">
              {!isSearchOpen ? (
                <button 
                  onClick={handleSearchToggle}
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              ) : (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchToggle}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <button className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
                <BellIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* Authentication - Desktop */}
            <div className="hidden sm:block">
              {!isAuthenticated ? (
                 <Link href="/login">
                    <button className="btn btn-primary">
                      로그인
                    </button>
                  </Link>
              ) : (
                <div className="relative" ref={el => { dropdownRefs.current.userProfile = el; }}>
                  <button
                    onClick={() => toggleDropdown('userProfile')}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {userInitial}
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${dropdowns.userProfile ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdowns.userProfile && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {userInitial}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{displayName}</p>
                            <p className="text-sm text-gray-600">{displayEmail}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          권한: {displayRole}
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          href="/profile/settings" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setDropdowns({})}
                        >
                          설정
                        </Link>
                        <Link 
                          href="/profile/activity" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setDropdowns({})}
                        >
                          활동
                        </Link>
                        
                        {/* ✅ FIX: Admin Dashboard Button - Fixed flex layout */}
                        {user?.role === UserRole.ADMIN && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setDropdowns({})}
                          >
                            어드민 
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Navigation Links */}
              {navList.map((navItem) => (
                <div key={navItem.slug} className="px-4">
                  {navItem.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(`mobile-${navItem.slug}`)}
                        className="flex items-center justify-between w-full py-2 text-gray-900 hover:text-primary-600"
                      >
                        <span>{navItem.name}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdowns[`mobile-${navItem.slug}`] ? 'rotate-180' : ''}`} />
                      </button>
                      {dropdowns[`mobile-${navItem.slug}`] && (
                        <div className="pl-4 mt-2 space-y-2">
                          {navItem.dropdownItems?.map((item) => (
                            <Link
                              key={item.slug}
                              href={item.href}
                              className="block py-2 text-gray-600 hover:text-primary-600"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={navItem.href!}
                      className="block py-2 text-gray-900 hover:text-primary-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {navItem.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Auth */}
              <div className="px-4 pt-4 border-t border-gray-200">
                {!isAuthenticated ? (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="btn btn-primary w-full">
                      로그인
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 pb-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {userInitial}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">권한: {displayRole}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile/settings"
                      className="block py-2 text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      설정
                    </Link>
                    <Link
                      href="/profile/activity"
                      className="block py-2 text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      활동
                    </Link>

                    {/* ✅ FIX: Mobile Admin Dashboard Button - Fixed flex layout */}
                    {user?.role === UserRole.ADMIN && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield size={16} />
                        관리자 대시보드
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
