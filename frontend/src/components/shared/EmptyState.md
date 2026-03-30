# EmptyState Component

## Overview
A reusable component for displaying empty states with optional icon, title, description, and action button/link.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | ReactNode | No | Icon element to display above the title |
| `title` | string | Yes | Main heading text |
| `description` | string | No | Supporting description text |
| `action` | ReactNode | No | Button or link element for user action |

## Usage Examples

### Basic Usage
```jsx
<EmptyState title="No items found" />
```

### With All Props
```jsx
<EmptyState
  icon={<SearchX className="w-8 h-8" />}
  title="No restaurants found"
  description="Try adjusting your filters"
  action={<Button onClick={clearFilters}>Clear Filters</Button>}
/>
```

### Restaurant List (AC1)
```jsx
<EmptyState
  icon={<SearchX className="w-8 h-8" />}
  title="No restaurants found"
  description="Try adjusting your filters or check back later"
  action={
    <Button variant="outline" onClick={() => setSelectedFilter('all')}>
      Clear Filters
    </Button>
  }
/>
```

### My Orders (AC2)
```jsx
<EmptyState
  icon={<Package className="w-12 h-12" />}
  title="You haven't placed any orders yet"
  description="Browse restaurants and place your first order."
  action={
    <Button onClick={onClose}>
      Browse Restaurants
    </Button>
  }
/>
```

### Cart (AC3)
```jsx
<EmptyState
  icon={<ShoppingCart className="w-12 h-12" />}
  title="Your cart is empty"
  action={<Button>Start Ordering</Button>}
/>
```

### Admin Tables (AC4)
```jsx
<EmptyState
  title="No records found"
  description="No users match your current filters"
/>
```

## Requirements Coverage

This component satisfies the following acceptance criteria from Requirements 1.4:

- **AC1**: RestaurantList shows "No restaurants found" with a "Clear Filters" button
- **AC2**: MyOrders shows "You haven't placed any orders yet" with a "Browse Restaurants" link
- **AC3**: Cart shows "Your cart is empty" with a "Start Ordering" button
- **AC4**: Admin tables show "No records found" with relevant context

## Styling

The component uses Tailwind CSS classes for styling:
- Centered text layout
- Dashed border with rounded corners
- White background
- Responsive padding
- Gray color scheme for icon and text

## Testing

Comprehensive tests are available in `EmptyState.test.js` covering:
- Required and optional props
- All four acceptance criteria scenarios
- Styling and structure validation
