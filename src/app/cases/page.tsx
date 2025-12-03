'use client';

import { useEffect, useState } from 'react';
import { getCases, Case } from '@/lib/api';
import { FileText, Plus, Search, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchCases() {
            try {
                const response = await getCases();
                setCases(response.cases);
            } catch (err) {
                setError('Failed to load cases. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchCases();
    }, []);

    const filteredCases = cases.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Case Management</h1>
                        <p className="text-gray-400 mt-1">View and manage your analyzed legal cases</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Analysis
                    </Link>
                </div>

                {/* Search and Filter Bar */}
                <div className="glass p-4 rounded-xl flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search cases by title or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-medium">Loading cases...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-900/50 text-center">
                        {error}
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">No cases found</h3>
                        <p className="text-gray-400 mt-1 max-w-sm mx-auto">
                            {searchTerm ? "Try adjusting your search terms." : "Get started by analyzing your first legal document."}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center mt-4 px-4 py-2 text-blue-400 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg transition-colors font-medium"
                            >
                                Start Analysis
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="glass rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-sm uppercase tracking-wider">Case Title</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-sm uppercase tracking-wider">Case ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-sm uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-sm uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredCases.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{c.title}</p>
                                                        <p className="text-xs text-gray-500">Legal Document</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400 font-mono text-sm bg-white/5 px-2 py-1 rounded w-fit">
                                                    <Hash className="w-3 h-3" />
                                                    {c.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(c.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-500 hover:text-blue-400 font-medium text-sm transition-colors">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
