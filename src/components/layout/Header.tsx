"use client";
import Image from 'next/image';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronDownIcon, BellIcon, Search, X, Menu, Shield, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import AlarmPopup from "./AlarmPopup";
import SearchModal from "./SearchModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getRoleDisplayLabel, hasAdminAccess } from "@/lib/role-utils";
import { useChatRoom } from "@/context/ChatContext";

const navList = [
  { name: "About", 
    slug: "about",
    hasDropdown: true,
    dropdownItems: [
      { name: "About SSG", slug: "aboutSSG", href: "/aboutSSG" },
      { name: "Members", slug: "members", href: "/members" },
      { name: "Activities", slug: "activities", href: "/activities" },
      { name: "FAQs", slug: "faqs", href: "/faqs" },
    ]
  },
  { name: "Topics", slug: "topics", href: "/topics" },
  { name: "Projects", slug: "projects", href: "/projects" },
  { name: "Articles", slug: "articles", href: "/articles" },
  { name: "Community", slug: "community", href: "/community" },
  { name: "Newsletter", slug: "newsletter", href: "/newsletter" },
];

const Header = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdowns, setDropdowns] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlarmPopupOpen, setIsAlarmPopupOpen] = useState(false);
  const { user:profileData } = useCurrentUser();
  const { toggleChatRoom } = useChatRoom();
  
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
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 프로필 정보는 hooks에서 로드 (useProfileData)

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
    toast.success('로그아웃되었습니다.');
    await logout();
    setDropdowns({});
    setIsMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
    setSearchQuery("");
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };


  // URL 유효성 검사 함수
  const isValidImageUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return null;
    // 상대 경로는 유효함
    if (url.startsWith('/')) return url;
    // 절대 URL 검사
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  // API에서 가져온 프로필 데이터 우선 사용, 없으면 AuthContext의 user 데이터 사용
  const displayName = profileData?.realName || profileData?.nickname || user?.nickname || user?.full_name || '사용자';
  const displayEmail = profileData?.email || user?.email || '';
  const profileImageUrl = isValidImageUrl(profileData?.profileImageUrl) || isValidImageUrl(user?.profile_image) || null;

  // Role handling
  const combinedRole = profileData?.role ?? user?.role;
  const displayRole = getRoleDisplayLabel(combinedRole);
  const isAdmin = hasAdminAccess(combinedRole);

  const userInitial = displayName?.charAt(0)?.toUpperCase() || displayEmail?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center h-16">
          {/* Left Side: Logo + Navigation Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href={"/"} className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
              <Image src="/logo.svg" alt="Logo" width={50} height={50} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navList.map((navItem) => (
                <div key={navItem.slug} className="relative">
                  {navItem.hasDropdown ? (
                    <div ref={el => { dropdownRefs.current[navItem.slug] = el; }}>
                      <button
                        onClick={() => toggleDropdown(navItem.slug)}
                        className={`flex items-center space-x-1 py-2 px-1 transition-all duration-200 cursor-pointer ${
                          isDropdownActive(navItem.dropdownItems) 
                            ? "text-primary-600 font-bold" 
                            : "text-gray-900 hover:text-primary-600"
                        }`}
                      >
                        <span className="relative group pb-1">
                          {navItem.name}
                          <div className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                            isDropdownActive(navItem.dropdownItems) ? "w-full" : "w-0 group-hover:w-full"
                          }`}></div>
                        </span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdowns[navItem.slug] ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {dropdowns[navItem.slug] && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          {navItem.dropdownItems?.map((item) => (
                            <Link 
                              key={item.slug} 
                              href={item.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors text-sm cursor-pointer"
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
                      className={`py-2 px-1 transition-all duration-200 relative cursor-pointer inline-block ${
                        isActive(navItem.href!) 
                          ? "text-primary-600 font-bold" 
                          : "text-gray-900 hover:text-primary-600"
                      }`}
                    >
                      <span className="relative group pb-1 inline-block">
                        {navItem.name}
                        <div className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                          isActive(navItem.href!) ? "w-full" : "w-0 group-hover:w-full"
                        }`}></div>
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Search, Notifications, Auth */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* Search - Hidden on small screens */}
            <div className="hidden sm:block">
              <button 
                onClick={handleSearchClick}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            {isAuthenticated && (
              <button 
                onClick={toggleChatRoom}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Open chat room"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <>
                <button 
                  onClick={() => setIsAlarmPopupOpen(true)}
                  className="relative p-2.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-all duration-200 group cursor-pointer"
                >
                  <BellIcon className="w-5 h-5 text-primary-600 group-hover:text-primary-700 transition-colors" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>
                </button>
                <AlarmPopup 
                  isOpen={isAlarmPopupOpen} 
                  onClose={() => setIsAlarmPopupOpen(false)} 
                />
              </>
            )}

            {/* Authentication - Desktop */}
            <div className="hidden sm:block">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : !isAuthenticated ? (
                 <Link href="/login">
                    <button className="btn btn-primary cursor-pointer">
                      로그인
                    </button>
                  </Link>
              ) : (
                <div className="relative" ref={el => { dropdownRefs.current.userProfile = el; }}>
                  <button
                    onClick={() => toggleDropdown('userProfile')}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {profileImageUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-200">
                        <ImageWithFallback
                          src={profileImageUrl}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          showPlaceholder={false}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {userInitial}
                      </div>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${dropdowns.userProfile ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdowns.userProfile && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {profileImageUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                              <ImageWithFallback
                                src={profileImageUrl}
                                alt={displayName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                showPlaceholder={false}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                              {userInitial}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{displayName}</p>
                            <p className="text-sm text-gray-600 truncate">{displayEmail}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          권한: {displayRole}
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          href="/mypage" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setDropdowns({})}
                        >
                          마이페이지
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setDropdowns({})}
                          >
                            어드민 대시보드 
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {navList.map((navItem) => (
                <div key={navItem.slug} className="px-4">
                  {navItem.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(`mobile-${navItem.slug}`)}
                        className="flex items-center justify-between w-full py-2 text-gray-900 hover:text-primary-600 cursor-pointer"
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
                              className="block py-2 text-gray-600 hover:text-primary-600 cursor-pointer"
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
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-gray-900 hover:text-primary-600 cursor-pointer"
                    >
                      {navItem.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Auth */}
              <div className="px-4 pt-4 border-t border-gray-200">
                {loading ? (
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse" />
                ) : !isAuthenticated ? (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="btn btn-primary w-full cursor-pointer">
                      로그인
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 pb-3">
                      {profileImageUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                          <ImageWithFallback
                            src={profileImageUrl}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            showPlaceholder={false}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{displayName}</p>
                        <p className="text-sm text-gray-500">권한: {displayRole}</p>
                      </div>
                    </div>
                    
                    <Link
                      href="/mypage"
                      className="block py-2 text-gray-700 hover:text-primary-600 cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      마이페이지
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield size={16} />
                        관리자 대시보드
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-700 cursor-pointer"
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

    <SearchModal
      isOpen={isSearchModalOpen}
      onClose={() => setIsSearchModalOpen(false)}
      searchQuery={searchQuery}
      onSearchChange={handleSearchQueryChange}
    />
    </>
  );
};

export default Header;
