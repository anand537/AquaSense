# AquaSense Frontend - Getting Started Guide

## Quick Start

### 1. Open the Application
Simply open `index.html` in a modern web browser to view the main landing page.

```bash
# Option A: Double-click index.html
# Option B: Use a local server (recommended)
python -m http.server 8000
# Then visit: http://localhost:8000/frontend/
```

### 2. Navigate the Application

#### Main Landing Page (index.html)
- **Hero Section**: Introduces AquaSense with the tagline "Understand the Future of Water"
- **River Valley Section**: Interactive house models representing ML models
  - Click on a house to view its dashboard
  - Hover to see model information
- **Transition Section**: Visual representation of data flowing to the ocean
- **Ocean & Analytics**: Real-time analytics overview
- **Call-to-Action**: Final engagement section

#### Model Dashboards
- **Model 1 Dashboard** (`/models/model_1/dashboard.html`): Water Safety Classifier
- **Model 2 Dashboard** (`/models/model_2/dashboard.html`): Water Quality Scorer

### 3. Interactive Features

#### Scroll Navigation
- **Mouse Scroll**: Smooth scroll-snap sections
- **Arrow Keys**: Press ↓ to go to next section, ↑ for previous
- **Touch Swipe**: Swipe up/down on mobile devices

#### House Models
- Click on any house to open the corresponding model dashboard
- Hover effects show model information
- Keyboard: Tab to focus, Enter/Space to activate

#### Analytics Cards
- Hover over cards to see expanded information
- Each card represents a different water quality metric

#### Dashboard Interactions
- **Tab Navigation**: Switch between Overview, Metrics, Predictions, and Settings
- **Prediction Form**: Submit water quality parameters to get predictions
- **Settings**: Adjust model configuration and thresholds

## File Organization

```
frontend/
├── index.html                           # Main landing page
├── README.md                            # Full documentation
├── styles/
│   ├── main.css                         # Landing page styles
│   ├── animations.css                   # Animation library
│   └── dashboard.css                    # Dashboard styles
├── scripts/
│   ├── main.js                          # Landing page interactivity
│   └── dashboard.js                     # Dashboard functionality
└── models/
    ├── model_1/
    │   └── dashboard.html               # Model 1 dashboard
    └── model_2/
        └── dashboard.html               # Model 2 dashboard
```

## Feature Highlights

### Visual Design
✨ **Stunning SVG Graphics**
- Detailed mountain landscape with atmospheric clouds
- Interactive river flowing through the layout
- Detailed house models representing ML models
- Ocean waves with smooth transitions

🎨 **Color Palette**
- Dark theme optimized for extended viewing
- Blue water-based color scheme
- Smooth gradients throughout

🚀 **Smooth Animations**
- CSS scroll-snap for section navigation
- Fade-in animations on element entry
- Hover effects on interactive elements
- Floating and glow animations

### Interactivity
🖱️ **Mouse Events**
- Hover effects on all interactive elements
- Click detection for model selection
- Smooth transitions on all interactions

⌨️ **Keyboard Support**
- Tab navigation through all elements
- Arrow keys for section navigation
- Enter/Space to activate buttons
- Focus indicators on all interactive elements

📱 **Mobile Responsive**
- Touch swipe gestures for section navigation
- Optimized layouts for all screen sizes
- Large touch targets for easy interaction

### Performance
⚡ **Optimized for Speed**
- Hardware-accelerated CSS transforms
- Lazy-loaded SVG graphics
- Throttled scroll events
- Minimal JavaScript overhead

♿ **Accessible**
- Full keyboard navigation
- Screen reader support with ARIA labels
- High contrast color scheme
- Respects prefers-reduced-motion setting

## Browser Compatibility

### Fully Supported
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Partial Support (Fallbacks Applied)
- Internet Explorer 11 (basic functionality only)
- Older mobile browsers (graceful degradation)

### Required Features
- CSS Grid and Flexbox
- CSS Transforms and Animations
- SVG Support
- ES6 JavaScript
- Local Storage (for settings)

## Customization Guide

### Changing Colors

**File**: `frontend/styles/main.css`

```css
/* Find and modify the hex color values */
.hero-title {
    background: linear-gradient(135deg, #4db8ff, #6eccff); /* Change these */
}
```

### Modifying SVG Graphics

**File**: `frontend/index.html`

Locate the SVG sections and modify:
- `fill` attributes for colors
- `stroke-width` for line thickness
- Coordinate values for shape positions

Example:
```xml
<rect x="50" y="90" width="200" height="180" fill="url(#houseGrad1)" />
<!-- Change fill, width, height, x, y -->
```

### Adjusting Animation Timing

**File**: `frontend/styles/animations.css`

```css
@keyframes fadeInUp {
    /* Adjust duration here */
    animation: fadeInUp 0.8s ease-out forwards;
}
```

### Adding New Sections

1. **Add HTML section** in `index.html`:
```html
<section class="new-section" id="new-section">
    <!-- Your content -->
</section>
```

2. **Add CSS** in `main.css`:
```css
.new-section {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    min-height: 100vh;
    /* Your styles */
}
```

3. **Add interactivity** in `scripts/main.js` if needed

### Connecting to Backend APIs

**File**: `frontend/scripts/main.js`

Modify the `navigateToModel()` function:

```javascript
function navigateToModel(modelId) {
    // Replace with actual API call
    fetch(`/api/models/${modelId}`)
        .then(response => response.json())
        .then(data => {
            // Handle model data
            window.location.href = `/models/${modelId}/dashboard.html`;
        });
}
```

## Troubleshooting

### Issue: Sections not snapping smoothly
**Solution**: Check browser scroll-snap support
- Open DevTools (F12)
- Check Console for polyfill messages
- Try a different browser

### Issue: SVG graphics not rendering
**Solution**: Verify SVG namespace and attributes
```xml
<svg class="my-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
    <!-- Ensure viewBox and preserveAspectRatio are present -->
</svg>
```

### Issue: Animations not smooth
**Solution**: Enable GPU acceleration
1. Open DevTools → Performance tab
2. Check for layout thrashing
3. Verify transforms are used instead of positional changes

### Issue: Mobile touch gestures not working
**Solution**: Check touch event listeners
- Ensure touch events are properly registered
- Test on actual device, not just browser emulation

### Issue: Colors not matching design
**Solution**: Check color mode and display settings
- Verify CSS media queries for dark mode
- Check browser color management settings

## Performance Tips

### Optimize Further
1. **Minify CSS/JS**: Use build tools like Webpack
2. **Compress SVGs**: Use SVGO to reduce SVG file size
3. **Lazy Load**: Implement intersection observer for below-fold content
4. **Cache**: Use service workers for offline support

### Monitor Performance
1. Use Chrome DevTools → Lighthouse
2. Check Core Web Vitals scores
3. Profile animations with Performance tab

## Accessibility Checklist

- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ ARIA labels present
- ✅ Color contrast sufficient
- ✅ Respects prefers-reduced-motion
- ✅ Screen reader compatible
- ✅ Form labels associated
- ✅ Error messages clear

## Development Workflow

### Using Live Server (VS Code)
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Auto-reload on save

### Using Python
```bash
cd frontend/
python -m http.server 8000
# Visit http://localhost:8000
```

### Using Node.js
```bash
npx http-server -p 8000
# Visit http://localhost:8000
```

## Common Tasks

### Change Hero Title Text
**File**: `index.html`
```html
<h1 class="hero-title">Your New Title</h1>
```

### Add New Model
1. Create `frontend/models/model_X/dashboard.html`
2. Add house button in `index.html`
3. Update `main.js` navigation

### Modify Analytics Cards
**File**: `index.html`
```html
<div class="analytics-card">
    <h3>Your Title</h3>
    <p>Your description</p>
</div>
```

### Update Colors Throughout
1. Find all hex colors in `main.css` and `dashboard.css`
2. Use Find & Replace (Ctrl+H)
3. Test across all pages

## SEO Optimization

### Update Meta Tags
**File**: `index.html`
```html
<meta name="description" content="Your description">
<meta name="keywords" content="water, quality, AI, ML">
<meta property="og:title" content="AquaSense">
<meta property="og:description" content="Your description">
```

### Add Structured Data
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AquaSense"
}
</script>
```

## Deployment

### Deploy to Static Hosting
1. **GitHub Pages**:
   - Push to GitHub
   - Enable Pages in repository settings

2. **Netlify**:
   - Connect GitHub repository
   - Automatic deployment on push

3. **Vercel**:
   - Connect project
   - Deploy with one click

4. **AWS S3**:
   - Upload files to S3
   - Configure as static website

## Support & Resources

- **Full Documentation**: See `README.md`
- **Styling Details**: See `styles/main.css` comments
- **JavaScript API**: See `scripts/main.js` exports
- **Dashboard Features**: See `scripts/dashboard.js`

## Version History

- **v1.0.0** (May 2026): Initial release
  - Main landing page with scroll-snap
  - Model dashboards with prediction forms
  - Full accessibility support
  - Mobile responsive design

## Contact & Contribution

For issues, feature requests, or improvements:
1. Check existing documentation
2. Review code comments
3. Test on multiple browsers
4. Submit detailed reports with screenshots

---

**Happy Exploring! 🌊**  
*Understand the Future of Water with AquaSense*
