import React, { useState } from 'react'
import { Button, Dialog, Bar, Title, Label, Input, Select, Option, MessageStrip, Link, BusyIndicator, IllustratedMessage } from '@ui5/webcomponents-react'

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

const MOCK_DATA: Record<string, { value: string; change: string; changeUp: boolean; color: string }> = {
  NPS:    { value: '45',   change: '+3 vs last month', changeUp: true,  color: '#B8CC00' },
  CSAT:   { value: '78%',  change: '-2% vs last month', changeUp: false, color: '#E9730C' },
  CES:    { value: '2.3',  change: '+0.1 vs last month', changeUp: true, color: '#B8CC00' },
  Custom: { value: '1,248', change: '+124 vs last month', changeUp: true, color: '#0064d9' },
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

function MetricPreviewCard({ title, metricKind, source, survey, question }: {
  title: string; metricKind: string; source: string; survey: string; question: string
}) {
  const data = MOCK_DATA[metricKind] ?? MOCK_DATA.Custom
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
      borderRadius: 12,
      padding: '1.5rem',
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: 600 }}>
          {title}
        </span>
        <span style={{
          fontSize: 10, background: 'var(--sapPageSection_Background, #f5f6f7)',
          color: 'var(--sapContent_LabelColor)', borderRadius: 4, padding: '2px 6px',
        }}>
          {source}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: data.color, lineHeight: 1 }}>
          {data.value}
        </span>
        <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          {metricKind}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: data.changeUp ? '#5C8A00' : '#BB0000', fontSize: 12 }}>
          {data.changeUp ? '▲' : '▼'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--sapContent_LabelColor)' }}>
          {data.change}
        </span>
      </div>

      {(survey || question) && (
        <div style={{
          borderTop: '1px solid var(--sapPageHeader_BorderColor, #e8e8e8)',
          paddingTop: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {survey && (
            <span style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)' }}>
              Survey: {survey}
            </span>
          )}
          {question && (
            <span style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)' }}>
              Q: {question}
            </span>
          )}
        </div>
      )}
    </div>
  )
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
      style={{ '--_ui5_dialog_content_padding': '0' } as React.CSSProperties}
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
      <div style={{ display: 'flex', width: 720 }}>

        {/* Left: form */}
        <div style={{ width: 360, flexShrink: 0, position: 'relative' }}>
          <div style={{ padding: '1.5rem 1.5rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    {(MOCK_QUESTIONS[source] ?? []).map(q => (
                      <Option key={q} data-value={q} selected={question === q}>{q}</Option>
                    ))}
                  </Select>
                </div>
              </>
            )}
          </div>
          {isAuthenticating && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.75)',
              zIndex: 10,
            }}>
              <BusyIndicator active size="L" />
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div style={{ flex: 1, padding: '1.5rem 2rem 1.5rem 0' }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: 8,
            background: 'var(--sapPageSection_Background, #f8f9fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 320,
          }}>
            {(!needsAuth && title.trim()) || (isAuthenticated && (survey && question || title.trim())) ? (
              <MetricPreviewCard
                title={title.trim() || survey}
                metricKind={metricKind}
                source={source}
                survey={survey}
                question={question}
              />
            ) : (
              <div style={{ overflow: 'hidden', width: '100%' }}>
                <IllustratedMessage
                  name="NoEntries"
                  titleText="No preview available"
                  subtitleText={isAuthenticated ? 'Select a survey and question to see a preview' : 'Enter a title to see a preview'}
                  style={{ display: 'block', marginBottom: '-1rem' } as React.CSSProperties}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </Dialog>
  )
}
