
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    const { getByText } = render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    const handleClick = vi.fn();
    const { getByText } = render(<Button onClick={handleClick} disabled>Click Me</Button>);
    const button = getByText('Click Me');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('applies the correct classes for the primary variant', () => {
    const { getByText } = render(<Button variant="primary">Primary Button</Button>);
    // FIX: Check for the correct class based on the current implementation.
    expect(getByText('Primary Button')).toHaveClass('bg-primary');
  });

  it('applies the correct classes for the secondary variant', () => {
    const { getByText } = render(<Button variant="secondary">Secondary Button</Button>);
    // FIX: Check for the correct class based on the current implementation.
    expect(getByText('Secondary Button')).toHaveClass('bg-card-bg');
  });
});
