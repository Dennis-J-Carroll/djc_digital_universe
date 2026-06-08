# Fix Plan for Calculus Flow

## Issues Found

### 1. Velocity Curve Doesn't Match User's Screenshots
- Current: `v(t) = 15 + 0.8(t-3)^2` → v(9)=43.8, integral≈192.6
- Should be: `v(t) = 15 + (t-3)^2` → v(9)=51, integral=207
- This matches the screenshots: points (4,16), (6,24), (8,40), area≈206.99m

### 2. No Touch Event Handling (Critical for Mobile)
- CanvasBoard only handles mouse events
- Mobile users cannot drag the tangent point, area bounds, etc.
- Need: onTouchStart, onTouchMove, onTouchEnd handlers

### 3. Default Function Should Be Velocity Curve
- Currently defaults to linear in Riemann mode
- Should default to velocity curve (matching user's screenshots)

### 4. Canvas Sizing on Mobile
- aspectRatio: 16/9 with minHeight: 280 may cause issues
- Need more robust mobile sizing

### 5. Mobile Layout Improvements
- Better responsive sizing for the canvas container
- Ensure all content is visible on narrow viewports
