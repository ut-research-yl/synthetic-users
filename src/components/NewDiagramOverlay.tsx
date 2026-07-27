import React, { useState } from 'react'
import { Button, Icon, Text } from '@ui5/webcomponents-react'

type Props = {
  onGenerate: (prompt: string) => void
  onDismiss: () => void
}

const EXAMPLES = [
  { label: 'HR Hiring', full: 'HR hiring process with CV screening, interviews, and offer' },
  { label: 'Invoice Approval', full: 'Invoice approval workflow with manager sign-off and payment' },
  { label: 'Customer Onboarding', full: 'Customer onboarding with KYC verification and account setup' },
  { label: 'IT Incident', full: 'IT incident management with escalation and resolution tracking' },
]

export default function NewDiagramOverlay({ onGenerate, onDismiss }: Props) {
  const [prompt, setPrompt] = useState('')

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5, pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, #0064d9 0%, #0032a0 100%)',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 32px rgba(0,50,160,0.35)',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          width: '34rem', maxWidth: '90vw',
          position: 'relative' as const,
          color: '#fff',
        }}>

          {/* Close */}
          <button onClick={onDismiss} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              width: '2rem', height: '2rem',
              background: 'transparent', border: 'none', borderRadius: '0.375rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)', fontSize: '1rem',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="decline" style={{ width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.8)' } as React.CSSProperties} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="ai" style={{ width: '1.5rem', height: '1.5rem', color: 'rgba(255,255,255,0.9)' } as React.CSSProperties} />
              <span style={{ fontSize: 'var(--sapFontHeader4Size)', fontWeight: 700, color: '#fff', fontFamily: 'var(--sapFontFamily)' }}>Start with Text to Process</span>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--sapFontSize)', lineHeight: '1.4' }}>
              Describe your process in plain language — AI will create the BPMN diagram instantly.
            </Text>
          </div>

          {/* Input */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. HR hiring process starting with job posting, CV screening, interviews..."
              rows={4}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) { onGenerate(prompt); setToastMsg('AI process creation coming soon'); setToastOpen(true) } }}
              style={{
                width: '100%', padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1.5px solid rgba(255,255,255,0.25)',
                fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSize)',
                color: '#131e29', background: 'rgba(255,255,255,0.95)',
                resize: 'none', outline: 'none', boxSizing: 'border-box' as const,
                lineHeight: 1.6, transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.8)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
            />
            <span style={{
              position: 'absolute', bottom: '0.625rem', right: '0.75rem',
              fontSize: '0.7rem', color: 'rgba(100,120,140,0.6)',
              fontFamily: 'var(--sapFontFamily)', pointerEvents: 'none',
            }}>⌘↵</span>
          </div>

          {/* Example chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'rgba(255,255,255,0.6)', alignSelf: 'center', marginRight: '0.125rem' }}>Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={() => setPrompt(ex.full)} style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '2rem',
                padding: '0.25rem 0.75rem',
                fontSize: 'var(--sapFontSmallSize)',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                fontFamily: 'var(--sapFontFamily)',
                transition: 'all 0.1s',
                backdropFilter: 'blur(4px)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.5)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <Button
            design="Default"
            icon="ai"
            disabled={!prompt.trim()}
            style={{
              width: '100%', height: '2.875rem',
              background: prompt.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
              color: prompt.trim() ? '#0064d9' : 'rgba(255,255,255,0.5)',
              border: 'none', fontWeight: 700, fontSize: 'var(--sapFontSize)',
              borderRadius: '0.75rem',
              '--_ui5_button_base_background': prompt.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
            } as React.CSSProperties}
            onClick={() => { onGenerate(prompt) }}
          >
            Create Process
          </Button>

          {/* Secondary links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', paddingTop: '0.25rem' }}>
            {[
              { icon: 'attachment', label: 'Upload document' },
              { icon: 'grid', label: 'Browse templates' },
              { icon: 'journey-arrive', label: 'Find similar' },
            ].map(a => (
              <button key={a.label} onClick={() => {}} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: 'var(--sapFontSmallSize)', color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--sapFontFamily)', padding: 0,
                transition: 'color 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
              >
                <Icon name={a.icon} style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(255,255,255,0.6)' } as React.CSSProperties} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
