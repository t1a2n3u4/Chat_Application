import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 bg-white z-10">
      <button
        onClick={handleVideoCall}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md flex items-center gap-2 transition"
      >
        <VideoIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Call</span>
      </button>
    </div>
  );
}

export default CallButton;
