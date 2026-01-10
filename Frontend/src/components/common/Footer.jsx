import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-[#0b101d] border-t border-slate-800 text-slate-400 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                            <Gamepad2 className="h-6 w-6 text-blue-500" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-pink-500">
                                Esports Arena
                            </span>
                        </Link>

                        <p className="text-sm text-slate-500 leading-relaxed">
                            A modern platform for organizing and participating in competitive esports tournaments with secure payments and automated management.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition-colors">Go To Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/tournaments" className="hover:text-white transition-colors">Browse Tournaments</Link>
                            </li>
                            <li>
                                <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
                            </li>
                            <li>
                                <Link to="/forum" className="hover:text-white transition-colors">Forum</Link>
                            </li>
                            <li>
                                <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Support & Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col items-center text-sm text-slate-500">
                    <p>© 2025 Esports Arena. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
