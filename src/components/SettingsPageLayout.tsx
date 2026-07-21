import { Children, type ReactNode, type CSSProperties } from 'react'
import s from './SettingsPage.module.css'

interface SettingsPageLayoutProps {
  children: ReactNode
  gap?: CSSProperties['gap']
  flush?: boolean
}

export default function SettingsPageLayout({ children, gap, flush }: SettingsPageLayoutProps) {
  return (
    <div className={flush ? `${s.layout} ${s.layoutFlush}` : s.layout} style={gap ? { gap } : undefined}>
      {children}
    </div>
  )
}

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
            {title && <div className={s.sectionTitle}>{title}</div>}
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

/** @deprecated Use SettingsSection instead */
export function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={s.section} style={style}>
      {children}
    </div>
  )
}

/** @deprecated Use SettingsSection title/subtitle props instead */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className={s.sectionHeader} style={{ alignItems: subtitle ? 'flex-start' : 'center' }}>
      <div className={s.sectionHeaderText}>
        <div className={s.sectionTitle}>{title}</div>
        {subtitle && <div className={s.sectionSubtitle}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}
