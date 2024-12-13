# Problem Description

Create a mobile-friendly chat UI component for React/Next.js that properly handles the iOS keyboard and viewport behavior. The component should maintain proper scrolling, input visibility, and header positioning when the keyboard opens and closes.

**Key challenges this solves:**
iOS keyboard pushing up the viewport and breaking fixed positioning
Maintaining scroll position when keyboard opens/closes
Keeping the input visible above the keyboard
Preserving the header at the top of the screen
Smooth transitions between states

# Acceptance Criteria

The chat UI component must:
Keep the header visible at the top of the screen at all times
Show the input field directly above the keyboard when it opens
Maintain proper scrolling of messages between header and input
Automatically scroll to show most recent messages when keyboard opens
Handle keyboard open/close with smooth transitions
Work correctly on iOS Safari (primary target)
Degrade gracefully on other platforms
Use portals to manage layout independently
** You should be able to open & close the keyboard multiple times **

# Technical Details

Built with React/Next.js and TypeScript
Uses visualViewport API for keyboard detection
Implements portals for independent positioning of header, messages, and input
No external dependencies beyond React
Uses CSS transitions for smooth animations
Handles viewport changes via event listeners
Provides TypeScript interfaces for props
Includes proper cleanup of event listeners
