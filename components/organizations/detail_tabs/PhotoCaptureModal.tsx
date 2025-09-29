import React, { useRef, useState, useCallback, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { Camera, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhotoCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}

const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        setCapturedImage(null);
        try {
            // First, check the permission status without prompting.
            if (navigator.permissions) {
                const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
                if (permissions.state === 'denied') {
                    setError("Camera access was permanently denied. To use this feature, please go to your browser's site settings and allow camera access for this page.");
                    toast.error("Camera access denied.");
                    return;
                }
            }

            // Now, request the camera, which will prompt if necessary.
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            let errorMessage = "An unexpected error occurred while accessing the camera.";
            if (err instanceof Error) {
                // This error is thrown when the user denies or dismisses the prompt.
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    if (window.location.protocol !== 'https:') {
                        errorMessage = "Camera access is only available on secure (https) connections. Please check the website URL.";
                        toast.error("Insecure connection.");
                    } else {
                        errorMessage = "Camera access was not granted. To use this feature, please allow camera access when prompted. You may need to refresh the page to be prompted again.";
                        toast.error("Camera permission needed.");
                    }
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMessage = "No camera was found on your device. Please connect a camera and try again.";
                    toast.error("No camera found.");
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    errorMessage = "Could not start the camera. It might be in use by another application.";
                    toast.error("Camera is busy.");
                } else {
                     errorMessage = "Could not access the camera due to an unexpected error.";
                     toast.error("Camera error.");
                }
            }
            setError(errorMessage);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, startCamera, stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            stopCamera();
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };
    
    const handleSave = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Capture Photo" size="lg">
            <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden">
                {error && <div className="absolute inset-0 flex items-center justify-center text-white p-4 text-center text-sm">{error}</div>}
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${capturedImage || error ? 'hidden' : ''}`} />
                <canvas ref={canvasRef} className="hidden" />
                {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
            </div>
            <div className="mt-6 flex justify-center space-x-3">
                {capturedImage ? (
                    <>
                        <Button variant="secondary" onClick={handleRetake} leftIcon={<RefreshCw size={16} />}>Retake</Button>
                        <Button onClick={handleSave}>Save Photo</Button>
                    </>
                ) : (
                    <Button onClick={handleCapture} leftIcon={<Camera size={16} />} disabled={!!error || !stream}>
                        Capture
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default PhotoCaptureModal;