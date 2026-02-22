"use client";

import Link from "next/link";
import Image from "next/image";
import {Github, Mail, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white relative">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
                <Image src="/logo-white.svg" alt="SSG Logo" width={40} height={40} unoptimized />
              </Link>
              <Link href="/" className="text-lg text-white hover:text-primary-100 transition-colors">
                Sejong Cyber Security
              </Link>
            </div>
            <p className="text-primary-200 max-w-sm leading-relaxed text-sm">
              세종대학교 정보보안 동아리 SSG는 체계적인 보안 교육과 실무 경험을 통해 미래의 보안 전문가를 양성합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-primary-200 hover:text-primary-100 transition-colors">Home</Link></li>
              <li><Link href="/projects" className="text-primary-200 hover:text-primary-100 transition-colors">Projects</Link></li>
              <li><Link href="/articles" className="text-primary-200 hover:text-primary-100 transition-colors">Articles</Link></li>
              <li><Link href="/topics" className="text-primary-200 hover:text-primary-100 transition-colors">Topics</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">About</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-primary-200 hover:text-primary-100 transition-colors">About Us</Link></li>
              <li><Link href="/news" className="text-primary-200 hover:text-primary-100 transition-colors">SSG News</Link></li>
              <li><Link href="/members" className="text-primary-200 hover:text-primary-100 transition-colors">Members</Link></li>
              <li><Link href="/contact" className="text-primary-200 hover:text-primary-100 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <div className="flex items-start gap-4">
              <div>
                <div className="space-y-4 text-sm text-gray-300">
                  <div>
                    <p>세종대학교 광개토관</p>
                    <p>서울특별시 광진구 능동로 209</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <a href="mailto:ssg@sejong.ac.kr" className="hover:text-blue-400 transition-colors duration-200">
                      ssg@sejong.ac.kr
                    </a>
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <a href="#" className="text-gray-700 hover:text-blue-400 transition duration-200 hover:scale-110">
                      <Github className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-700 hover:text-blue-400 transition duration-200 hover:scale-110">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-700 hover:text-blue-400 transition duration-200 hover:scale-110">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Back to Top Button */}
              <button
                onClick={scrollToTop}
                className="p-2 rounded-lg transition duration-200 hover:cursor-pointer"
                aria-label="Back to top"
              >
                <Image
                  src="/icon/BacktoTop.svg"
                  alt="Back to top"
                  width={38}
                  height={38}
                  className="filter brightness-0 invert"
                  unoptimized
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