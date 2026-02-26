import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    UploadCloud,
    TrendingUp,
    Eye,
    ThumbsUp,
    MessageSquare,
    Video,
    BarChart3,
    Search,
    ArrowUpRight,
    Activity,
    PlayCircle,
    CalendarDays,
    Flame,
    HeartPulse,
    Hash,
    Loader2
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- Utility Functions ---
const formatCompactNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) return '0';
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

// --- Custom CSV Parser ---
// Intelligently handles commas inside quoted fields
const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("File seems empty or invalid.");

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        let inQuotes = false;
        let currentVal = '';
        let rowVals = [];

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                rowVals.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        rowVals.push(currentVal.trim());

        const rowData = {};
        headers.forEach((header, index) => {
            let val = rowVals[index] !== undefined ? rowVals[index] : '';
            // Clean up surrounding quotes from values
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }

            // Intelligent Type Conversion
            if (['Subscribers', 'Total Views', 'Total Videos', 'Views', 'Likes', 'Comments'].includes(header)) {
                rowData[header] = parseInt(val.replace(/,/g, ''), 10) || 0;
            } else if (header === 'Published Date') {
                rowData[header] = new Date(val);
            } else {
                rowData[header] = val;
            }
        });

        // Only add rows that have a valid Video Title
        if (rowData['Video Title']) {
            data.push(rowData);
        }
    }
    return data;
};

// --- Main Component ---
export default function App() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Auto-Fetch from Google Sheets ---
    useEffect(() => {
        // PASTE YOUR GOOGLE SHEETS CSV LINK HERE:
        const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEpL2NbKKiwCM7zAGBM-jU-nzPeI77HONUw_M6ifBUTe6Ldr4H2nMwhEMRUBDe7KCaiMQEzTOPgoOa/pub?gid=0&single=true&output=csv";

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(SHEET_CSV_URL);
                if (!response.ok) throw new Error("Network response was not ok");

                const csvText = await response.text();
                const parsedData = parseCSV(csvText);

                if (parsedData.length === 0) throw new Error("No valid data found in Google Sheet.");

                setData(parsedData);
                setError('');
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load live data. Please check your Google Sheets link.");
            } finally {
                setIsLoading(false);
            }
        };

        // If you haven't put a real link yet, stop loading so it shows an error instead of hanging
        if (SHEET_CSV_URL === "YOUR_GOOGLE_SHEETS_CSV_LINK_HERE") {
            setIsLoading(false);
            setError("Please insert your Google Sheets CSV link in the code.");
        } else {
            fetchData();
        }
    }, []);

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const parsedData = parseCSV(text);
                setData(parsedData);
                setError('');
            } catch (err) {
                console.error("File upload error:", err);
                setError("Failed to parse CSV file. Please check the format.");
            }
        };
        reader.readAsText(file);
    };

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const loadMockData = () => {
        const mockCsv = `Channel Name,Subscribers,Total Views,Total Videos,Video Title,Views,Likes,Comments,Published Date,URL
Data with Baraa,305000,15603940,404,13-Hour Python Course is LIVE 🚀,4239,329,22,2026-02-24T17:45:27Z,https://youtube.com/watch?v=AsDMGj-8GCU
Data with Baraa,305000,15603940,404,Python Full Course for Beginners (13 Hours) – From Zero to Hero,124038,12244,1497,2026-02-20T13:00:07Z,https://youtube.com/watch?v=Rq5gJVxz55Q
Data with Baraa,305000,15603940,404,300k THANK YOU❤️! 🔥Our Community Is On Fire🔥,14317,1177,107,2026-01-20T16:45:24Z,https://youtube.com/watch?v=4R8m3wFjbxU
Data with Baraa,305000,15603940,404,I Almost Quit Because of This,81756,4507,312,2025-12-20T13:00:55Z,https://youtube.com
Data with Baraa,305000,15603940,404,"A Deep Dive into Tableau Relationships ""Noodles"" - Tableau Tutorial #8",33239,2113,89,2025-11-01T07:26:16Z,https://youtube.com
Data with Baraa,305000,15603940,404,"Tableau Relationships, Data Blending, Joins and Union - Tableau Tutorial #7",43540,2416,147,2025-10-01T07:26:07Z,https://youtube.com
Data with Baraa,305000,15603940,404,"How to Connect Tableau to Database,Text, Excel,CSV,JSON, and PDF  - Tableau Tutorial #6",51842,3034,101,2025-09-30T07:21:34Z,https://youtube.com`;
        handleFileUpload(new File([mockCsv], "mock_data.csv", { type: "text/csv" }));
    };

    // --- Data Processing (Intelligent Aggregation) ---
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const channelName = data[0]['Channel Name'] || 'Unknown Channel';
        const totalSubscribers = data[0]['Subscribers'] || 0;
        const channelTotalViews = data[0]['Total Views'] || 0;
        const channelTotalVideos = data[0]['Total Videos'] || 0;

        let sumViews = 0;
        let sumLikes = 0;
        let sumComments = 0;

        // Sort chronologically by date
        const sortedData = [...data].sort((a, b) => a['Published Date'] - b['Published Date']);

        // Monthly aggregation for trends
        const trendsMap = new Map();

        // Top videos tracking
        let topVideos = [...data].sort((a, b) => (b['Views'] || 0) - (a['Views'] || 0)).slice(0, 5);

        sortedData.forEach(video => {
            const views = video['Views'] || 0;
            const likes = video['Likes'] || 0;
            const comments = video['Comments'] || 0;

            sumViews += views;
            sumLikes += likes;
            sumComments += comments;

            // Ensure valid date for grouping
            const date = video['Published Date'];
            if (date && !isNaN(date.getTime())) {
                const monthYear = Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
                if (!trendsMap.has(monthYear)) {
                    trendsMap.set(monthYear, { month: monthYear, views: 0, likes: 0, count: 0 });
                }
                const current = trendsMap.get(monthYear);
                current.views += views;
                current.likes += likes;
                current.count += 1;
            }
        });

        const trendsData = Array.from(trendsMap.values());

        const avgViews = data.length > 0 ? Math.round(sumViews / data.length) : 0;
        const avgEngagementRate = sumViews > 0 ? (((sumLikes + sumComments) / sumViews) * 100).toFixed(2) : 0;

        return {
            channelInfo: {
                name: channelName,
                subscribers: totalSubscribers,
                totalViews: channelTotalViews,
                totalVideos: channelTotalVideos
            },
            kpis: {
                analyzedVideos: data.length,
                totalViewsAnalyzed: sumViews,
                totalLikesAnalyzed: sumLikes,
                avgViews,
                avgEngagementRate
            },
            trendsData,
            topVideos,
            allVideos: [...data].sort((a, b) => b['Published Date'] - a['Published Date'])
        };
    }, [data]);

    const filteredVideos = useMemo(() => {
        if (!processedData?.allVideos) return [];
        return processedData.allVideos.filter(v =>
            v['Video Title']?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [processedData, searchTerm]);


    // --- Render Functions ---

    // 1. Premium Loading / Error View
    if (!data) {
        return (
            <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex items-center justify-center p-6 relative overflow-hidden">
                {/* Visual Ambient Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="max-w-md w-full relative z-10">
                    <div className="flex flex-col items-center text-center">
                        {/* Branded Logo/Icon Container */}
                        <div className="mb-10 relative">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 border border-zinc-800/50 overflow-hidden shadow-2xl transition-all duration-700 hover:scale-110 active:scale-95 group">
                                <img
                                    src="https://res.cloudinary.com/dtnqyl2zb/image/upload/v1772127419/channels4_profile_xmnvxf.jpg"
                                    alt="Baraa"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg">
                                <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-white mb-2 ml-[0.2em]">
                            Baraa Hub
                        </h1>
                        <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-zinc-500 mb-12">
                            Intelligence & Insights
                        </p>

                        {isLoading ? (
                            <div className="space-y-6 w-full">
                                <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-[progress_2s_ease-in-out_infinite]"></div>
                                </div>
                                <p className="text-xs font-medium text-zinc-400 animate-pulse tracking-wide">
                                    Syncing live data from your story...
                                </p>
                            </div>
                        ) : (
                            <div className="w-full space-y-8">
                                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm">
                                    <p className="text-sm text-red-400 font-medium leading-relaxed">
                                        {error || "Connection to data stream interrupted."}
                                    </p>
                                </div>
                                <button
                                    onClick={loadMockData}
                                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl transition-all duration-300 font-semibold text-sm shadow-xl hover:shadow-white/10 active:scale-95 mx-auto"
                                >
                                    <PlayCircle className="w-5 h-5" />
                                    <span>Experience Demo</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Footer Credit */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.2em] text-zinc-600 uppercase">
                    &copy; 2026 Data with Baraa
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes progress {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}} />
            </div>
        );
    }

    // 2. Dashboard View
    const { channelInfo, kpis, trendsData, topVideos } = processedData;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                            <span className="text-sm text-zinc-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}
                            </span>
                            <span className="text-sm font-medium text-white">
                                {Intl.NumberFormat('en-US').format(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-blue-500/30">

            {/* Header / Nav */}
            <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700/50 shadow-lg shrink-0 bg-zinc-800 flex items-center justify-center">
                            <img
                                src="https://res.cloudinary.com/dtnqyl2zb/image/upload/v1772127419/channels4_profile_xmnvxf.jpg"
                                alt={channelInfo.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">{channelInfo.name}</h1>
                            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest leading-tight">Channel Overview</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 hidden sm:flex">
                        <div className="text-right">
                            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mb-0.5">Subscribers</p>
                            <p className="text-sm font-medium text-zinc-200">{formatCompactNumber(channelInfo.subscribers)}</p>
                        </div>
                        <div className="w-px h-8 bg-zinc-800"></div>
                        <div className="text-right">
                            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest mb-0.5">Total Views</p>
                            <p className="text-sm font-medium text-zinc-200">{formatCompactNumber(channelInfo.totalViews)}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-40">
                            <BarChart3 className="w-24 h-24 text-blue-500 -mr-6 -mt-6 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-zinc-400 font-medium mb-1">Total Views</p>
                            <p className="text-3xl font-medium tracking-tight text-white mb-4">
                                {formatCompactNumber(kpis.totalViewsAnalyzed)}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                    <Eye className="w-3 h-3" /> Based on {kpis.analyzedVideos} videos
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-40">
                            <TrendingUp className="w-24 h-24 text-emerald-500 -mr-6 -mt-6 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-zinc-400 font-medium mb-1">Average Views / Video</p>
                            <p className="text-3xl font-medium tracking-tight text-white mb-4">
                                {formatCompactNumber(kpis.avgViews)}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                    <Activity className="w-3 h-3" /> Median metric
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-40">
                            <ThumbsUp className="w-24 h-24 text-amber-500 -mr-6 -mt-6 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-zinc-400 font-medium mb-1">Total Engagements</p>
                            <p className="text-3xl font-medium tracking-tight text-white mb-4">
                                {formatCompactNumber(kpis.totalLikesAnalyzed)}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                                    <ThumbsUp className="w-3 h-3" /> Likes & Comments
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-40">
                            <MessageSquare className="w-24 h-24 text-violet-500 -mr-6 -mt-6 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-zinc-400 font-medium mb-1">Avg Engagement Rate</p>
                            <p className="text-3xl font-medium tracking-tight text-white mb-4">
                                {kpis.avgEngagementRate}%
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="flex items-center gap-1 text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
                                    <Activity className="w-3 h-3" /> vs total views
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-base font-medium text-white mb-1">Views Over Time</h3>
                                <p className="text-sm text-zinc-500">Monthly aggregation of video performance</p>
                            </div>
                            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                                <TrendingUp className="w-5 h-5 text-zinc-400" />
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        tickFormatter={(value) => formatCompactNumber(value)}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        name="Views"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#09090b', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Videos Bar Chart */}
                    <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-base font-medium text-white mb-1">Top Performing</h3>
                                <p className="text-sm text-zinc-500">Highest view count videos</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVideos} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                                    <XAxis
                                        type="number"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        tickFormatter={(value) => formatCompactNumber(value)}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="Video Title"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={false} // Hide messy long titles on axis
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl max-w-xs">
                                                        <p className="text-sm text-white font-medium mb-2 line-clamp-2 leading-tight">
                                                            {payload[0].payload['Video Title']}
                                                        </p>
                                                        <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                                                            {Intl.NumberFormat('en-US').format(payload[0].value)} Views
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="Views" radius={[0, 4, 4, 0]} barSize={24}>
                                        {topVideos.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#3f3f46'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Deep Dive Data Table */}
                <div className="bg-[#111113] border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/20">
                        <div>
                            <h3 className="text-base font-medium text-white mb-1">Content Archive</h3>
                            <p className="text-sm text-zinc-500">Detailed performance metrics for all analyzed videos</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#111113] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Video Title</th>
                                    <th className="px-6 py-4 text-right">Published</th>
                                    <th className="px-6 py-4 text-right">Views</th>
                                    <th className="px-6 py-4 text-right">Likes</th>
                                    <th className="px-6 py-4 text-right">Comments</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredVideos.map((video, index) => {
                                    const url = video['URL'];
                                    return (
                                        <tr key={index} className="hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-6 py-4 w-full max-w-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 min-w-max">
                                                        <PlayCircle className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <p className="text-zinc-200 font-medium truncate whitespace-normal line-clamp-2 leading-snug">
                                                        {video['Video Title']}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-zinc-400">
                                                {formatDate(video['Published Date'])}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-medium text-zinc-200">{Intl.NumberFormat('en-US').format(video['Views'] || 0)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-zinc-400">
                                                {Intl.NumberFormat('en-US').format(video['Likes'] || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-zinc-400">
                                                {Intl.NumberFormat('en-US').format(video['Comments'] || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {url && url.startsWith('http') ? (
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </a>
                                                ) : (
                                                    <span className="text-zinc-700">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredVideos.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            No videos found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}