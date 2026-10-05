export type Rating = 'too-easy' | 'right' | 'too-hard'

export interface Player {
  id: string
  name: string
  character: string
  notes: string
  backup: string
}

export interface HouseRule {
  id: string
  text: string
  enabled: boolean
}

export interface SessionEntry {
  id: string
  date: string
  chapter: string
  recap: string
  bossResult: string
  rewards: string
  questions: string
  nextTime: string
  rating: Rating | ''
}

export interface ArchiveEntry {
  chapter: number
  opened: boolean
  note: string
}

export interface CampaignData {
  chapter: string
  phase: string
  nextGoal: string
  difficultyNotes: string
  players: Player[]
  houseRules: HouseRule[]
  sessions: SessionEntry[]
  archive: ArchiveEntry[]
}
