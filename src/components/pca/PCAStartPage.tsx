import { useRef, useEffect } from 'react';
import { usePCA } from '@/contexts/PCAContext';
import { PCAInputField } from './PCAInputField';

// AI sparkle icon as SVG (matches Figma design closely)
function AiSparkleIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 8C32 8 30 24 24 30C18 36 8 38 8 38C8 38 18 40 24 46C30 52 32 60 32 60C32 60 34 52 40 46C46 40 56 38 56 38C56 38 46 36 40 30C34 24 32 8 32 8Z"
        fill="#5d36ff"
      />
      <path
        d="M50 4C50 4 49 12 46 15C43 18 38 19 38 19C38 19 43 20 46 23C49 26 50 32 50 32C50 32 51 26 54 23C57 20 62 19 62 19C62 19 57 18 54 15C51 12 50 4 50 4Z"
        fill="#5d36ff"
      />
    </svg>
  );
}

export function PCAStartPage() {
  const { sendMessage } = usePCA();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full items-center justify-center overflow-auto relative"
      style={{ backgroundColor: 'white' }}
    >
      <div
        className="flex flex-col items-center"
        style={{ gap: 48, width: '100%', maxWidth: 960, padding: '0 24px 32px' }}
      >
        {/* AI Icon */}
        <AiSparkleIcon size={64} />

        {/* Title */}
        <h1
          className="text-center leading-tight"
          style={{
            fontSize: 32,
            fontFamily: "'72', sans-serif",
            fontWeight: 700,
            color: '#1d2d3e',
            margin: 0,
          }}
        >
          Process Consulting Agent
        </h1>

        {/* Input area */}
        <PCAInputField ref={textareaRef} onSend={sendMessage} />
      </div>
    </div>
  );
}
