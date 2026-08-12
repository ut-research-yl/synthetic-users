import React from 'react'
import { Button } from '@ui5/webcomponents-react'
import './SectionHeader.css'

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
  action?: React.ReactNode
}

export function SectionHeader({ title, onSeeAll, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <span className="section-header__title">{title}</span>
      {action}
      {onSeeAll && (
        <Button design="Transparent" onClick={onSeeAll}>See all</Button>
      )}
    </div>
  )
}
