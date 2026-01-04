import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-[#0a0e1a] border-t border-[#1e293b] text-slate-400 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-1">
                        <iv className="flex items-center gap-2 text-xl font-bold">
                            <Gamepad2 className="h-7 w-7 text-[#3A86FF]" />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#3A86FF] to-pink-500">
                                Esports Arena
                            </span>
                        </iv>
                        <p className="text-sm text-slate-500">
                            Nepal's leading esports tournament platform. Organize, compete, and win with confidence.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/tournaments" className="hover:text-blue-400 transition">
                                    Browse Tournaments
                                </Link>
                            </li>
                            <li>
                                <Link to="/organizer" className="hover:text-blue-400 transition">
                                    Create Tournament
                                </Link>
                            </li>
                            <li>
                                <Link to="/leaderboards" className="hover:text-blue-400 transition">
                                    Leaderboards
                                </Link>
                            </li>
                            <li>
                                <a href="#community" className="hover:text-blue-400 transition">
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#help" className="hover:text-blue-400 transition">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-blue-400 transition">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <a href="#faq" className="hover:text-blue-400 transition">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#report" className="hover:text-blue-400 transition">
                                    Report Issue
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#privacy" className="hover:text-blue-400 transition">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#terms" className="hover:text-blue-400 transition">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#cookies" className="hover:text-blue-400 transition">
                                    Cookie Policy
                                </a>
                            </li>
                            <li>
                                <a href="#refund" className="hover:text-blue-400 transition">
                                    Refund Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-[#1e293b]"></div>

            <div className="pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
                    <p>© 2026 Esports Arena. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#twitter" className="hover:text-blue-400 transition">
                            Twitter
                        </a>
                        <a href="#discord" className="hover:text-blue-400 transition">
                            Discord
                        </a>
                        <a href="#instagram" className="hover:text-blue-400 transition">
                            Instagram
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
