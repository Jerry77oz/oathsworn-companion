import { useEffect, useRef, useState } from 'react'
import { initialData, STORAGE_KEY } from './data'
import type { ArchiveEntry, CampaignData, HouseRule, Player, Rating, SessionEntry } from './types'

type Tab = 'dashboard' | 'party' | 'rules' | 'sessions' | 'archive'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'party', label: 'Party', icon: '♟' },
  { id: 'rules', label: 'House Rules', icon: '⚖' },
  { id: 'sessions', label: 'Session Log', icon: '✎' },
  { id: 'archive', label: 'Archive', icon: '▣' },
]

const characterOptions = [
  'A’Dendri Grove Maiden',
  'A’Dendri Ranger',
  'Avi Harbinger',
  'Cur',
  'Huntress',
  'Penitent',
  'Priest',
  'Scar Tribe Exile',
  'Thracian Blade',
  'Ursus Warbear',
  'Warden',
  'Witch',
]

const phaseOptions = [
  'Campaign setup',
  'Story phase',
  'Encounter setup',
  'Encounter in progress',
  'Post-encounter review',
  'Between chapters',
  'Campaign complete',
]

const chapterOptions = Array.from({ length: 21 }, (_, index) => String(index + 1))

function loadData(): CampaignData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialData
    const parsed = JSON.parse(saved) as CampaignData
    const savedRules = Array.isArray(parsed.houseRules) ? parsed.houseRules : []
    const missingRules = initialData.houseRules.filter((defaultRule) =>
      !savedRules.some((savedRule) => savedRule.text === defaultRule.text),
    )
    return { ...initialData, ...parsed, houseRules: [...savedRules, ...missingRules] }
  } catch {
    return initialData
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [data, setData] = useState<CampaignData>(loadData)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSaved(true)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [data])

  const update = <K extends keyof CampaignData>(key: K, value: CampaignData[K]) => {
    setSaved(false)
    setData((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Campaign sections">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? 'nav-item active' : 'nav-item'}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="event-card">
          <span className="eyebrow">Next gathering</span>
          <strong>Thundercon 2026</strong>
          <span>Oct 19–26 · Private game</span>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">Thundercon 2026</span>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="save-status"><span className={saved ? 'status-dot' : 'status-dot saving'} />{saved ? 'Saved locally' : 'Saving…'}</div>
        </header>

        <div className="content">
          {activeTab === 'dashboard' && <Dashboard data={data} update={update} setTab={setActiveTab} />}
          {activeTab === 'party' && <Party players={data.players} onChange={(players) => update('players', players)} />}
          {activeTab === 'rules' && <HouseRules data={data} update={update} />}
          {activeTab === 'sessions' && <SessionLog sessions={data.sessions} onChange={(sessions) => update('sessions', sessions)} chapter={data.chapter} />}
          {activeTab === 'archive' && <Archive data={data} setData={setData} onChange={(archive) => update('archive', archive)} />}
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Campaign sections">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
            <span aria-hidden="true">{tab.icon}</span><small>{tab.label.replace('House ', '')}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true"><span>V</span></div>
      <div><strong>Oathsworn</strong><span>Campaign Companion</span></div>
    </div>
  )
}

type UpdateFn = <K extends keyof CampaignData>(key: K, value: CampaignData[K]) => void

function Dashboard({ data, update, setTab }: { data: CampaignData; update: UpdateFn; setTab: (tab: Tab) => void }) {
  const assigned = data.players.filter((player) => player.character.trim()).length
  const enabledRules = data.houseRules.filter((rule) => rule.enabled)
  const latest = data.sessions[0]

  return (
    <>
      <section className="hero-panel">
        <div>
          <span className="eyebrow gold">Current campaign</span>
          <h2>Chapter {data.chapter || '—'}</h2>
          <p>{data.phase || 'Set the current phase or session.'}</p>
        </div>
        <div className="hero-fields">
          <label>Current chapter
            <select value={data.chapter} onChange={(event) => update('chapter', event.target.value)}>
              {data.chapter && !chapterOptions.includes(data.chapter) && <option value={data.chapter}>{data.chapter}</option>}
              {chapterOptions.map((chapter) => <option key={chapter} value={chapter}>{chapter}</option>)}
            </select>
          </label>
          <label>Current phase
            <select value={data.phase} onChange={(event) => update('phase', event.target.value)}>
              {data.phase && !phaseOptions.includes(data.phase) && <option value={data.phase}>{data.phase}</option>}
              {phaseOptions.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
            </select>
            <small className="field-hint">Your place in the chapter; session logs are separate.</small>
          </label>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel span-two">
          <PanelTitle eyebrow="Objective" title="Next session goal" />
          <textarea className="goal-input" value={data.nextGoal} onChange={(event) => update('nextGoal', event.target.value)} rows={3} />
        </section>

        <section className="panel party-summary">
          <PanelTitle eyebrow="Five sworn" title="Party readiness" action="Edit party" onAction={() => setTab('party')} />
          <div className="readiness"><strong>{assigned}<span>/5</span></strong><span>characters assigned</span></div>
          <div className="mini-roster">
            {data.players.map((player) => <span className={player.character ? 'ready' : ''} key={player.id} title={player.name}>{player.name[0]}</span>)}
          </div>
        </section>

        <section className="panel span-two">
          <PanelTitle eyebrow="At the table" title="House-rule reminder" action="Review all" onAction={() => setTab('rules')} />
          <ul className="rule-list compact">
            {enabledRules.slice(0, 3).map((rule) => <li key={rule.id}>{rule.text}</li>)}
          </ul>
        </section>

        <section className="panel">
          <PanelTitle eyebrow="Latest record" title={latest ? `Session · ${latest.date}` : 'No sessions yet'} action="Open log" onAction={() => setTab('sessions')} />
          <p className="muted">{latest?.recap || 'Log your first session when the company returns from the Deepwood.'}</p>
        </section>
      </div>
    </>
  )
}

function PanelTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="panel-title">
      <div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div>
      {action && <button className="text-button" onClick={onAction}>{action} →</button>}
    </div>
  )
}

function Party({ players, onChange }: { players: Player[]; onChange: (players: Player[]) => void }) {
  const change = (id: string, field: keyof Player, value: string) => onChange(players.map((player) => player.id === id ? { ...player, [field]: value } : player))

  return (
    <section className="stack">
      <div className="section-intro"><p>Assign the five player-controlled characters and keep any table notes together.</p><span className="count-pill">{players.length} players</span></div>
      <div className="player-grid">
        {players.map((player, index) => (
          <article className="panel player-card" key={player.id}>
            <div className="player-number">0{index + 1}</div>
            <label>Player<input value={player.name} onChange={(event) => change(player.id, 'name', event.target.value)} /></label>
            <label>Assigned character
              <select value={player.character} onChange={(event) => change(player.id, 'character', event.target.value)}>
                <option value="">Not assigned</option>
                {player.character && !characterOptions.includes(player.character) && <option value={player.character}>{player.character}</option>}
                {characterOptions.map((character) => <option key={character} value={character}>{character}</option>)}
              </select>
            </label>
            <label className="player-notes">Notes<textarea rows={3} placeholder="Availability, play style, reminders…" value={player.notes} onChange={(event) => change(player.id, 'notes', event.target.value)} /></label>
          </article>
        ))}
      </div>
    </section>
  )
}

function HouseRules({ data, update }: { data: CampaignData; update: UpdateFn }) {
  const changeRule = (id: string, changes: Partial<HouseRule>) => update('houseRules', data.houseRules.map((rule) => rule.id === id ? { ...rule, ...changes } : rule))
  const addRule = () => update('houseRules', [...data.houseRules, { id: crypto.randomUUID(), text: 'New house rule', enabled: true }])
  const removeRule = (id: string) => update('houseRules', data.houseRules.filter((rule) => rule.id !== id))

  return (
    <div className="rules-layout">
      <section className="panel">
        <PanelTitle eyebrow="Active agreement" title="Five-player rules" />
        <div className="editable-rules">
          {data.houseRules.map((rule, index) => (
            <div className={rule.enabled ? 'rule-row' : 'rule-row disabled'} key={rule.id}>
              <button className={rule.enabled ? 'rule-check checked' : 'rule-check'} onClick={() => changeRule(rule.id, { enabled: !rule.enabled })} aria-label={`${rule.enabled ? 'Disable' : 'Enable'} rule ${index + 1}`}>{rule.enabled ? '✓' : ''}</button>
              <textarea rows={2} value={rule.text} onChange={(event) => changeRule(rule.id, { text: event.target.value })} />
              <button className="icon-button danger" onClick={() => removeRule(rule.id)} aria-label={`Delete rule ${index + 1}`}>×</button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={addRule}>+ Add house rule</button>
      </section>
      <aside className="panel sticky-panel">
        <PanelTitle eyebrow="Difficulty ledger" title="Current approach" />
        <textarea rows={8} value={data.difficultyNotes} onChange={(event) => update('difficultyNotes', event.target.value)} />
        <div className="callout"><strong>After every encounter</strong><span>Record “too easy,” “right,” or “too hard” in the Session Log before adjusting.</span></div>
      </aside>
    </div>
  )
}

const emptySession = (chapter: string): SessionEntry => ({
  id: crypto.randomUUID(), date: today(), chapter, recap: '', bossResult: '', rewards: '', questions: '', nextTime: '', rating: '',
})

function SessionLog({ sessions, onChange, chapter }: { sessions: SessionEntry[]; onChange: (sessions: SessionEntry[]) => void; chapter: string }) {
  const [draft, setDraft] = useState<SessionEntry>(() => emptySession(chapter))
  const [editing, setEditing] = useState<string | null>(null)
  const set = (field: keyof SessionEntry, value: string) => setDraft((current) => ({ ...current, [field]: value }))
  const save = () => {
    if (!draft.date) return
    const next = editing ? sessions.map((session) => session.id === editing ? draft : session) : [draft, ...sessions]
    onChange(next)
    setDraft(emptySession(chapter))
    setEditing(null)
  }
  const edit = (session: SessionEntry) => { setDraft(session); setEditing(session.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = (id: string) => onChange(sessions.filter((session) => session.id !== id))

  return (
    <div className="session-layout">
      <section className="panel session-form">
        <PanelTitle eyebrow={editing ? 'Updating record' : 'New record'} title={editing ? 'Edit session' : 'Log a session'} />
        <div className="form-row"><label>Date<input type="date" value={draft.date} onChange={(event) => set('date', event.target.value)} /></label><label>Chapter<input value={draft.chapter} onChange={(event) => set('chapter', event.target.value)} /></label></div>
        <label>Recap<textarea rows={4} placeholder="What happened at the table? Keep it spoiler-safe." value={draft.recap} onChange={(event) => set('recap', event.target.value)} /></label>
        <div className="form-row"><label>Boss result<input placeholder="Victory, retry, ongoing…" value={draft.bossResult} onChange={(event) => set('bossResult', event.target.value)} /></label><label>Rewards / items<input placeholder="Our earned rewards" value={draft.rewards} onChange={(event) => set('rewards', event.target.value)} /></label></div>
        <label>Rules questions<textarea rows={2} value={draft.questions} onChange={(event) => set('questions', event.target.value)} /></label>
        <label>Next session plan<textarea rows={2} placeholder="Where to resume, prep to do, or who should bring what…" value={draft.nextTime} onChange={(event) => set('nextTime', event.target.value)} /><small className="field-hint">A handoff note for the group—not a rules or story field.</small></label>
        <fieldset><legend>Encounter difficulty</legend><RatingPicker value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} /></fieldset>
        <div className="button-row"><button className="primary-button" onClick={save}>{editing ? 'Update session' : 'Save session'}</button>{editing && <button className="secondary-button" onClick={() => { setDraft(emptySession(chapter)); setEditing(null) }}>Cancel</button>}</div>
      </section>
      <section className="session-history">
        <div className="section-intro"><div><span className="eyebrow">Campaign record</span><h2>Past sessions</h2></div><span className="count-pill">{sessions.length} logged</span></div>
        {sessions.length === 0 ? <EmptyState title="The ledger is empty" text="Your first saved session will appear here." /> : sessions.map((session) => (
          <article className="panel session-card" key={session.id}>
            <div className="session-card-head"><div><span className="eyebrow">{formatDate(session.date)}</span><h3>Chapter {session.chapter || '—'}</h3></div><RatingBadge rating={session.rating} /></div>
            <p>{session.recap || 'No recap added.'}</p>
            <div className="session-meta"><span><small>Result</small>{session.bossResult || '—'}</span><span><small>Next session plan</small>{session.nextTime || '—'}</span></div>
            <div className="button-row"><button className="text-button" onClick={() => edit(session)}>Edit</button><button className="text-button danger-text" onClick={() => remove(session.id)}>Delete</button></div>
          </article>
        ))}
      </section>
    </div>
  )
}

function RatingPicker({ value, onChange }: { value: Rating | ''; onChange: (value: Rating) => void }) {
  const ratings: { id: Rating; label: string }[] = [{ id: 'too-easy', label: 'Too easy' }, { id: 'right', label: 'Right' }, { id: 'too-hard', label: 'Too hard' }]
  return <div className="rating-picker">{ratings.map((rating) => <button type="button" className={value === rating.id ? `selected ${rating.id}` : ''} onClick={() => onChange(rating.id)} key={rating.id}>{rating.label}</button>)}</div>
}

function RatingBadge({ rating }: { rating: Rating | '' }) {
  if (!rating) return null
  return <span className={`rating-badge ${rating}`}>{rating.replace('-', ' ')}</span>
}

function Archive({ data, setData, onChange }: { data: CampaignData; setData: (data: CampaignData) => void; onChange: (archive: ArchiveEntry[]) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const opened = data.archive.filter((entry) => entry.opened).length
  const change = (chapter: number, changes: Partial<ArchiveEntry>) => onChange(data.archive.map((entry) => entry.chapter === chapter ? { ...entry, ...changes } : entry))
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `thundercon-oathsworn-backup-${today()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as CampaignData
      if (!Array.isArray(parsed.players) || !Array.isArray(parsed.houseRules) || !Array.isArray(parsed.archive)) throw new Error('Invalid backup')
      setData({ ...initialData, ...parsed })
    } catch {
      window.alert('That file is not a valid Oathsworn Companion backup.')
    }
    event.target.value = ''
  }

  return (
    <div className="archive-layout">
      <section>
        <div className="section-intro"><div><p>Mark only content your group has opened. Notes stay on this device and should remain spoiler-safe.</p></div><span className="count-pill">{opened} opened</span></div>
        <div className="chapter-grid">
          {data.archive.map((entry) => (
            <article className={entry.opened ? 'chapter-card opened' : 'chapter-card'} key={entry.chapter}>
              <button onClick={() => change(entry.chapter, { opened: !entry.opened })} aria-label={`${entry.opened ? 'Mark unopened' : 'Mark opened'} chapter ${entry.chapter}`}><span>Chapter</span><strong>{String(entry.chapter).padStart(2, '0')}</strong><em>{entry.opened ? 'Opened ✓' : 'Sealed'}</em></button>
              {entry.opened && <textarea rows={2} placeholder="Spoiler-safe note…" value={entry.note} onChange={(event) => change(entry.chapter, { note: event.target.value })} />}
            </article>
          ))}
        </div>
      </section>
      <aside className="panel backup-panel">
        <PanelTitle eyebrow="Local data" title="Backup & restore" />
        <p className="muted">Your campaign exists only in this browser. Export a JSON backup after each game night.</p>
        <button className="primary-button full" onClick={exportData}>Export JSON backup</button>
        <button className="secondary-button full" onClick={() => fileInput.current?.click()}>Import backup</button>
        <input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importData} />
        <div className="privacy-note"><span>◈</span><div><strong>Spoiler-safe by design</strong><small>No story text, hidden content, accounts, or cloud sync.</small></div></div>
      </aside>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span>✦</span><h3>{title}</h3><p>{text}</p></div>
}

function formatDate(value: string) {
  if (!value) return 'Undated'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

export default App
