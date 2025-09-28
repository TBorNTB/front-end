import Link from "next/link";
import { Instagram, Linkedin, Rss } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
        {/* Top section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <span className="text-white font-bold text-lg">SSG</span>
              </div>
              <span className="text-xl font-bold text-white">Sejong Security Group</span>
            </Link>
            <p className="text-primaryShades-300 max-w-md leading-relaxed">
              세종대학교 정보보안 동아리 SSG는 체계적인 보안 교육과 실무 경험을
              통해 미래의 보안 전문가를 양성합니다.
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-primaryShades-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primaryShades-400 text-sm mb-4 md:mb-0">
            © 2025 SSG (Sejong Security Group). All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              href="#" 
              className="text-primaryShades-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primaryShades-800"
            >
              <Instagram size={20} />
            </Link>
            <Link 
              href="#" 
              className="text-primaryShades-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primaryShades-800"
            >
              <Linkedin size={20} />
            </Link>
            <Link 
              href="#" 
              className="text-primaryShades-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primaryShades-800"
            >
              <Rss size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
