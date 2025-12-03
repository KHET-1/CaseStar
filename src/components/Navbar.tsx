'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, LayoutGrid, FileText } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <Scale className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">CaseStar</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Analysis
                            </Link>
                            <Link
                                href="/cases"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/cases')
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Cases
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-white/20" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
