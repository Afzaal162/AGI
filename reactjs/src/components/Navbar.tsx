import { DollarSignIcon, FolderEditIcon, GalleryHorizontalEnd, MenuIcon, SparkleIcon, XIcon } from 'lucide-react';
import { PrimaryButton, GhostButton } from './Buttons';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../config/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { openSignIn, openSignUp } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const [credits, setCredits] = useState(0);
    const { pathname } = useLocation();
    const { getToken } = useAuth();

    const navLinks = [
        { name: 'Home', href: '/#' },
        { name: 'Generate', href: '/generate' },
        { name: 'Community', href: '/community' },
        { name: 'Plans', href: '/plans' },
    ];

  const getUserCredits = async () => {
    try {
        const token = await getToken();
        console.log("TOKEN:", token); // Look at your browser console to verify this isn't null

        // 🛑 ADD THIS GUARD LINE: 
        // If Clerk isn't ready yet, abort the request so it doesn't trigger a 401 error
        if (!token) return; 

        const { data } = await api.get('/api/user/credits', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setCredits(data.credits);
    } catch (error: any) {
        // Suppress notification popups for temporary background auth checks
        if (error?.response?.status !== 401) {
            toast.error(error?.response?.data?.message || error.message);
        }
        console.log("Navbar Fetch Error:", error);
    }
};

    useEffect(() => {
        if (user) {
            (async () => await getUserCredits())();
        }
    }, [user, pathname]);

    const handleMobileAuth = (authFunction: () => void) => {
        setIsOpen(false);
        authFunction();
    };

    return (
        <motion.nav className='fixed top-5 left-0 right-0 z-50 px-4'
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
        >
            <div className='max-w-6xl mx-auto flex items-center justify-between 
            bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3'>
                
                {/* Logo */}
                <Link to='/' onClick={() => window.scrollTo(0, 0)}>
                    <img src={assets.logo} alt="logo" className="h-8" />
                </Link>

                {/* Desktop Links */}
                <div className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-300'>
                    {navLinks.map((link) => (
                        <Link
                            onClick={() => window.scrollTo(0, 0)} to={link.href} key={link.name}
                            className="hover:text-white transition">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Authentication & Credits Section */}
                <div className='hidden md:flex items-center justify-end gap-4'>
                    {!user ? (
                        <div className='flex items-center gap-3'>
                            <button onClick={() => openSignIn()} className='text-sm font-medium text-gray-300 hover:text-white transition'>
                                Sign in
                            </button>
                            <PrimaryButton onClick={() => openSignUp()}>
                                Get Started
                            </PrimaryButton>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <GhostButton onClick={() => navigate('/plans')} className='border-none text-gray-300 sm:py-1.5'>
                                Credits: {credits}
                            </GhostButton>
                            
                            <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-visible">
                                <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} afterSignOutUrl="/">
                                    <UserButton.MenuItems>
                                        <UserButton.Action label='Generate' labelIcon={<SparkleIcon size={14} />} onClick={() => navigate('/')} />
                                        <UserButton.Action label='My Generations' labelIcon={<FolderEditIcon size={14} />} onClick={() => navigate('/my-generations')} />
                                        <UserButton.Action label='Community' labelIcon={<GalleryHorizontalEnd size={14} />} onClick={() => navigate('/my-generations')} />
                                        <UserButton.Action label='Plans' labelIcon={<DollarSignIcon size={14} />} onClick={() => navigate('/plans')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle Icon */}
                <button onClick={() => setIsOpen(!isOpen)} className='md:hidden text-white focus:outline-none'>
                    <MenuIcon className='size-6' />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`flex flex-col items-center justify-center gap-6 text-lg font-medium fixed inset-0 bg-black/95 backdrop-blur-md z-50 transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                {navLinks.map((link) => (
                    <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                        {link.name}
                    </a>
                ))}

                {!user ? (
                    <>
                        <button onClick={() => handleMobileAuth(openSignIn)} className='font-medium text-gray-300 hover:text-white transition'>
                            Sign in
                        </button>
                        <PrimaryButton onClick={() => handleMobileAuth(openSignUp)}>
                            Get Started
                        </PrimaryButton>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 mt-2">
                        {/* ✅ FIXED: Cleaned up currentCredits error to match active database credits state */}
                        <GhostButton onClick={() => { setIsOpen(false); navigate('/plans'); }} className='text-gray-300 border-none'>
                            Credits: {credits}
                        </GhostButton>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full mt-2">
                            <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} afterSignOutUrl="/">
                                <UserButton.MenuItems>
                                    <UserButton.Action label='Generate' labelIcon={<SparkleIcon size={14} />} onClick={() => { setIsOpen(false); navigate('/'); }} />
                                    <UserButton.Action label='My Generations' labelIcon={<FolderEditIcon size={14} />} onClick={() => { setIsOpen(false); navigate('/my-generations'); }} />
                                    <UserButton.Action label='Community' labelIcon={<GalleryHorizontalEnd size={14} />} onClick={() => { setIsOpen(false); navigate('/my-generations'); }} />
                                    <UserButton.Action label='Plans' labelIcon={<DollarSignIcon size={14} />} onClick={() => { setIsOpen(false); navigate('/plans'); }} />
                                </UserButton.MenuItems>
                            </UserButton>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-white p-2 text-gray-800 ring-white active:ring-2 mt-4"
                >
                    <XIcon />
                </button>
            </div>
        </motion.nav>
    );
}