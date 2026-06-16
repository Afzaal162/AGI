import { useEffect, useState } from "react"
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react"
import ProjectCard from "../components/ProjectCard";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../config/axios";

export const Community = () => {

  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await api.get('/api/projects/published', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(data.projects)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="size-7 animate-spin text-indigo-400" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Community
          </h1>
          <p className="text-gray-400">See What others are creating with UGI</p>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <p className="text-lg">No community projects yet.</p>
            <p className="text-sm mt-1">Be the first to publish your creation!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                gen={project}
                setGenerations={setProjects}
                forCommunity={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}