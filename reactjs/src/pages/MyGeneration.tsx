import { useEffect, useState } from "react"
import type { Project } from "../types"
import { Loader2Icon } from "lucide-react"
import ProjectCard from "../components/ProjectCard"
import { PrimaryButton } from "../components/Buttons"

const MyGeneration = () => {
  const [generations, setGenerations] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGeneations = async () => {
    setTimeout(() => {
      setGenerations([]);
      setLoading(false);
    }, 3000)
  }

  useEffect(() => {
    fetchGeneations()
  }, [])

  // 1. CLEAN LOADING STATE: Only shows the spinner centered on the screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <Loader2Icon className="size-8 animate-spin text-indigo-400 mr-2" />
        <span className="text-gray-400">Loading your assets...</span>
      </div>
    )
  }

  // 2. MAIN STATE: Renders automatically after 3 seconds when loading is false
  return (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            My Generations
          </h1>
          <p className="text-gray-400">View & Manage your AI Generated Content</p>
        </header>

        {/* Project List Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map((gen) => (
            <ProjectCard key={gen.id} gen={gen} setGenerations={setGenerations} forCommunity={true} />
          ))}
        </div>

        {/* Empty Fallback State (Fixed a small typo in 'No Generations Yet') */}
        {generations.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 mt-6">
            <h3 className="text-xl font-medium mb-2">No Generations Yet</h3>
            <p className="text-gray-400 mb-6">Start Creating Now</p>
            <PrimaryButton onClick={() => window.location.href = '/generate'}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGeneration