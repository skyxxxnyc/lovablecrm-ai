# Accessibility Testing Checklist

## Automated Testing

### Tools to Use
- [ ] Lighthouse Accessibility Audit (Chrome DevTools)
- [ ] axe DevTools browser extension
- [ ] WAVE Web Accessibility Evaluation Tool
- [ ] Pa11y automated testing

### Target Scores
- [ ] Lighthouse Accessibility Score: 90+
- [ ] Zero critical axe violations
- [ ] WCAG 2.1 Level AA compliance

## Manual Testing - Keyboard Navigation

### Global Navigation
- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab navigates backward correctly
- [ ] Focus indicators are clearly visible
- [ ] No keyboard traps (can exit all components)
- [ ] Skip links work (try Tab on page load)

### Specific Components
- [ ] Dialog/Modal: 
  - Focus trapped within when open
  - Escape key closes
  - Focus returns to trigger element
- [ ] Dropdown menus:
  - Arrow keys navigate options
  - Enter/Space selects
  - Escape closes
- [ ] Tables:
  - Navigate cells with Tab
  - Screen reader announces row/column headers
- [ ] Forms:
  - Tab between fields in logical order
  - Error messages associated with fields
  - Required fields clearly indicated

## Screen Reader Testing

### Test with Multiple Readers
- [ ] macOS: VoiceOver (Cmd+F5)
- [ ] Windows: NVDA or JAWS
- [ ] iOS: VoiceOver (in Settings)
- [ ] Android: TalkBack (in Settings)

### Content Verification
- [ ] All images have descriptive alt text
- [ ] Decorative images use alt="" or aria-hidden="true"
- [ ] Icon buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Loading states are announced (aria-live)
- [ ] Page title changes on navigation

### Semantic HTML
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmarks used correctly:
  - `<header>` for page header
  - `<nav>` for navigation
  - `<main>` for main content
  - `<aside>` for sidebars
  - `<footer>` for page footer
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Buttons are `<button>` not `<div>`
- [ ] Links are `<a>` with href

## Visual Testing

### Color Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Large text contrast ratio ≥ 3:1 (18px+ or 14px+ bold)
- [ ] Interactive element contrast ≥ 3:1
- [ ] Test in both light and dark mode
- [ ] Color is not the only way to convey information

### Text & Typography
- [ ] Minimum font size 16px on mobile (prevent zoom)
- [ ] Line height ≥ 1.5 for body text
- [ ] Paragraph spacing ≥ 1.5x line height
- [ ] Text can be resized to 200% without breaking layout
- [ ] No horizontal scrolling at 320px width

### Focus Indicators
- [ ] All interactive elements have visible focus state
- [ ] Focus indicator has ≥ 3:1 contrast ratio
- [ ] Focus order is logical and predictable
- [ ] Custom focus styles match design system

## Mobile Accessibility

### Touch Targets
- [ ] All interactive elements ≥ 44x44px
- [ ] Adequate spacing between targets (8px minimum)
- [ ] Touch targets don't overlap

### Gestures
- [ ] All functionality available without complex gestures
- [ ] Swipe actions have alternative methods
- [ ] Pinch zoom not disabled (unless in a map/game)

### Orientation
- [ ] Content works in both portrait and landscape
- [ ] No orientation lock (unless essential)

## Dynamic Content

### Loading States
- [ ] Loading indicators have aria-live="polite"
- [ ] Skeleton screens have appropriate aria labels
- [ ] Loading doesn't trap keyboard focus

### Error States
- [ ] Errors announced to screen readers
- [ ] Error messages have role="alert" or aria-live="assertive"
- [ ] Errors link to the problematic field
- [ ] Error summary at top of form

### Success States
- [ ] Success messages announced
- [ ] Use aria-live="polite" for status updates
- [ ] Confirmation dialogs are accessible

## Forms

### Labels & Instructions
- [ ] All inputs have associated labels
- [ ] Labels are visible (not just placeholder)
- [ ] Instructions provided before form
- [ ] Required fields marked with aria-required="true"

### Validation
- [ ] Real-time validation doesn't interfere with typing
- [ ] Errors clearly associated with fields (aria-describedby)
- [ ] Validation messages are specific and helpful
- [ ] Submit button enabled/disabled state is clear

### Input Types
- [ ] Correct input types used (email, tel, number, etc.)
- [ ] Date pickers are keyboard accessible
- [ ] Autocomplete attributes used where appropriate

## Component-Specific Tests

### Navigation
- [ ] Main nav has role="navigation"
- [ ] Current page indicated (aria-current="page")
- [ ] Hamburger menu announced correctly
- [ ] Mobile menu keyboard accessible

### Modals & Dialogs
- [ ] Focus moved to modal on open
- [ ] Focus trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returned to trigger on close
- [ ] Background content inert (aria-hidden="true")

### Tabs
- [ ] Tab list has role="tablist"
- [ ] Tabs have role="tab"
- [ ] Panels have role="tabpanel"
- [ ] Arrow keys navigate between tabs
- [ ] Selected tab has aria-selected="true"

### Tooltips
- [ ] Triggered on hover and focus
- [ ] Dismissible with Escape
- [ ] Content announced to screen readers
- [ ] Don't hide essential information

### Cards & Lists
- [ ] List items have role="listitem"
- [ ] Card headings use proper heading level
- [ ] Action buttons clearly labeled

## ARIA Usage

### Best Practices
- [ ] Use semantic HTML before ARIA
- [ ] ARIA labels are descriptive
- [ ] aria-expanded used for collapsible sections
- [ ] aria-disabled used (not just CSS)
- [ ] aria-hidden used correctly (decorative only)

### Common Patterns
- [ ] Breadcrumbs: `<nav aria-label="Breadcrumb">`
- [ ] Search: `<form role="search">`
- [ ] Status: `<div role="status" aria-live="polite">`
- [ ] Alert: `<div role="alert">`

## Performance & UX

### Page Load
- [ ] No layout shift during load (CLS < 0.1)
- [ ] Loading states prevent accidental clicks
- [ ] Progressive enhancement (core features work without JS)

### Animations
- [ ] Respect prefers-reduced-motion
- [ ] No auto-playing videos/animations
- [ ] Animations can be paused

## Documentation

### Component Documentation
- [ ] Accessibility features documented
- [ ] Keyboard shortcuts listed
- [ ] ARIA patterns explained
- [ ] Known issues noted

## Sign-off

### Final Checks
- [ ] Tested on multiple browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile devices (iOS, Android)
- [ ] Tested with keyboard only
- [ ] Tested with screen reader
- [ ] Lighthouse score reviewed
- [ ] axe violations addressed

**Testing Date:** ___________  
**Tested By:** ___________  
**Issues Found:** ___________  
**Status:** ☐ Pass ☐ Fail ☐ Needs Review
