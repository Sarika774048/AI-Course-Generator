const VideoPlayer = ({ videoUrl, onReplace }) => {
  
  // Helper: Extract Video ID from various YouTube URL formats
  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return <div className="text-red-500 text-sm">Invalid Video URL</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-slate-50 p-3 shadow-sm">
      {/* 1. The Video Embed */}
      <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* 2. Controls (Regenerate Button) */}
      <div className="flex justify-end mt-2">
        <button 
            onClick={onReplace} 
            className="text-xs text-fuchsia-600 hover:text-fuchsia-800 font-medium cursor-pointer underline"
        >
            Wrong video? Regenerate
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;