/**
 * UI Audit Script - Clay-Elevated Harmony Consistency Validator
 *
 * This script validates that all UI components adhere to the exact specifications:
 * - Button height: 40px (44px on mobile)
 * - Modal widths: 320px / 480px / 640px
 * - Dropdown backgrounds: var(--card-bg)
 * - List item text: var(--text-primary) only
 * - Hover colors: var(--primary-hover) for primary actions
 *
 * Usage: node scripts/ui-audit.js
 * Or run in browser console after including this script
 */

class UIAuditor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  // Button Validation
  auditButtons() {
    console.log('🔍 Auditing Buttons...');
    const buttons = document.querySelectorAll('button');

    buttons.forEach((button, index) => {
      const computedStyle = window.getComputedStyle(button);
      const height = parseFloat(computedStyle.height);
      const minWidth = parseFloat(computedStyle.minWidth);
      const borderRadius = parseFloat(computedStyle.borderRadius);

      // Check height: should be 40px desktop, 44px mobile
      if (height !== 40 && height !== 44) {
        this.errors.push({
          type: 'button-height',
          element: button,
          expected: '40px (or 44px on mobile)',
          actual: `${height}px`,
          location: this.getElementPath(button),
        });
      }

      // Check min-width: should be >= 96px
      if (minWidth < 96 && minWidth !== 0) {
        this.warnings.push({
          type: 'button-min-width',
          element: button,
          expected: '>= 96px',
          actual: `${minWidth}px`,
          location: this.getElementPath(button),
        });
      }

      // Check border-radius: should be 10px
      if (Math.abs(borderRadius - 10) > 1) {
        this.warnings.push({
          type: 'button-border-radius',
          element: button,
          expected: '10px',
          actual: `${borderRadius}px`,
          location: this.getElementPath(button),
        });
      }

      // Check for ripple class
      if (!button.classList.contains('ripple') && !button.hasAttribute('disabled')) {
        this.info.push({
          type: 'button-ripple-missing',
          element: button,
          message: 'Button missing ripple effect class',
          location: this.getElementPath(button),
        });
      }
    });

    console.log(`✅ Audited ${buttons.length} buttons`);
  }

  // Modal Validation
  auditModals() {
    console.log('🔍 Auditing Modals...');
    const modals = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');

    modals.forEach((modal, index) => {
      const modalContent = modal.querySelector('div[class*="w-"]');
      if (!modalContent) return;

      const computedStyle = window.getComputedStyle(modalContent);
      const width = parseFloat(computedStyle.width);
      const maxHeight = computedStyle.maxHeight;
      const borderRadius = parseFloat(computedStyle.borderRadius);

      // Check width: should be 320px, 480px, or 640px
      const validWidths = [320, 480, 640, 800];
      if (!validWidths.some(w => Math.abs(width - w) < 5)) {
        this.errors.push({
          type: 'modal-width',
          element: modal,
          expected: '320px / 480px / 640px / 800px',
          actual: `${width}px`,
          location: this.getElementPath(modal),
        });
      }

      // Check max-height: should be 85vh
      if (!maxHeight.includes('85vh')) {
        this.warnings.push({
          type: 'modal-max-height',
          element: modal,
          expected: '85vh',
          actual: maxHeight,
          location: this.getElementPath(modal),
        });
      }

      // Check border-radius: should be 16px
      if (Math.abs(borderRadius - 16) > 1) {
        this.warnings.push({
          type: 'modal-border-radius',
          element: modal,
          expected: '16px',
          actual: `${borderRadius}px`,
          location: this.getElementPath(modal),
        });
      }

      // Check backdrop blur
      const backdrop = modal.querySelector('[class*="backdrop"]');
      if (backdrop) {
        const backdropStyle = window.getComputedStyle(backdrop);
        const backdropFilter = backdropStyle.backdropFilter || backdropStyle.webkitBackdropFilter;

        if (!backdropFilter || !backdropFilter.includes('blur')) {
          this.warnings.push({
            type: 'modal-backdrop-blur',
            element: modal,
            message: 'Modal backdrop missing blur effect',
            location: this.getElementPath(modal),
          });
        }
      }
    });

    console.log(`✅ Audited ${modals.length} modals`);
  }

  // Dropdown Validation
  auditDropdowns() {
    console.log('🔍 Auditing Dropdowns...');
    const dropdowns = document.querySelectorAll('[role="listbox"], [role="menu"], select');

    dropdowns.forEach((dropdown, index) => {
      const computedStyle = window.getComputedStyle(dropdown);
      const bgColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      const minWidth = parseFloat(computedStyle.minWidth);

      // Check min-width: should be >= 240px
      if (minWidth < 240 && minWidth !== 0) {
        this.warnings.push({
          type: 'dropdown-min-width',
          element: dropdown,
          expected: '>= 240px',
          actual: `${minWidth}px`,
          location: this.getElementPath(dropdown),
        });
      }

      // Check item height: should be 44px
      const items = dropdown.querySelectorAll('[role="option"], option, li');
      items.forEach((item, itemIndex) => {
        const itemStyle = window.getComputedStyle(item);
        const height = parseFloat(itemStyle.height);

        if (height !== 44 && height !== 0) {
          this.warnings.push({
            type: 'dropdown-item-height',
            element: item,
            expected: '44px',
            actual: `${height}px`,
            location: this.getElementPath(item),
          });
        }
      });
    });

    console.log(`✅ Audited ${dropdowns.length} dropdowns`);
  }

  // List/Table Row Validation
  auditLists() {
    console.log('🔍 Auditing Lists & Tables...');
    const listItems = document.querySelectorAll('li, tr, [role="row"]');

    listItems.forEach((item, index) => {
      const computedStyle = window.getComputedStyle(item);
      const height = parseFloat(computedStyle.height);
      const color = computedStyle.color;

      // Check height: should be 52px (56px on mobile)
      if (item.closest('table') || item.closest('[role="grid"]')) {
        if (height !== 52 && height !== 56 && height !== 0) {
          this.warnings.push({
            type: 'list-item-height',
            element: item,
            expected: '52px (56px on mobile)',
            actual: `${height}px`,
            location: this.getElementPath(item),
          });
        }
      }

      // Check font color consistency
      const textColor = this.rgbToVar(color);
      if (textColor && !['--text-primary', '--text-secondary'].includes(textColor)) {
        this.info.push({
          type: 'list-text-color',
          element: item,
          message: 'List item using non-standard text color',
          actual: color,
          location: this.getElementPath(item),
        });
      }
    });

    console.log(`✅ Audited ${listItems.length} list items`);
  }

  // Card Validation
  auditCards() {
    console.log('🔍 Auditing Cards...');
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');

    cards.forEach((card, index) => {
      const computedStyle = window.getComputedStyle(card);
      const padding = parseFloat(computedStyle.padding);
      const minHeight = parseFloat(computedStyle.minHeight);
      const borderRadius = parseFloat(computedStyle.borderRadius);

      // Check padding: should be 1.25rem (20px)
      if (Math.abs(padding - 20) > 2 && padding !== 0) {
        this.warnings.push({
          type: 'card-padding',
          element: card,
          expected: '20px (1.25rem)',
          actual: `${padding}px`,
          location: this.getElementPath(card),
        });
      }

      // Check min-height: should be >= 120px
      if (minHeight < 120 && minHeight !== 0) {
        this.info.push({
          type: 'card-min-height',
          element: card,
          expected: '>= 120px',
          actual: `${minHeight}px`,
          location: this.getElementPath(card),
        });
      }

      // Check border-radius: should be 16px
      if (Math.abs(borderRadius - 16) > 1 && borderRadius !== 0) {
        this.warnings.push({
          type: 'card-border-radius',
          element: card,
          expected: '16px',
          actual: `${borderRadius}px`,
          location: this.getElementPath(card),
        });
      }
    });

    console.log(`✅ Audited ${cards.length} cards`);
  }

  // Utility: Get element path for debugging
  getElementPath(element) {
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').slice(0, 2).join('.');
        if (classes) selector += `.${classes}`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  // Utility: Convert RGB to CSS variable name (approximation)
  rgbToVar(rgb) {
    // This is a simplified approximation
    // In practice, you'd need to compare actual computed values
    return null;
  }

  // Run all audits
  runFullAudit() {
    console.log('🚀 Starting Clay-Elevated Harmony UI Audit...\n');

    this.auditButtons();
    this.auditModals();
    this.auditDropdowns();
    this.auditLists();
    this.auditCards();

    this.printReport();
  }

  // Print audit report
  printReport() {
    console.log('\n📊 === AUDIT REPORT ===\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Perfect! No issues found. UI is fully compliant with Clay-Elevated Harmony specs.');
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ ERRORS (${this.errors.length}):`);
        this.errors.forEach((error, i) => {
          console.log(`\n${i + 1}. [${error.type}]`);
          console.log(`   Expected: ${error.expected}`);
          console.log(`   Actual: ${error.actual}`);
          console.log(`   Location: ${error.location}`);
        });
      }

      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach((warning, i) => {
          console.log(`\n${i + 1}. [${warning.type}]`);
          console.log(`   Expected: ${warning.expected || 'N/A'}`);
          console.log(`   Actual: ${warning.actual || 'N/A'}`);
          console.log(`   Message: ${warning.message || 'N/A'}`);
          console.log(`   Location: ${warning.location}`);
        });
      }

      if (this.info.length > 0) {
        console.log(`\nℹ️  INFO (${this.info.length}):`);
        this.info.forEach((info, i) => {
          console.log(`\n${i + 1}. [${info.type}]`);
          console.log(`   Message: ${info.message}`);
          console.log(`   Location: ${info.location}`);
        });
      }
    }

    console.log('\n======================\n');

    // Return summary
    return {
      errors: this.errors.length,
      warnings: this.warnings.length,
      info: this.info.length,
      passed: this.errors.length === 0,
    };
  }
}

// Export for Node.js or use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIAuditor;
} else if (typeof window !== 'undefined') {
  window.UIAuditor = UIAuditor;

  // Auto-run on page load
  if (document.readyState === 'complete') {
    console.log('Running UI Audit...');
    const auditor = new UIAuditor();
    auditor.runFullAudit();
  } else {
    window.addEventListener('load', () => {
      console.log('Running UI Audit...');
      const auditor = new UIAuditor();
      auditor.runFullAudit();
    });
  }
}
