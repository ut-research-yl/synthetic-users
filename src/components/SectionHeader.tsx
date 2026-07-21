import { Button } from '@ui5/webcomponents-react'
import './SectionHeader.css'

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <span className="section-header__title">{title}</span>
      {onSeeAll && (
        <Button design="Transparent" onClick={onSeeAll}>See all</Button>
      )}
    </div>
  )
}
