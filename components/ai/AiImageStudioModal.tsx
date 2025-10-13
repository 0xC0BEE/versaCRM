import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { GoogleGenAI } from '@google/genai';
import toast from 'react-hot-toast';
import { Loader, Wand2 } from 'lucide-react';

interface AiImageStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (dataUrl: string) => void;
}

const AiImageStudioModal: React.FC<AiImageStudioModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt for the image.");
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });
            
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setGeneratedImage(imageUrl);

        } catch (error) {
            console.error("AI Image Generation Error:", error);
            toast.error("Failed to generate image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseImage = () => {
        if (generatedImage) {
            onGenerate(generatedImage);
            onClose();
        }
    };
    
    // Reset state on close
    const handleClose = () => {
        setPrompt('');
        setGeneratedImage(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="AI Image Studio" size="2xl">
            <div className="flex flex-col md:flex-row gap-6 min-h-[50vh]">
                {/* Left: Config Panel */}
                <div className="w-full md:w-1/3 space-y-4">
                    <Textarea
                        id="ai-image-prompt"
                        label="Describe the image you want to create"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g., A photorealistic image of a team collaborating in a modern office."
                        rows={6}
                    />
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full" leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}>
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </Button>
                </div>

                {/* Right: Results Panel */}
                <div className="w-full md:w-2/3 p-4 bg-hover-bg rounded-lg flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center text-text-secondary">
                            <Loader size={24} className="animate-spin mx-auto mb-2" />
                            <p>Generating your image...</p>
                            <p className="text-xs">This may take a moment.</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="space-y-4 text-center">
                            <img src={generatedImage} alt="AI Generated" className="rounded-md max-h-[40vh] object-contain" />
                            <Button onClick={handleUseImage}>Use This Image</Button>
                        </div>
                    ) : (
                        <div className="text-center text-text-secondary">
                            <p>Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AiImageStudioModal;