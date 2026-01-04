import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Gamepad2 } from "lucide-react";


const navLinks = [
    { path: "/", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
    { path: "/contact", label: "Contact Us" },
];

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">

                    <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                        <Gamepad2 className="h-7 w-7 text-[#3A86FF]" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#3A86FF] to-pink-500">
                            Esports Arena
                        </span>
                    </Link>


                    {/* Desktop Menu */}
                    <ul className="hidden md:flex items-center  gap-6">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`text-sm font-medium transition ${isActive(link.path)
                                            ? "text-blue-400 border-b-2 border-blue-400"
                                            : "text-slate-300 hover:text-blue-400"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex gap-3">
                        <Link to="/login" className="text-slate-300 font-bold px-4 py-2 hover:text-blue-400">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-blue-500 text-white px-4 py-2 font-bold rounded-lg hover:bg-blue-600 shadow-[0_0_12px_#3b82f6]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden mt-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-2 rounded ${isActive(link.path)
                                        ? "bg-blue-500 text-white"
                                        : "text-slate-300 hover:bg-slate-800"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="flex flex-col gap-2 mt-4">
                            <Link
                                to="/login"
                                className="border border-slate-600 text-center py-2 rounded text-white"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-500 text-center py-2 rounded text-white"
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
