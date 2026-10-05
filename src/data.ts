import type { CampaignData } from './types'

export const STORAGE_KEY = 'thundercon-2026-oathsworn-v1'

const names = ['Jerry', 'Javier', 'Gabo', 'Rene', 'Carlos']

export const initialData: CampaignData = {
  chapter: '1',
  phase: 'Campaign setup',
  nextGoal: 'Assign characters and agree on the opening difficulty.',
  difficultyNotes: 'Begin one step above Normal. Reassess after every encounter before changing enemy damage.',
  players: names.map((name) => ({
    id: crypto.randomUUID(),
    name,
    character: '',
    notes: '',
    backup: '',
  })),
  houseRules: [
    { id: crypto.randomUUID(), text: 'Start one difficulty above Normal.', enabled: true },
    { id: crypto.randomUUID(), text: 'When the normal reward is 4 common items, reward 5 common items.', enabled: true },
    { id: crypto.randomUUID(), text: 'Do not reduce Animus.', enabled: true },
    { id: crypto.randomUUID(), text: 'Do not add extra enemy damage unless play proves too easy.', enabled: true },
    { id: crypto.randomUUID(), text: 'Reassess difficulty after each encounter.', enabled: true },
  ],
  sessions: [],
  archive: Array.from({ length: 21 }, (_, index) => ({
    chapter: index + 1,
    opened: false,
    note: '',
  })),
}
