'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function useDetectKeyboardOpen(minKeyboardHeight = 300, defaultValue = false) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(defaultValue);

  useEffect(() => {
    const listener = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const newState = window.screen.height - minKeyboardHeight > window.visualViewport.height;
        if (isKeyboardOpen !== newState) {
          setIsKeyboardOpen(newState);
        }
      }
    };

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', listener);
    }

    return () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', listener);
      }
    };
  }, [isKeyboardOpen, minKeyboardHeight]);

  return isKeyboardOpen;
}

function ChatMessage({ message }: { message: string }) {
  return (
    <div style={{ padding: '10px', margin: '5px 0', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
      {message}
    </div>
  );
}

function HeaderPortal() {
  return createPortal(
    <div
      style={{
        backgroundColor: '#f0f0f0',
        padding: '5px',
        textAlign: 'center',
        height: '40px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1000,
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.2em' }}>Chat Header</h1>
    </div>,
    document.body
  );
}

// First, let's define a constant for our transition
const TRANSITION = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

function MessagesPortal({
  messages,
  messagesRef,
  visualViewportHeight,
  isKeyboardOpen
}: {
  messages: string[],
  messagesRef: React.RefObject<HTMLDivElement>,
  visualViewportHeight: number,
  isKeyboardOpen: boolean
}) {
  return createPortal(
    <div
      ref={messagesRef}
      style={{
        position: 'fixed',
        top: '40px',
        left: 0,
        right: 0,
        bottom: '60px',
        overflowY: 'auto',
        padding: '10px',
        WebkitOverflowScrolling: 'touch',
        height: isKeyboardOpen ? `${visualViewportHeight - 100}px` : '100vh',
        maxHeight: isKeyboardOpen ? `${visualViewportHeight - 100}px` : 'calc(100vh - 100px)',
        backgroundColor: 'white',
        transition: TRANSITION,
      }}
    >
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
    </div>,
    document.body
  );
}

function InputPortal({
  isKeyboardOpen,
  screenHeight,
  visualViewportHeight,
  onFocus
}: {
  isKeyboardOpen: boolean,
  screenHeight: number,
  visualViewportHeight: number,
  onFocus: () => void
}) {
  return createPortal(
    <div style={{
      padding: '10px',
      borderTop: '1px solid #ccc',
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      transform: isKeyboardOpen ? `translateY(-${Math.min((screenHeight - visualViewportHeight) * 0.6, 250)}px)` : 'none',
      transition: TRANSITION,
      zIndex: 1000,
    }}>
      <input
        type="text"
        placeholder="Type a message..."
        style={{
          width: '100%',
          padding: '8px',
          boxSizing: 'border-box',
          fontSize: '16px',
        }}
        onFocus={onFocus}
      />
    </div>,
    document.body
  );
}

export default function TestPage() {
  const [visualViewportHeight, setVisualViewportHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const isKeyboardOpen = useDetectKeyboardOpen(300, false);

  // Initialize viewport values after mount
  useEffect(() => {
    setIsMounted(true);
    const newVisualHeight = window?.visualViewport?.height ?? window?.innerHeight ?? 0;
    const newScreenHeight = window?.screen?.height ?? 0;
    setVisualViewportHeight(newVisualHeight);
    setScreenHeight(newScreenHeight);
  }, []);

  // Debug logging function
  const logState = (event: string) => {
    if (!isMounted) return;

    console.log(`[${event}]`, {
      keyboard: {
        isOpen: isKeyboardOpen,
        height: screenHeight - visualViewportHeight
      },
      viewport: {
        visualHeight: visualViewportHeight,
        screenHeight: screenHeight,
        offsetTop: window.visualViewport?.offsetTop
      },
      messages: {
        scrollTop: messagesRef.current?.scrollTop,
        scrollHeight: messagesRef.current?.scrollHeight,
        clientHeight: messagesRef.current?.clientHeight,
        calculatedScrollTop: messagesRef.current ? messagesRef.current.scrollHeight - messagesRef.current.clientHeight : 0
      },
      window: {
        scrollY: window.scrollY
      }
    });
  };

  // Handle viewport changes
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      const newVisualHeight = window.visualViewport?.height ?? window.innerHeight;
      const newScreenHeight = window.screen.height;

      setVisualViewportHeight(newVisualHeight);
      setScreenHeight(newScreenHeight);

      logState('Viewport Resize');
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Initial size
    handleResize();
    logState('Initial Mount');

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isMounted]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesRef.current) {
      const scrollTarget = messagesRef.current.scrollHeight - messagesRef.current.clientHeight;
      messagesRef.current.scrollTop = scrollTarget;
      logState('After Scroll To Bottom');
    }
  };

  // Handle keyboard state changes
  useEffect(() => {
    logState('Before Keyboard State Change');
    if (isKeyboardOpen) {
      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        scrollToBottom();
      });
    }
  }, [isKeyboardOpen]);

  const messages = Array.from({ length: 20 }, (_, i) => `Message ${i + 1}`);

  const handleInputFocus = () => {
    logState('Input Focus');
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      scrollToBottom();
    });
  };

  if (!isMounted) {
    return null; // Don't render anything until we're mounted
  }

  return (
    <>
      <HeaderPortal />
      <MessagesPortal
        messages={messages}
        messagesRef={messagesRef}
        visualViewportHeight={visualViewportHeight}
        isKeyboardOpen={isKeyboardOpen}
      />
      <InputPortal
        isKeyboardOpen={isKeyboardOpen}
        screenHeight={screenHeight}
        visualViewportHeight={visualViewportHeight}
        onFocus={handleInputFocus}
      />
    </>
  );
}
