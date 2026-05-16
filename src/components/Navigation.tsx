
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";
import { fetchJson } from "@/lib/apiConfig";

// Store status type
interface StoreStatus {
  id: number;
  isOpen: boolean;
  closedMessage: string | null;
  reopenTime: string | null;
}

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  
  // Store status state
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);

  // Fetch store status
  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const data = await fetchJson<StoreStatus>('store-status');
        setStoreStatus(data);
      } catch (err) {
        console.error('Failed to fetch store status:', err);
      }
    };
    
    fetchStoreStatus();
  }, []);

  const isStoreClosed = storeStatus?.isOpen === false;

  const navigation = [
    { name: t('nav.shop'), href: "/" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3" aria-label="LUXURY LINE Home">
              <img
                src="/logo.png"
                alt="LUXURY LINE Logo"
                className="h-14 w-14 md:h-12 md:w-12 object-contain drop-shadow-md"
                loading="eager"
              />
              <span className="text-2xl font-bold hidden md:inline text-gray-900 dark:text-gray-500" style={{ fontFamily: 'Forum, serif' }}>LUXURY LINE</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              {/* Language toggle hidden for now */}
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
                title={t('nav.switchLanguage')}
              >
                <Languages size={18} />
                <span className="font-bold">{language === 'en' ? 'PT' : 'EN'}</span>
              </Button> */}
              <ThemeToggle />
              {!isStoreClosed && <CartDrawer />}
            </div>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            {/* Language toggle hidden for now */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2 text-gray-700 hover:bg-gray-100 transition-all duration-300"
              title={t('nav.switchLanguage')}
            >
              <span className="text-sm font-bold">{language === 'en' ? 'PT' : 'EN'}</span>
            </Button> */}
            <ThemeToggle />
            {!isStoreClosed && <CartDrawer />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <X size={40} /> : <Menu size={40} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
