# Responsive Design & Mobile Guidelines

## Breakpoints

Following Tailwind CSS conventions, our responsive breakpoints are:

```typescript
const BREAKPOINTS = {
  mobile: 0,      // 0px - 767px
  tablet: 768,    // 768px - 1023px
  desktop: 1024,  // 1024px+
};
```

### Usage in Code

```typescript
import { useIsMobile } from "@/hooks/use-mobile";

const isMobile = useIsMobile(); // Returns true for screens < 768px
```

## Component Patterns

### 1. Responsive Layout Wrapper

Always wrap main page components in `ResponsiveLayout`:

```tsx
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";

export default function MyPage() {
  return (
    <ResponsiveLayout>
      {/* Your page content */}
    </ResponsiveLayout>
  );
}
```

### 2. Mobile vs Desktop Rendering

Use conditional rendering for different experiences:

```tsx
{isMobile ? (
  <MobileCardView items={items} />
) : (
  <DesktopTableView items={items} />
)}
```

### 3. Touch-Friendly Components

Minimum touch target size: **44x44px**

```tsx
<Button 
  className="min-h-[44px] min-w-[44px] touch-manipulation"
  aria-label="Descriptive action label"
>
  Action
</Button>
```

## Accessibility Requirements

### 1. ARIA Labels

All interactive elements must have descriptive labels:

```tsx
<button aria-label="Open navigation menu">
  <Menu className="h-6 w-6" />
</button>
```

### 2. Keyboard Navigation

Ensure all functionality is accessible via keyboard:
- Tab navigation between interactive elements
- Enter/Space to activate buttons
- Escape to close modals/dialogs
- Arrow keys for lists/menus

### 3. Focus Management

Visible focus indicators are required:

```css
.focus-visible:focus {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

### 4. Skip Links

Skip links are implemented at the app root level for screen readers.

## Mobile-Specific Components

### Available Components

1. **MobileNavBar** - Bottom navigation (auto-shown on mobile)
2. **MobileFAB** - Floating action button for quick actions
3. **SwipeableListItem** - Swipe gestures for list items
4. **PullToRefresh** - Pull-to-refresh functionality
5. **Drawer** - Full-screen sheets for mobile dialogs

### Example Usage

```tsx
// Swipeable list item with actions
<SwipeableListItem
  onDelete={() => handleDelete(item.id)}
  onEdit={() => handleEdit(item.id)}
>
  <ItemCard item={item} />
</SwipeableListItem>

// Pull to refresh
<PullToRefresh onRefresh={fetchData}>
  <ItemList items={items} />
</PullToRefresh>
```

## Performance Best Practices

### 1. Lazy Loading

Use React lazy loading for heavy components:

```tsx
const HeavyComponent = lazy(() => import("./HeavyComponent"));

<Suspense fallback={<CardSkeleton />}>
  <HeavyComponent />
</Suspense>
```

### 2. Loading States

Always show loading skeletons instead of spinners:

```tsx
import { CardSkeleton, TableSkeleton, ListSkeleton } from "@/components/ui/skeleton";

{loading ? <ListSkeleton items={5} /> : <ItemList items={items} />}
```

### 3. Image Optimization

```tsx
<img
  src={imageUrl}
  alt="Descriptive text"
  loading="lazy"
  className="object-cover"
/>
```

## Design System Integration

### Color Usage

**ALWAYS use semantic tokens from the design system:**

```tsx
// ❌ WRONG - Direct colors
<div className="bg-blue-500 text-white">

// ✅ CORRECT - Semantic tokens
<div className="bg-primary text-primary-foreground">
```

### Glassmorphic Effects

Use the `.glass-card` utility class:

```tsx
<div className="glass-card p-6 rounded-lg">
  {/* Content */}
</div>
```

### Typography

```tsx
// Headings
<h1 className="font-heading text-4xl md:text-5xl">

// Body text (minimum 16px on mobile)
<p className="text-base md:text-lg">
```

## Testing Checklist

### Mobile Testing
- [ ] Test on iOS Safari (primary mobile browser)
- [ ] Test on Chrome Android
- [ ] Test on various screen sizes (320px to 768px)
- [ ] Test both portrait and landscape orientations
- [ ] Verify touch targets are at least 44x44px
- [ ] Test swipe gestures work smoothly
- [ ] Verify keyboard appears correctly for inputs

### Accessibility Testing
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Verify all images have alt text
- [ ] Check color contrast ratios (WCAG AA minimum)
- [ ] Ensure focus indicators are visible
- [ ] Test skip links work correctly

### Performance Testing
- [ ] Check bundle size (should be code split)
- [ ] Verify loading skeletons appear
- [ ] Test on throttled 3G connection
- [ ] Check for layout shifts (CLS)
- [ ] Measure time to interactive (TTI)

## Common Patterns

### Full-Screen Mobile Dialogs

```tsx
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";

{isMobile ? (
  <Drawer open={open} onOpenChange={setOpen}>
    <DrawerContent className="h-[90vh]">
      <DrawerHeader>Title</DrawerHeader>
      {/* Content */}
    </DrawerContent>
  </Drawer>
) : (
  <Dialog open={open} onOpenChange={setOpen}>
    {/* Desktop dialog */}
  </Dialog>
)}
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Sticky Mobile Headers

```tsx
<header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
  <div className="flex items-center justify-between p-4">
    {/* Header content */}
  </div>
</header>
```

## Safe Area Handling (iOS)

For iOS notch and home indicator:

```css
/* Already configured in index.html */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

## Debugging Tips

### Check Current Breakpoint

```tsx
const isMobile = useIsMobile();
console.log("Is mobile:", isMobile, window.innerWidth);
```

### Simulate Mobile in Dev

Use Chrome DevTools device toolbar (Cmd/Ctrl + Shift + M)

### Performance Profiling

Use React DevTools Profiler to identify slow components

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
