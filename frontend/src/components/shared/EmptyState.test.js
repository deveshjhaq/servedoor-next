import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
  describe('Required Props', () => {
    it('should render with icon, title, description, and action props', () => {
      const mockIcon = <svg data-testid="test-icon" />;
      const mockAction = <button>Test Action</button>;
      
      render(
        <EmptyState
          icon={mockIcon}
          title="Test Title"
          description="Test Description"
          action={mockAction}
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Action')).toBeInTheDocument();
    });

    it('should render with only title (minimal props)', () => {
      render(<EmptyState title="Minimal Title" />);
      
      expect(screen.getByText('Minimal Title')).toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('should not render icon when not provided', () => {
      render(<EmptyState title="No Icon" />);
      
      const iconContainer = screen.queryByTestId('test-icon');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState title="No Description" />);
      
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should not render action when not provided', () => {
      render(<EmptyState title="No Action" />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Requirements 1.4 - Empty States', () => {
    it('should support AC1: RestaurantList empty state', () => {
      const clearFiltersButton = <button>Clear Filters</button>;
      
      render(
        <EmptyState
          title="No restaurants found"
          description="Try clearing your filters"
          action={clearFiltersButton}
        />
      );
      
      expect(screen.getByText('No restaurants found')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should support AC2: MyOrders empty state', () => {
      const browseLink = <a href="/restaurants">Browse Restaurants</a>;
      
      render(
        <EmptyState
          title="You haven't placed any orders yet"
          action={browseLink}
        />
      );
      
      expect(screen.getByText("You haven't placed any orders yet")).toBeInTheDocument();
      expect(screen.getByText('Browse Restaurants')).toBeInTheDocument();
    });

    it('should support AC3: Cart empty state', () => {
      const startOrderingButton = <button>Start Ordering</button>;
      
      render(
        <EmptyState
          title="Your cart is empty"
          action={startOrderingButton}
        />
      );
      
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Start Ordering')).toBeInTheDocument();
    });

    it('should support AC4: Admin tables empty state', () => {
      render(
        <EmptyState
          title="No records found"
          description="No users match your current filters"
        />
      );
      
      expect(screen.getByText('No records found')).toBeInTheDocument();
      expect(screen.getByText('No users match your current filters')).toBeInTheDocument();
    });
  });

  describe('Styling and Structure', () => {
    it('should have proper container styling', () => {
      const { container } = render(<EmptyState title="Test" />);
      
      const emptyStateDiv = container.firstChild;
      expect(emptyStateDiv).toHaveClass('text-center');
      expect(emptyStateDiv).toHaveClass('py-12');
      expect(emptyStateDiv).toHaveClass('border');
      expect(emptyStateDiv).toHaveClass('rounded-xl');
    });

    it('should render title with proper styling', () => {
      render(<EmptyState title="Styled Title" />);
      
      const title = screen.getByText('Styled Title');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });
  });
});
