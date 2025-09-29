"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary-900 text-white relative">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info - Fixed nested Link issue */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               {/* Logo */}
            <Link href={"/"} className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
              <img src={"/logo-white.svg"} alt="SSG Logo" className="filter" />
            </Link>

              <Link href="/" className="text-xl font-bold text-white hover:text-primary-100 transition-colors">
                Sejong Cyber Security
              </Link>
            </div>
            <p className="text-primary-200 max-w-sm leading-relaxed text-sm">
              세종대학교 정보보안 동아리 SSG는 체계적
              인 보안 교육과 실무 경험을 통해 미래의 보
              안 전문가를 양성합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Topics
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">About</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  SSG News
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Members
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-200 hover:text-primary-100 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Connect</h3>
            
            {/* Social Media Icons + Back to Top Arrow in one line */}
            <div className="flex items-center gap-3">
              <Link 
                href="#" 
                className="bg-primary-800 p-3 rounded-lg text-primary-200 hover:text-white hover:bg-primary-700 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </Link>
              <Link 
                href="#" 
                className="bg-primary-800 p-3 rounded-lg text-primary-200 hover:text-white hover:bg-primary-700 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </Link>
              <Link 
                href="#" 
                className="bg-primary-800 p-3 rounded-lg text-primary-200 hover:text-white hover:bg-primary-700 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </Link>
              
              {/* Back to Top Button - Now inline with social media */}
              <button
                onClick={scrollToTop}
                className="ml-15 p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 hover:cursor-pointer"
                aria-label="Back to top"
              >
                <Image
                  src="/BacktoTop.svg"
                  alt="Back to top"
                  width={38}
                  height={38}
                  className="filter brightness-0 invert"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-800 pt-6">
          <p className="text-primary-300 text-sm text-center">
            © 2025 SSG — Sejong Security Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
