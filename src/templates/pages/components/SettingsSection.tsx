import { Children, type ReactNode } from 'react'
import { Title } from '@ui5/webcomponents-react'
import s from './SettingsPage.module.css'

interface SettingsSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
}

export function SettingsSection({ title, subtitle, children, action }: SettingsSectionProps) {
  const childArray = Children.toArray(children).filter(Boolean)
  return (
    <div className={s.section}>
      {(title || action) && (
        <div className={s.sectionHeader}>
          <div className={s.sectionHeaderText}>
            {title && <Title level="H3" size="H5" className={s.sectionTitle}>{title}</Title>}
            {subtitle && <div className={s.sectionSubtitle}>{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {childArray.map((child, i) => (
        <div key={i} className={s.sectionChild}>
          {child}
        </div>
      ))}
    </div>
  )
}

export function SettingsSectionRow({ children }: { children: ReactNode }) {
  return <div className={s.row}>{children}</div>
}
