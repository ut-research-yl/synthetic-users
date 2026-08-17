import React, { useState } from 'react'
import { Button, Dialog, Bar, Title, Label, Input, Select, Option, MessageStrip, Link, BusyIndicator } from '@ui5/webcomponents-react'

type Props = {
  open: boolean
  onClose: () => void
  onSave?: (metric: { id: string; name: string; metricKind: string; source: string; shapeType: string }) => void
}

const METRIC_KINDS = ['NPS', 'CSAT', 'CES', 'Custom']
const SOURCES = ['Qualtrics', 'SAP Surveys', 'Medallia']
const AUTH_REQUIRED = ['Qualtrics', 'Medallia']

const MOCK_SURVEYS: Record<string, string[]> = {
  Qualtrics: ['Test Survey_1', 'Customer Feedback 2024', 'NPS Global Q3'],
  Medallia: ['Voice of Customer', 'Post-Purchase Survey'],
}

const MOCK_QUESTIONS: Record<string, string[]> = {
  Qualtrics: ['Test Recommendation_Q1', 'Overall Satisfaction', 'How likely are you to recommend?'],
  Medallia: ['Net Promoter Score', 'Overall Experience Rating'],
}

const SHAPE_TYPES = [
  { value: 'Sentiment',     label: 'Sentiment',     icon: 'SAP-icons-v4/emotion-positive' },
  { value: 'Value',         label: 'Value',         icon: 'record' },
  { value: 'Indicator',     label: 'Indicator',     icon: 'SAP-icons-v4/data-indicator' },
  { value: 'Traffic Light', label: 'Traffic Light', icon: 'SAP-icons-v4/traffic-light' },
]

const DEFAULT_SHAPE: Record<string, string> = {
  NPS: 'Sentiment', CSAT: 'Sentiment', CES: 'Value', Custom: 'Indicator',
}

export default function AddMetricDialog({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [metricKind, setMetricKind] = useState(METRIC_KINDS[0])
  const [source, setSource] = useState(SOURCES[0])
  const [shapeType, setShapeType] = useState(DEFAULT_SHAPE[METRIC_KINDS[0]])
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [survey, setSurvey] = useState('')
  const [question, setQuestion] = useState('')

  const handleKindChange = (kind: string) => {
    setMetricKind(kind)
    setShapeType(DEFAULT_SHAPE[kind] ?? 'Indicator')
  }

  const handleSourceChange = (s: string) => {
    setSource(s)
    setIsAuthenticated(false)
    setIsAuthenticating(false)
    setSurvey('')
    setQuestion('')
  }

  const handleAuthenticate = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setTimeout(() => {
      setIsAuthenticating(false)
      setIsAuthenticated(true)
      setSurvey(MOCK_SURVEYS[source]?.[0] ?? '')
      setQuestion(MOCK_QUESTIONS[source]?.[0] ?? '')
    }, 2000)
  }

  const reset = () => {
    setTitle('')
    setMetricKind(METRIC_KINDS[0])
    setSource(SOURCES[0])
    setShapeType(DEFAULT_SHAPE[METRIC_KINDS[0]])
    setIsAuthenticating(false)
    setIsAuthenticated(false)
    setSurvey('')
    setQuestion('')
  }

  const doClose = () => { reset(); onClose() }

  const handleSave = () => {
    onSave?.({ id: `metric-${Date.now()}`, name: title.trim(), metricKind, source, shapeType })
    doClose()
  }

  const needsAuth = AUTH_REQUIRED.includes(source)

  return (
    <Dialog
      open={open}
      onClose={doClose}
      header={
        <Bar design="Header">
          <Title slot="startContent" level="H3">Add Metric</Title>
        </Bar>
      }
      footer={
        <Bar design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={!title.trim() || (needsAuth && isAuthenticated && (!survey || !question))} onClick={handleSave}>Add</Button>
          <Button slot="endContent" design="Transparent" onClick={doClose}>Cancel</Button>
        </Bar>
      }
    >
      <BusyIndicator active={isAuthenticating} delay={0} style={{ width: '100%' }}>
      <div style={{ width: 400, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label required showColon>Title</Label>
          <Input
            maxlength={50}
            value={title}
            placeholder="Enter metric title"
            onInput={(e: any) => setTitle(e.target.value)}
            style={{ width: '100%' } as React.CSSProperties}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label required showColon>Type</Label>
          <Select
            style={{ width: '100%' } as React.CSSProperties}
            onChange={(e: any) => handleKindChange(e.detail?.selectedOption?.dataset?.value ?? METRIC_KINDS[0])}
          >
            {METRIC_KINDS.map(k => <Option key={k} data-value={k} selected={metricKind === k}>{k}</Option>)}
          </Select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label required showColon>Source</Label>
          <Select
            style={{ width: '100%' } as React.CSSProperties}
            onChange={(e: any) => handleSourceChange(e.detail?.selectedOption?.dataset?.value ?? SOURCES[0])}
          >
            {SOURCES.map(s => <Option key={s} data-value={s} selected={source === s}>{s}</Option>)}
          </Select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label showColon>Element Type</Label>
          <Select
            style={{ width: '100%' } as React.CSSProperties}
            onChange={(e: any) => setShapeType(e.detail?.selectedOption?.dataset?.value ?? 'Sentiment')}
          >
            {SHAPE_TYPES.map(t => (
              <Option key={t.value} data-value={t.value} icon={t.icon} selected={shapeType === t.value}>
                {t.label}
              </Option>
            ))}
          </Select>
        </div>

        {needsAuth && !isAuthenticated && (
          <MessageStrip design="Negative" hideCloseButton>
            {source} authentication is required. <Link href="#" onClick={handleAuthenticate} style={{ fontWeight: '600' } as React.CSSProperties}>Authenticate {source}</Link>{' '}or select a different source.
          </MessageStrip>
        )}

        {needsAuth && isAuthenticated && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Label required showColon>Survey</Label>
              <Select
                style={{ width: '100%' } as React.CSSProperties}
                onChange={(e: any) => {
                  setSurvey(e.detail?.selectedOption?.dataset?.value ?? '')
                  setQuestion('')
                }}
              >
                {(MOCK_SURVEYS[source] ?? []).map(s => (
                  <Option key={s} data-value={s} selected={survey === s}>{s}</Option>
                ))}
              </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Label required showColon>Question</Label>
              <Select
                style={{ width: '100%' } as React.CSSProperties}
                onChange={(e: any) => setQuestion(e.detail?.selectedOption?.dataset?.value ?? '')}
              >
                <Option data-value="" selected={!question} />
                {(MOCK_QUESTIONS[source] ?? []).map(q => (
                  <Option key={q} data-value={q} selected={question === q}>{q}</Option>
                ))}
              </Select>
            </div>
          </>
        )}
      </div>
      </BusyIndicator>
    </Dialog>
  )
}
