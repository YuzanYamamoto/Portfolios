import Link from "next/link";
import { User } from "lucide-react";
import { APP_CONFIG, ROUTES } from "@/constants";

interface HeaderProps {
  showCreateButton?: boolean;
  showMyPageButton?: boolean;
}

export function Header({ 
  showCreateButton = false, 
  showMyPageButton = true 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full bg-spotify-dark/80 backdrop-blur-md border-b border-spotify-gray z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.HOME} className="text-2xl font-bold text-spotify-green">
            {APP_CONFIG.APP_NAME}
          </Link>
          
          <nav className="flex items-center gap-4">
            {showCreateButton && (
              <Link href={ROUTES.PLAN_CREATE}>
                <button className="bg-spotify-green text-white hover:bg-spotify-green/90 px-4 py-2 rounded transition-colors">
                  プランを作成
                </button>
              </Link>
            )}
            
            {showMyPageButton && (
              <Link
                href={ROUTES.MYPAGE}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-all duration-300 text-spotify-lightgray hover:text-white hover:scale-105"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">マイページ</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
