import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import ProjectDetail from './ProjectDetail'

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  page:      { minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#111827' },
  topbar:    { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  content:   { maxWidth: 1100, margin: '0 auto', padding: '20px 24px' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 },
  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', transition: 'border-color .15s', userSelect: 'none' },
  btn:       { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: 'transparent', color: '#111827', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  btnPrimary:{ background: '#111827', color: '#fff', borderColor: '#111827' },
  badge:     { fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 500 },
  input:     { padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit', width: '100%' },
  progressBar:{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressFill:{ height: '100%', background: '#3b82f6', borderRadius: 2 },
}

// ── Login page ─────────────────────────────────────────────────────────────
function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function login() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ width: 340, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>LinkTrack Pro</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Sign in to your account</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Email</div>
          <input style={s.input} type="email" placeholder="you@agency.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Password</div>
          <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        </div>
        {error && <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
        <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center', padding: '9px 14px' }} onClick={login} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

// ── Project card ───────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    supabase
      .from('submissions')
      .select('status')
      .eq('project_id', project.id)
      .then(({ data }) => {
        if (!data) return
        const found     = data.filter(s => s.status === 'found').length
        const submitted = data.filter(s => s.status === 'submitted' || s.status === 'live').length
        const missing   = data.filter(s => s.status === 'missing').length
        const total     = data.length
        setStats({ found, submitted, missing, total, pct: total ? Math.round(((found + submitted) / total) * 100) : 0 })
      })
  }, [project.id])

  const statusColor = project.status === 'active' ? { bg: '#dcfce7', color: '#166534' }
                    : project.status === 'pending' ? { bg: '#fef3c7', color: '#92400e' }
                    : { bg: '#f3f4f6', color: '#6b7280' }

  return (
    <div style={s.card} onClick={onClick} onMouseEnter={e => e.currentTarget.style.borderColor='#93c5fd'} onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
      {project.logo_url && (
        <img src={project.logo_url} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, marginBottom: 10, border: '1px solid #e5e7eb' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{project.name}</div>
        <span style={{ ...s.badge, background: statusColor.bg, color: statusColor.color }}>{project.status}</span>
      </div>
      <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 6 }}>{project.url}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
        {[project.niche, project.city, project.state].filter(Boolean).join(' · ')}
      </div>
      {stats && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>
            <span>{stats.found} listed · {stats.submitted} submitted · {stats.missing} missing</span>
            <span style={{ fontWeight: 500 }}>{stats.pct}%</span>
          </div>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: stats.pct + '%', background: stats.pct > 70 ? '#22c55e' : '#3b82f6' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Projects list page ─────────────────────────────────────────────────────
function ProjectsPage({ session, onSelectProject }) {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.niche || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>LinkTrack Pro</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{session.user.email}</span>
          <button style={s.btn} onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Projects</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>{projects.length} total</div>
          </div>
          <input style={{ ...s.input, maxWidth: 240 }} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
            {search ? 'No projects match your search.' : 'No projects yet. Add one from Supabase.'}
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} onClick={() => onSelectProject(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root app ───────────────────────────────────────────────────────────────
export default function App() {
  const [session,           setSession]          = useState(null)
  const [loading,           setLoading]          = useState(true)
  const [selectedProjectId, setSelectedProjectId]= useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading)          return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
  if (!session)         return <LoginPage />
  if (selectedProjectId) return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />

  return <ProjectsPage session={session} onSelectProject={setSelectedProjectId} />
}
