import { useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const FilePreviewModal = ({
  file,
  downloadUrl,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !file) return null;

  const isImage = file.mimeType?.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  const isVideo = file.mimeType?.startsWith("video/");
  const isAudio = file.mimeType?.startsWith("audio/");
  const isText = file.mimeType?.startsWith("text/");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && hasPrev) onPrev();
    if (e.key === "ArrowRight" && hasNext) onNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-medium truncate max-w-md">
            {file.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2" />
            </>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="flex items-center justify-center w-full h-full p-16">
        {isImage && downloadUrl && (
          <img
            src={downloadUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        )}

        {isPdf && downloadUrl && (
          <iframe
            src={downloadUrl}
            title={file.name}
            className="w-full h-full rounded-lg bg-white"
          />
        )}

        {isVideo && downloadUrl && (
          <video
            src={downloadUrl}
            controls
            className="max-w-full max-h-full rounded-lg"
          >
            Your browser does not support video playback.
          </video>
        )}

        {isAudio && downloadUrl && (
          <div className="glass-card p-8 rounded-xl">
            <audio src={downloadUrl} controls className="w-96">
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {!isImage && !isPdf && !isVideo && !isAudio && (
          <div className="glass-card p-8 rounded-xl text-center">
            <p className="text-white/60 mb-4">
              Preview not available for this file type
            </p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors"
            >
              Download to view
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal;
