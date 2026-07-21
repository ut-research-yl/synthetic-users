import React, { useState, forwardRef } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type PCAInputFieldProps = {
  onSend: (message: string) => void;
  dropdownUp?: boolean;
};

export const PCAInputField = forwardRef<HTMLTextAreaElement, PCAInputFieldProps>(
  function PCAInputField({ onSend }, ref) {
    const [inputValue, setInputValue] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleSend = () => {
      if (!inputValue.trim()) return;
      onSend(inputValue.trim());
      setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const hasInput = inputValue.trim().length > 0;
    const isTyping = hasInput || isFocused;

    const getBoxShadow = () => {
      const outer = '0px 0px 2px rgba(120, 88, 255, 0.16), 0px 8px 16px rgba(120, 88, 255, 0.1)';
      if (isTyping) return `inset 0 0 0 2px #5d36ff, ${outer}`;
      if (isHovered) return `inset 0 0 0 1px #5d36ff, ${outer}`;
      return `inset 0 0 0 1px rgba(93, 54, 255, 0.4), ${outer}`;
    };

    return (
      <div className="flex flex-col w-full" style={{ gap: 8, maxWidth: 720 }}>
        <div
          className="flex flex-col w-full relative"
          style={{
            border: '2px solid transparent',
            borderRadius: 30,
            padding: '12px',
            boxShadow: getBoxShadow(),
            backgroundColor: 'white',
            gap: 12,
            transition: 'border 0.15s',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <textarea
            ref={ref}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask a question or create anything"
            rows={1}
            className="w-full resize-none outline-none bg-transparent"
            style={{
              fontFamily: "'72', sans-serif",
              fontSize: 14,
              color: hasInput ? '#131e29' : '#556b82',
              lineHeight: '21px',
              minHeight: 21,
              maxHeight: 160,
              overflow: 'hidden',
              fontStyle: hasInput ? 'normal' : 'italic',
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
          />

          <div className="flex items-center justify-end" style={{ height: 28 }}>

            <button
              onClick={handleSend}
              disabled={!hasInput}
              className={cn(
                'flex items-center justify-center rounded-full transition-all',
                hasInput
                  ? 'opacity-100 hover:opacity-80 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              )}
              style={{ width: 28, height: 28, backgroundColor: '#5d36ff', flexShrink: 0 }}
            >
              <Send size={13} color="white" />
            </button>
          </div>
        </div>

        <p
          className="text-center"
          style={{
            fontFamily: "'72', sans-serif",
            fontSize: 12,
            color: '#556b82',
            lineHeight: '18px',
          }}
        >
          AI-generated content - verify findings. Do not share personal data.
        </p>
      </div>
    );
  }
);
