import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-[#0b101d] border-t border-slate-800 text-slate-400 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Gamepad2 className="h-6 w-6 text-blue-500" />
                            <span className="text-lg font-bold text-white">
                                Esports Arena
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            A modern platform for organizing and participating in competitive esports tournaments with secure payments and automated management.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/tournaments" className="hover:text-blue-400 transition-colors">Browse Tournaments</Link>
                            </li>
                            <li>
                                <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link>
                            </li>
                            <li>
                                <a href="#forum" className="hover:text-blue-400 transition-colors">Forum</a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Legal - Combined in one column or two? Image looks like 4 cols total likely. 
                       Wait, image bottom part:
                       Col 1: Logo/Desc
                       Col 2: Platform
                       Col 3: Support & Legal (This is one header in image? Or two? Looks like one Header "Support & Legal" or maybe separate.
                       Actually looking closely at the crop... Col 3: "Support & Legal" is the header.
                       So 3 cols? Or 4? 
                       Let's stick to a balanced grid. I'll make 3 cols if the user wants "Specific".
                       "Platform", "Support & Legal". That's 2 link columns. + 1 Brand column.
                       Let's do 3 columns: Brand (wide), Platform, Support & Legal.
                    */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Support & Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/help" className="hover:text-blue-400 transition-colors">Help Center</a>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                    <p>© 2026 Esports Arena. All rights reserved.</p>
                    {/* Socials can be text links based on image design */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
