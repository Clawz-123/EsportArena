import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Gamepad2 } from "lucide-react";


const navLinks = [
    { path: "/", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/contact", label: "Contact" },
];

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
            <div className="container mx-auto px-6">
                <div className="flex h-20 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Gamepad2 className="h-6 w-6 text-blue-500" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">
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

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-slate-300 text-sm font-medium hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors"
                        >
                            Get Started
                        </Link>
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;
