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
    const { isTourOpen, closeTour, tourStep, setTourStep, tourConfig, setCurrentPage, openSidebarSection } = useApp();
    const [targetRect, setTargetRect] = useState<TourStepRect | null>(null);
    const [, setTourCompleted] = useLocalStorage(tourKey, false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentStepConfig = tourConfig ? tourConfig[tourStep] : null;

    useEffect(() => {
        if (!isTourOpen || !currentStepConfig) {
            setTargetRect(null);
            return;
        }

        let intervalId: number | null = null;
        let attempts = 0;

        const findAndSetTarget = () => {
            const targetElement = document.querySelector(currentStepConfig.selector);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return true;
            }
            return false;
        };

        // Poll for the element to appear
        intervalId = window.setInterval(() => {
            attempts++;
            if (findAndSetTarget() || attempts > 50) { // Try for up to 5 seconds
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                if (attempts > 50) {
                    console.warn(`Tour element not found: ${currentStepConfig.selector}`);
                    setTargetRect(null); // Hide if not found after timeout
                }
            }
        }, 100);

        window.addEventListener('resize', findAndSetTarget);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            window.removeEventListener('resize', findAndSetTarget);
        };
    }, [isTourOpen, tourStep, currentStepConfig]);
    
    const handleNext = () => {
        if (!tourConfig) return;
        const nextStep = tourStep + 1;
        if (nextStep < tourConfig.length) {
            const nextStepConfig = tourConfig[nextStep];
            if (nextStepConfig.openSection) {
                openSidebarSection(nextStepConfig.openSection);
            }
            if (nextStepConfig.page) {
                setCurrentPage(nextStepConfig.page);
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
            const prevStepConfig = tourConfig[prevStep];
            if (prevStepConfig.openSection) {
                openSidebarSection(prevStepConfig.openSection);
            }
            if (prevStepConfig.page) {
                setCurrentPage(prevStepConfig.page);
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