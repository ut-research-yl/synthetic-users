import { Icon, Button } from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { DomainObjects } from '../data/DataBase'
import '../widgets/widgets.css'

const STATUS_CHIP: Record<'draft' | 'modified', { label: string; leadingIcon: string; design: string }> = {
  draft:    { label: 'Draft',    leadingIcon: 'write-new',          design: 'indication10' },
  modified: { label: 'Modified', leadingIcon: 'SAP-icons-v4/edit',  design: 'indication8'  },
}

interface PreviewCardProps {
  title: string
  modelSrc?: string
  object?: DomainObjects
  status?: 'none' | 'draft' | 'modified'
  type?: string
  lastAccessed?: string
  showFavorite?: boolean
  isFavorite?: boolean
  gridSpan?: number
  onClick?: () => void
}

export function PreviewCard({ title, modelSrc, object = 'Process Model', status, type, lastAccessed, showFavorite, isFavorite, onClick }: PreviewCardProps) {
  const chip = status && status !== 'none' ? STATUS_CHIP[status as 'draft' | 'modified'] : undefined
  return (
    <div className={`widget-card${onClick ? ' widget-card--clickable' : ''}`} style={{ minHeight: 0 }} onClick={onClick}>
      <div className="widget-card__header">
        <SigDomainObject object={object} size="XS" />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="preview-card__title">{title}</span>
            {isFavorite && <Icon name="favorite" className="preview-card__icon" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {type && (
              <span className="preview-card__subheader">
                {type}{lastAccessed ? ` · ${lastAccessed}` : ''}
              </span>
            )}
            {chip && (
              <SigChipV2
                value={chip.label}
                leadingIcon={chip.leadingIcon}
                design={chip.design as any}
                condensed
              />
            )}
          </div>
        </div>
        {showFavorite && (
          <Button icon="favorite" design="Transparent" disabled />
        )}
      </div>
      {modelSrc && (
        <div className="preview-card__model">
          <img src={modelSrc} alt={title} />
        </div>
      )}
    </div>
  )
}
