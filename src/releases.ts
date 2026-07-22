export type Release = 'Vision' | 'MVP'

export const RELEASES: { id: Release; label: string; description: string }[] = [
  { id: 'Vision', label: 'Vision', description: 'Full product vision' },
  { id: 'MVP', label: 'MVP', description: 'Minimum viable product scope' },
]

const RELEASE_ORDER: Release[] = ['MVP', 'Vision']

export function isReleaseAvailable(featureRelease: Release, currentRelease: Release): boolean {
  return RELEASE_ORDER.indexOf(featureRelease) <= RELEASE_ORDER.indexOf(currentRelease)
}

export const DEFAULT_RELEASE: Release = 'Vision'
