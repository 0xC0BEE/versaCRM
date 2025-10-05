// ui-audit.js - A simple script to check for UI inconsistencies.
// To run, paste this entire script into your browser's developer console.

(function() {
    console.clear();
    console.log("%cStarting Clay-Elevated Harmony UI Audit...", "color: #3b82f6; font-size: 16px; font-weight: bold;");

    const issues = [];
    const TOLERANCE = 1; // Allow 1px tolerance for rendering variations

    // 1. Check Button Heights
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, index) => {
        // Ignore tiny icon-only buttons
        if (btn.offsetWidth < 30 || btn.offsetHeight < 20) return;

        const expectedHeight = 40; // From style guide (md size)
        const actualHeight = btn.offsetHeight;
        if (Math.abs(actualHeight - expectedHeight) > TOLERANCE) {
            issues.push({
                element: btn,
                message: `Button height is ${actualHeight}px, expected ~${expectedHeight}px.`,
                type: 'Warning',
            });
        }
    });
    console.log(`[Audit] Scanned ${buttons.length} buttons.`);

    // 2. Check Modal Widths
    const modals = document.querySelectorAll('[role="dialog"] [class*="max-w-"]');
    modals.forEach(modal => {
        const expectedWidth = 480; // For max-w-md
        const actualWidth = modal.offsetWidth;
        if (modal.classList.contains('max-w-md') && Math.abs(actualWidth - expectedWidth) > 10) { // Wider tolerance for responsive modals
             issues.push({
                element: modal,
                message: `Modal (md) width is ${actualWidth}px, expected ~${expectedWidth}px.`,
                type: 'Info',
            });
        }
    });
    console.log(`[Audit] Scanned ${modals.length} modal panels.`);


    // 3. Check Card/Button Radii
    const elementsToCheckRadius = document.querySelectorAll('button, [class*="rounded-card"]');
     elementsToCheckRadius.forEach(el => {
        const style = window.getComputedStyle(el);
        const borderRadius = style.borderRadius;
        let expectedRadius = '10px'; // button
        if(el.classList.contains('rounded-card')) {
            expectedRadius = '16px';
        }
        
        if (borderRadius !== expectedRadius) {
             issues.push({
                element: el,
                message: `Incorrect border-radius. Found ${borderRadius}, expected ${expectedRadius}.`,
                type: 'Warning',
            });
        }
    });
    console.log(`[Audit] Scanned ${elementsToCheckRadius.length} elements for border-radius.`);


    // --- Reporting ---
    if (issues.length === 0) {
        console.log("%c✅ UI Audit Complete: No major inconsistencies found!", "color: #10b981; font-size: 14px; font-weight: bold;");
    } else {
        console.log(`%c⚠️ UI Audit Complete: Found ${issues.length} potential issues.`, "color: #f59e0b; font-size: 14px; font-weight: bold;");
        console.log("Click the arrow below to see details. Hover over an element in the list to highlight it in the page.");

        const tableData = issues.map(issue => ({
            Type: issue.type,
            Message: issue.message,
            Element: issue.element
        }));

        console.table(tableData);
        
        console.log("--- End of Report ---");
    }

})();
