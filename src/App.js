import React, { useState } from "react";
import axios from "axios";

const MediaDisplay = ({ filename }) => {
  // Function to check if file is a GIF
  const isGif = filename.toLowerCase().endsWith('.gif');
  const fileUrl = `http://127.0.0.1:5000/api/download/${filename}`;

  return isGif ? (
    // Render image tag for GIFs
    <div className="bg-gray-200 rounded-md overflow-hidden shadow-md">
      <img 
        src={fileUrl} 
        alt={`Generated ${filename}`} 
        className="w-full h-auto"
      />
      <p className="text-center text-sm py-2">{filename}</p>
    </div>
  ) : (
    // Render video tag for other formats (MP4)
    <div className="bg-gray-200 rounded-md overflow-hidden shadow-md">
      <video controls className="w-full h-auto">
        <source src={fileUrl} type={`video/${filename.split('.').pop()}`} />
        Your browser does not support the video tag.
      </video>
      <p className="text-center text-sm py-2">{filename}</p>
    </div>
  );
};

const App = () => {
  const [numVideos, setNumVideos] = useState(10);
  const [outputFormat, setOutputFormat] = useState("gif");
  const [numFrames, setNumFrames] = useState(16);
  const [loading, setLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [outputDir, setOutputDir] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedVideos([]); // Clear previous videos

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/generate", {
        num_videos: numVideos,
        output_format: outputFormat,
        number_of_frames: numFrames,
      });

      if (response.data.status === 'success') {
        setGeneratedVideos(response.data.files);
        setOutputDir(response.data.output_directory);
      } else {
        throw new Error(response.data.message || 'Failed to generate videos');
      }
    } catch (error) {
      console.error("Error generating videos:", error);
      alert(error.message || "Failed to generate videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-blue-500">MoCoGAN Video Generator</h1>
        <p className="mt-2 text-gray-600">Generate videos with configurable parameters!</p>
      </header>

      <main className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numVideos" className="block text-gray-700 font-medium">
                Number of Videos
              </label>
              <input
                type="number"
                id="numVideos"
                value={numVideos}
                onChange={(e) => setNumVideos(Number(e.target.value))}
                min={1}
                max={50}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label htmlFor="outputFormat" className="block text-gray-700 font-medium">
                Output Format
              </label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              >
                <option value="gif">GIF</option>
                <option value="mp4">MP4</option>
              </select>
            </div>

            <div>
              <label htmlFor="numFrames" className="block text-gray-700 font-medium">
                Number of Frames
              </label>
              <input
                type="number"
                id="numFrames"
                value={numFrames}
                onChange={(e) => setNumFrames(Number(e.target.value))}
                min={8}
                max={64}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600 focus:ring focus:ring-blue-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating Videos..." : "Generate Videos"}
          </button>
        </form>

        {generatedVideos.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800">Generated Videos</h2>
            <p className="text-sm text-gray-500">
              Output directory: <code>{outputDir}</code>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {generatedVideos.map((video, index) => (
                <MediaDisplay key={index} filename={video} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;