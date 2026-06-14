import { useEffect, useState } from "react";
import type { Project } from "../types";
import { ImageIcon, Loader2Icon, RefreshCwIcon, SparkleIcon, VideoIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../config/axios";
import toast from "react-hot-toast";

const Result = () => {
  const { projectId } = useParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project>({} as Project);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjectData = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/user/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(data.project);
      setIsGenerating(data.project.isGenerating);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/projects/video",
        { projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject((prev) => ({ ...prev, generatedVideo: data.videoUrl }));
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/");
      return;
    }
    fetchProjectData();
  }, [isLoaded, user]);

  useEffect(() => {
    if (!user || !isGenerating) return;
    const interval = setInterval(() => {
      fetchProjectData();
    }, 10000);
    return () => clearInterval(interval);
  }, [user, isGenerating]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-12 my-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-12">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white truncate">
            Generation Result
          </h1>
          <Link
            to="/generate"
            className="btn-secondary text-sm flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors w-full sm:w-auto"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <span>New Generation</span>
          </Link>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Result Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div
                className={`${
                  project?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"
                } sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden`}
              >
                {project?.generatedVideo && project.generatedVideo.length > 0 ? (
                  <video
                    src={project.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : project?.generatedImage && project.generatedImage.length > 0 ? (
                  <img
                    src={project.generatedImage}
                    alt="Generated Result"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                    <ImageIcon className="size-10 opacity-40" />
                    <p className="text-sm">No media available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Download Buttons */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="mb-3 font-semibold">Actions</h3>
              <div className="flex flex-col gap-3">
                <a
                  href={project.generatedImage || "#"}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <GhostButton
                    disabled={!project.generatedImage || project.generatedImage.length === 0}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="size-4.5" />
                    Download Image
                  </GhostButton>
                </a>
                <a
                  href={project.generatedVideo || "#"}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <GhostButton
                    disabled={!project.generatedVideo || project.generatedVideo.length === 0}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <VideoIcon className="size-4.5" />
                    Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/* Generate Video */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6">
                Turn the Static Image into Dynamic Video for Social Media
              </p>
              {project.generatedVideo && project.generatedVideo.length > 0 ? (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">
                  Video Generated Successfully
                </div>
              ) : (
                <PrimaryButton
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2Icon className="size-4 animate-spin" />
                      Generating Video...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <SparkleIcon className="size-4" />
                      Generate Video
                    </span>
                  )}
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;