# TradeZone Embeddable Widget

An embeddable AI assistant widget for TradeZone that can be easily integrated into any website.

## Features

- Interactive chat interface with AI assistant
- Video avatar with one-time playback
- Toggle button to show/hide the widget
- Voice call capability using ElevenLabs
- Responsive design for mobile and desktop
- Links open in parent window
- Customizable appearance

## Installation

### 1. Add the widget to your HTML

Add the following code to your HTML file where you want the widget to appear:

```html
<iframe 
  src="https://landing.rezult.co/trade/widget.html" 
  style="position:fixed; bottom:20px; right:20px; width:400px; height:600px; border:none; border-radius:24px; z-index:9999;">
</iframe>
```

### 2. Add message listener for link handling and widget state (optional)

```javascript
// Listen for messages from the widget iframe
window.addEventListener('message', function(event) {
    // Check if the message is from our widget
    if (event.data && (event.data.type === 'widgetShown' || event.data.type === 'widgetHidden')) {
        console.log('Widget state changed:', event.data.type);
    }
    
    // Handle link opening
    if (event.data && event.data.type === 'openLink' && event.data.url) {
        window.open(event.data.url, '_blank');
    }
});
```

## Customization

You can customize the widget by modifying the following parameters:

- **Position**: Adjust the `bottom` and `right` values in the iframe style
- **Size**: Modify the `width` and `height` values in the iframe style
- **Border radius**: Change the `border-radius` value for rounded corners

## Widget States

The widget has two states:
1. **Visible**: Shows the full widget with welcome screen or chat interface
2. **Hidden**: Only shows a toggle button in the corner

The state is persisted in localStorage, so users will see the same state when they return to your site.

## Browser Compatibility

The widget is compatible with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Dependencies

- ElevenLabs Convai Widget for voice calls
- Marked.js for Markdown rendering
- N8N Chat API for AI responses

## License

MIT License