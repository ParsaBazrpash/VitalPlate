'use client';

import React, { useState, useEffect, ReactNode, ReactElement,JSX } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
}

interface AnimatedMessageProps {
  message: string | JSX.Element;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">▋</span>}
    </span>
  );
};

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ message }) => {
  const animateChildren = (element: ReactNode): ReactNode => {
    // Handle string nodes
    if (typeof element === 'string') {
      return <TypewriterText text={element} />;
    }

    // Handle array of nodes
    if (Array.isArray(element)) {
      return element.map((child, index) => (
        <React.Fragment key={index}>{animateChildren(child)}</React.Fragment>
      ));
    }

    // Handle React elements
    if (React.isValidElement(element)) {
      const typedElement = element as ReactElement<{ children?: ReactNode }>;
      
      // If the element has no children, return it as is
      if (!typedElement.props.children) {
        return typedElement;
      }

      // Clone the element with animated children
      return React.cloneElement(
        typedElement,
        {},
        animateChildren(typedElement.props.children)
      );
    }

    // Return anything else as is
    return element;
  };

  if (typeof message === 'string') {
    return <TypewriterText text={message} />;
  }

  return <>{animateChildren(message)}</>;
};

export default AnimatedMessage;
