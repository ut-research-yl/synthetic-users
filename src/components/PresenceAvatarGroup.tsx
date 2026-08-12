import React, { useState } from 'react'
import { Avatar, Popover, List, ListItemStandard } from '@ui5/webcomponents-react'
import type { Collaborator } from './CollaborativeCursors'

// Fiori Avatar color mapping (1-10) matching Figma spec
// color prop on Avatar corresponds to sapAvatar_X_Background tokens
const AVATAR_COLORS: Record<number, string> = {
  1: 'Accent1',
  2: 'Accent2',
  3: 'Accent3',
  4: 'Accent4',
  5: 'Accent5',
  6: 'Accent6',
  7: 'Accent7',
  8: 'Accent8',
  9: 'Accent9',
  10: 'Accent10',
}

export type PresenceUser = Collaborator & {
  initials: string
  colorIndex: number  // 1-10 Fiori accent
  isActive: boolean
}

type Props = {
  users: PresenceUser[]
  visible: boolean
}

export function PresenceAvatarGroup({ users, visible }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  if (!visible || users.length === 0) return null

  const MAX_SHOWN = 3
  const shown = users.slice(0, MAX_SHOWN)
  const overflow = users.length - MAX_SHOWN

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        {/* Stacked avatars with negative margin for overlap */}
        {shown.map((u, i) => (
          <div
            key={u.id}
            style={{
              marginLeft: i === 0 ? 0 : '-6px',
              zIndex: shown.length - i,
              position: 'relative',
            }}
          >
            <Avatar
              initials={u.initials}
              size="XS"
              colorScheme={AVATAR_COLORS[u.colorIndex] as any}
              style={{
                border: '2px solid var(--sapBaseColor, #fff)',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          </div>
        ))}
        {overflow > 0 && (
          <div
            id="presence-overflow-btn"
            style={{
              marginLeft: '-6px',
              zIndex: 0,
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: 'var(--sapNeutralBackground, #ededed)',
              border: '2px solid var(--sapBaseColor, #fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '600',
              color: 'var(--sapTextColor)',
              fontFamily: "var(--sapFontFamily,'72',sans-serif)",
              cursor: 'pointer',
            }}
            onClick={() => setPopoverOpen(v => !v)}
          >
            +{overflow}
          </div>
        )}
      </div>

      <Popover
        opener="presence-overflow-btn"
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        placementType="Bottom"
        horizontalAlign="Right"
        hideArrow
        className="no-padding-popover"
        style={{ minWidth: '220px' }}
      >
        <List separators="Inner">
          {users.map(u => (
            <ListItemStandard
              key={u.id}
              image={
                <Avatar
                  initials={u.initials}
                  size="S"
                  colorScheme={AVATAR_COLORS[u.colorIndex] as any}
                  slot="image"
                />
              }
            >
              {u.name}
            </ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}
