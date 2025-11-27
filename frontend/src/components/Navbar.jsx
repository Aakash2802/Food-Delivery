import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, HelpCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import AnimatedBadge from './AnimatedBadge';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount, cartBounce } = useCartStore();
  const { isDarkMode, toggleDarkMode, initTheme } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const cartCount = getItemCount();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'vendor':
        return '/vendor';
      case 'driver':
        return '/driver';
      case 'admin':
        return '/admin';
      default:
        return '/profile';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 w-full animate-slide-down transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap transition-colors duration-300 group-hover:text-red-600">FoodDelivery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-red-600 transition-all duration-300 hover:scale-110 font-medium">
                  Dashboard
                </Link>
                <Link to="/help" className="text-gray-700 hover:text-red-600 transition-all duration-300 hover:scale-110 flex items-center space-x-1 font-medium">
                  <HelpCircle className="w-5 h-5" />
                  <span>Help</span>
                </Link>
                {user?.role === 'customer' && (
                  <Link to="/cart" className="relative group" data-cart-icon>
                    <ShoppingCart className={`w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:text-red-600 transition-all duration-300 group-hover:scale-110 ${cartBounce ? 'animate-cart-bounce text-red-600' : ''}`} />
                    <AnimatedBadge
                      count={cartCount}
                      color="red"
                      className="absolute -top-2 -right-2"
                    />
                  </Link>
                )}
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user?.name}</span>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50 animate-slide-down">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-2 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle for non-authenticated */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-red-600 transition-all duration-300 hover:scale-110 font-medium">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 btn-hover font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden pb-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block py-2 text-gray-700"
                  onClick={() => setShowMenu(false)}
                >
                  Dashboard
                </Link>
                {user?.role === 'customer' && (
                  <Link
                    to="/cart"
                    className="block py-2 text-gray-700"
                    onClick={() => setShowMenu(false)}
                  >
                    Cart ({cartCount})
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700"
                  onClick={() => setShowMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700"
                  onClick={() => setShowMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-gray-700"
                  onClick={() => setShowMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
