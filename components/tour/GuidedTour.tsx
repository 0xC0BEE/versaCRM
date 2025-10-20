import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';
import useLocalStorage from '../../hooks/useLocalStorage';

interface TourStepRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface GuidedTourProps {
    tourKey: 'tourCompleted_admin' | 'tourCompleted_team';
}

const GuidedTour: React.FC<GuidedTourProps> = ({ tourKey }) => {
    const { isTourOpen, closeTour, tourStep, setTourStep, tourConfig, setCurrentPage } = useApp();
    const [targetRect, setTargetRect] = useState<TourStepRect | null>(null);
    const [, setTourCompleted] = useLocalStorage(tourKey, false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentStepConfig = tourConfig ? tourConfig[tourStep] : null;

    useEffect(() => {
        if (!isTourOpen || !currentStepConfig) {
            setTargetRect(null);
            return;
        }

        const updateTarget = () => {
            const targetElement = document.querySelector(currentStepConfig.selector);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            } else {
                setTargetRect(null); // Hide if element not found
            }
        };
        
        // Use a timeout to allow the page to render before finding the element
        const timer = setTimeout(updateTarget, 100);
        
        window.addEventListener('resize', updateTarget);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTarget);
        };
    }, [isTourOpen, tourStep, currentStepConfig]);
    
    const handleNext = () => {
        if (!tourConfig) return;
        const nextStep = tourStep + 1;
        if (nextStep < tourConfig.length) {
            const nextPage = tourConfig[nextStep].page;
            if (nextPage) {
                setCurrentPage(nextPage);
            }
            setTourStep(nextStep);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (!tourConfig) return;
        const prevStep = tourStep - 1;
        if (prevStep >= 0) {
             const prevPage = tourConfig[prevStep].page;
            if (prevPage) {
                setCurrentPage(prevPage);
            }
            setTourStep(prevStep);
        }
    };

    const handleFinish = () => {
        setTourCompleted(true);
        closeTour();
    };

    if (!isTourOpen || !currentStepConfig) {
        return null;
    }

    const popoverPosition = {
        top: 0,
        left: 0,
        transform: 'translate(0, 0)',
    };

    if (targetRect && popoverRef.current) {
        const popoverHeight = popoverRef.current.offsetHeight;
        
        // Position below by default
        popoverPosition.top = targetRect.top + targetRect.height + 12;
        popoverPosition.left = targetRect.left;

        // If it would go off-screen at the bottom, position above
        if (popoverPosition.top + popoverHeight > window.innerHeight) {
            popoverPosition.top = targetRect.top - popoverHeight - 12;
        }

        // Clamp left position to not go off-screen
        popoverPosition.left = Math.max(8, Math.min(popoverPosition.left, window.innerWidth - popoverRef.current.offsetWidth - 8));
    }


    return (
        <div className="tour-overlay">
            {targetRect && (
                <div
                    className="tour-spotlight"
                    style={{
                        top: `${targetRect.top - 4}px`,
                        left: `${targetRect.left - 4}px`,
                        width: `${targetRect.width + 8}px`,
                        height: `${targetRect.height + 8}px`,
                    }}
                />
            )}
            <div 
                ref={popoverRef}
                className="tour-popover" 
                style={{
                    top: `${popoverPosition.top}px`,
                    left: `${popoverPosition.left}px`,
                    visibility: targetRect ? 'visible' : 'hidden',
                }}
            >
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{currentStepConfig.title}</h3>
                    <p className="text-sm text-text-secondary">{currentStepConfig.content}</p>
                </div>
                <div className="px-4 py-3 bg-hover-bg flex justify-between items-center">
                    <span className="text-xs text-text-secondary">{tourStep + 1} / {tourConfig.length}</span>
                    <div className="flex gap-2">
                        {tourStep > 0 && <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>}
                        <Button size="sm" onClick={handleNext}>
                            {tourStep === tourConfig.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidedTour;