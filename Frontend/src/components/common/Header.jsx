import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Gamepad2, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../slices/auth";


const navLinks = [
    { path: "/", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/contact", label: "Contact" },
];

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const { isAuthenticated, user } = useSelector((state) => state.auth || {});

    const isActive = (path) => location.pathname === path;

    const getInitials = (u) => {
        if (!u) return "U";
        const name = u.name || u.email || "User";
        const parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase() || "U";
    };

    const getDisplayName = (u) => {
        if (!u) return "User";
        return u.name || u.email || "User";
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
        } finally {
            setShowUserMenu(false);
            navigate("/");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        // Close user menu on route change
        setShowUserMenu(false);
        // Close mobile menu on route change
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (
                showUserMenu &&
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [showUserMenu]);

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
            <div className="container mx-auto px-6">
                <div className="flex h-20 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Gamepad2 className="h-6 w-6 text-blue-500" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-pink-500">
                            Esports Arena
                        </span>
                    </Link>


                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors ${isActive(link.path)
                                        ? "text-white"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Right Side: Auth Buttons or User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-slate-300 text-sm font-medium hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <div className="relative">
                                <button
                                    ref={buttonRef}
                                    onClick={() => setShowUserMenu((v) => !v)}
                                    className="flex items-center gap-2 focus:outline-none"
                                    aria-label="User menu"
                                >
                                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {getInitials(user)}
                                    </div>
                                </button>
                                {showUserMenu && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 mt-2 w-56 rounded-md bg-[#0a0e1a] border border-slate-800 shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="px-3 py-3 border-b border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                                    {getInitials(user)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm text-white truncate">
                                                        {getDisplayName(user)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="py-1">
                                            <li>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        navigate("/dashboard");
                                                    }}
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        navigate("/profile");
                                                    }}
                                                >
                                                    View Profile
                                                </button>
                                            </li>
                                            <li className="border-t border-slate-800" />
                                            <li>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-slate-300 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-[#0a0e1a] border-t border-slate-800 absolute top-20 left-0 right-0 p-4 space-y-4 shadow-xl">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive(link.path)
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!isAuthenticated ? (
                            <div className="border-t border-slate-800 my-2 pt-2 flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-300 text-center py-2 hover:text-white"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-blue-600 text-white text-center py-2 rounded-md font-semibold hover:bg-blue-700"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            <div className="border-t border-slate-800 my-2 pt-2">
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {getInitials(user)}
                                    </div>
                                    <div>
                                        <div className="text-sm text-white">
                                            {user?.name || user?.username || "User"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/dashboard");
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/profile");
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;
