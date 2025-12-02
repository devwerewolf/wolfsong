# Demo Guide

## 🚀 Running the Demo

The dev server is now running at **http://localhost:5173**

Open it in your browser to see the full demo in action!

## 🎯 What You'll Experience

### Parent Application
A clean, modern interface with:
- **Counter controls**: Increment/decrement buttons
- **Color picker**: Quick color presets
- **Message input**: Real-time text synchronization
- **Active toggle**: Boolean state demonstration

### Three Synchronized Iframes

#### Iframe 1: Counter Focus (Purple Gradient)
- Large counter display
- Increment/decrement/reset buttons
- Changes sync instantly with parent and other iframes

#### Iframe 2: Color Picker (Dynamic Background)
- Circular color preview
- HTML color picker input
- 5 preset color buttons
- Background changes based on selected color

#### Iframe 3: Message Board (Pink Gradient)
- Message display area
- Text input with debouncing
- Quick message buttons
- Status indicator (active/inactive)

## 🧪 Try These Interactions

1. **Counter Sync Test**
   - Click +1 in parent → Watch Iframe 1 update
   - Click increment in Iframe 1 → Watch parent update
   - All three locations stay in sync!

2. **Color Sync Test**
   - Click "Green" in parent → Watch Iframe 2 background change
   - Use color picker in Iframe 2 → Watch parent border color change
   - Notice the smooth transitions

3. **Message Sync Test**
   - Type in parent input → Watch Iframe 3 display update
   - Click quick message in Iframe 3 → Watch parent input update
   - Debouncing prevents excessive updates

4. **Boolean State Test**
   - Toggle "Active State" checkbox in parent
   - Watch status indicator in Iframe 3 change color
   - Green dot = active, gray dot = inactive

## 🔍 Developer Tools

Open your browser's DevTools console to see:
- `[IframeStateSync Parent]` logs from the parent
- `[IframeStateSync Child]` logs from each iframe
- Message passing events
- State synchronization timestamps

## 🎨 Visual Features

- **Responsive Design**: Works on different screen sizes
- **Smooth Animations**: Color transitions, button hover effects
- **Modern UI**: Clean cards, rounded corners, shadows
- **Color Coding**: Each iframe has a unique theme

## 📊 Performance Notes

- State updates are batched via XState
- Text input is debounced (300ms)
- Minimal re-renders thanks to Svelte 5
- Efficient postMessage communication

## 🐛 Debugging Tips

If something doesn't work:

1. **Check Console**: Look for error messages
2. **Verify Iframes Loaded**: All three should show content
3. **Test Individual Updates**: Try each control separately
4. **Refresh Page**: Sometimes helps with initial sync

## 🎓 Learning Points

### Svelte 5 Features Used
- `$state` rune for reactive state
- `use:` directive for actions
- Direct event handlers (`onclick`, `oninput`)
- Scoped styles with dynamic values

### State Management
- XState stores for complex state
- Subscription-based updates
- Bidirectional data flow
- Type-safe state operations

### Iframe Communication
- PostMessage API for cross-origin messaging
- Structured message types
- Automatic sync on iframe load
- Cleanup on unmount

## 🚀 Next Steps

Want to extend the demo? Try:

1. **Add a new state atom**: e.g., `fontSize` or `theme`
2. **Create a 4th iframe**: Focus on a different aspect
3. **Add persistence**: Save state to localStorage
4. **Implement undo/redo**: Leverage XState's capabilities
5. **Add animations**: Use Svelte transitions
6. **Create a state debugger**: Visual state inspector

## 📝 Code Quality

- ✅ No TypeScript errors
- ✅ No accessibility issues
- ✅ Clean, readable code
- ✅ Proper cleanup on unmount
- ✅ Type-safe throughout

Enjoy exploring the demo! 🎉
