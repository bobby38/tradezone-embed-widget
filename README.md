# TradeZone Embed Widget

A lightweight, embeddable AI assistant widget for TradeZone.sg with chat functionality and ElevenLabs voice integration.

## Features

- 🤖 AI-powered chat assistant for product inquiries
- 🎙️ Voice chat integration with ElevenLabs
- 📱 Responsive design that works on desktop and mobile
- 🔗 Smart link parsing and image sizing (150px max)
- 💬 Markdown support for rich text responses
- 🎯 Easy iframe embedding

## Files

- `widget.html` - Main widget interface with chat UI
- `widget-script.js` - Core functionality and chat logic
- `trade.html` - Demo/example integration page
- `widget-style.css` - Widget styling (hosted separately)

## Installation

### Option 1: Direct Embed (Recommended)

Add this iframe to your website:

```html
<iframe 
  src="https://landing.rezult.co/trade/widget.html" 
  width="400" 
  height="600" 
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
</iframe>
```

### Option 2: Self-Hosted

1. Download `widget.html` and `widget-script.js`
2. Host them on your server
3. Update the CSS link in `widget.html` to point to your hosted `widget-style.css`
4. Update webhook URLs in `widget-script.js` if needed

## Configuration

### Webhook URL
Update the webhook URL in `widget-script.js`:
```javascript
webhookUrl: 'https://n8.getrezult.com/webhook/cf424bcc-ac90-4fd8-80b9-7292f8d61a6d/chat'
```

### ElevenLabs Integration
Update the agent ID in `widget.html`:
```html
<elevenlabs-convai agent-id="your-agent-id"></elevenlabs-convai>
```

## Usage

The widget automatically:
- Loads with a welcome message
- Handles user chat input
- Processes markdown responses with proper link and image formatting
- Integrates voice chat when requested
- Opens product links in the parent window (breaks out of iframe)

## Demo

See `trade.html` for a complete integration example.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - Feel free to use and modify for your projects.