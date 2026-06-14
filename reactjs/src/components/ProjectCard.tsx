import { useState, useEffect, useRef } from 'react'
import type { Project } from '../types'
import { Loader2Icon, Download, MoreVertical, Trash2, Share2 } from 'lucide-react'

const ProjectCard = ({ gen, setGenerations, forCommunity: _forCommunity = false }
: {
    gen: Project,
    setGenerations: React.Dispatch<React.SetStateAction<Project[]>>,
    forCommunity?: boolean
}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close the dropdown if the user clicks outside the card
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 1. DOWNLOAD LOGIC
    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        const fileUrl = gen.generatedVideo || gen.generatedImage
        if (!fileUrl) return

        try {
            const response = await fetch(fileUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            
            const extension = gen.generatedVideo ? 'mp4' : 'png'
            link.download = `${gen.productName.replace(/\s+/g, '-').toLowerCase()}.${extension}`
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Download failed:", error)
        }
    }

    // 2. DELETE LOGIC
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        if (confirm("Are you sure you want to delete this generation?")) {
            setGenerations(prev => prev.filter(p => p.id !== gen.id))
        }
    }

    // 3. SHARE LOGIC
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        const fileUrl = gen.generatedVideo || gen.generatedImage
        if (!fileUrl) return

        try {
            await navigator.clipboard.writeText(fileUrl)
            alert("Link copied to clipboard!")
        } catch (error) {
            console.error("Failed to copy link:", error)
        }
    }

    return (
        <div key={gen.id} className='mb-4 break-inside-avoid' ref={menuRef}>
            <div className="bg-white/5 border border-white/10 rounded-xl 
            overflow-hidden hover:border-white/20 transition group relative">
                
                {/* Preview Container */}
                <div className={`${gen?.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-Video'} relative overflow-hidden`}>
                    
                    {gen.generatedImage && (
                        <img src={gen.generatedImage} alt={gen.productName} className={
                            `absolute inset-0 w-full h-full object-cover transition 
                            duration-500 ${gen.generatedVideo ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`
                        } />
                    )}

                    {gen.generatedVideo && (
                        <video src={gen.generatedVideo} muted loop playsInline
                            className='absolute inset-0 w-full h-full object-cover
                            opacity-0 group-hover:opacity-100 transition duration-500'
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()} />
                    )}

                    {/* NEW: THREE-DOT MENU BUTTON AND DROPDOWN */}
                    {(gen.generatedImage || gen.generatedVideo) && (
                        <div className="absolute top-3 right-3 z-30">
                            {/* The trigger button becomes visible on card hover, or stays visible if menu is open */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                                className={`p-1.5 rounded-lg bg-black/60 border border-white/10 text-white backdrop-blur-md
                                transition-all duration-200 hover:bg-neutral-800
                                ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <MoreVertical className="size-5" />
                            </button>

                            {/* Dropdown Card Options */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-36 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <Download className="size-4 text-indigo-400" />
                                        Download
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <Share2 className="size-4 text-emerald-400" />
                                        Share Link
                                    </button>
                                    <hr className="border-white/5 my-1" />
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                                    >
                                        <Trash2 className="size-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {(!gen?.generatedImage && !gen?.generatedVideo) && (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/20">
                            <Loader2Icon className='size-7 animate-spin' />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute left-3 top-3 flex gap-2 items-center z-20">
                        {gen.isGenerating && (
                            <span className='text-xs px-2 py-1 bg-yellow-600/30 rounded-full text-yellow-200'>Generating</span>
                        )}
                        {gen.isPublished && (
                            <span className='text-xs px-2 py-1 bg-green-600/30 rounded-full text-green-200'>Published</span>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className='p-4'>
                    <div className="flex items-center justify-between gap-4">
                        <div className='flex-1'>
                            <h3 className="font-medium text-lg mb-1">{gen.productName}</h3>
                            {gen?.createdAt && (
                                <p className='text-sm text-gray-400'>
                                    Created: {new Date(gen.createdAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-white/5 rounded-full">Aspect:{gen.aspectRatio}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard