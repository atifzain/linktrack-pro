import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const DIRECTORIES = [
  { name: 'Google Business Profile',  searchUrl: 'https://www.google.com/search?q=',                             submitUrl: 'https://business.google.com/add',                category: 'General Directories', da: 100, pricing: 'free'     },
  { name: 'Bing Places for Business', searchUrl: 'https://www.bing.com/search?q=',                               submitUrl: 'https://www.bingplaces.com',                      category: 'General Directories', da: 92,  pricing: 'free'     },
  { name: 'Apple Maps Connect',       searchUrl: 'https://maps.apple.com/?q=',                                   submitUrl: 'https://mapsconnect.apple.com',                   category: 'General Directories', da: 88,  pricing: 'free'     },
  { name: 'Yelp for Business',        searchUrl: 'https://www.yelp.com/search?find_desc=',                       submitUrl: 'https://biz.yelp.com',                            category: 'General Directories', da: 87,  pricing: 'free'     },
  { name: 'Yellow Pages',             searchUrl: 'https://www.yellowpages.com/search?search_terms=',             submitUrl: 'https://www.yellowpages.com/free-business-listing', category: 'General Directories', da: 74, pricing: 'free'     },
  { name: 'Foursquare',               searchUrl: 'https://foursquare.com/explore?q=',                           submitUrl: 'https://foursquare.com/add-place',                category: 'General Directories', da: 73,  pricing: 'free'     },
  { name: 'MapQuest',                 searchUrl: 'https://www.mapquest.com/search/results?query=',               submitUrl: 'https://listings.mapquest.com',                   category: 'General Directories', da: 70,  pricing: 'free'     },
  { name: 'Hotfrog',                  searchUrl: 'https://www.hotfrog.com/search/',                              submitUrl: 'https://www.hotfrog.com',                         category: 'General Directories', da: 52,  pricing: 'free'     },
  { name: 'Neustar Localeze',         searchUrl: 'https://www.neustar.biz/local?q=',                            submitUrl: 'https://www.neustar.biz/local',                   category: 'Local Citations',     da: 65,  pricing: 'paid'     },
  { name: 'Data Axle',                searchUrl: 'https://www.data-axle.com/find-a-business/?q=',               submitUrl: 'https://www.data-axle.com',                       category: 'Local Citations',     da: 60,  pricing: 'paid'     },
  { name: 'Factual / Foursquare',     searchUrl: 'https://foursquare.com/explore?q=',                           submitUrl: 'https://foursquare.com',                          category: 'Local Citations',     da: 58,  pricing: 'free'     },
  { name: 'Trustpilot',               searchUrl: 'https://www.trustpilot.com/search?query=',                    submitUrl: 'https://businessapp.trustpilot.com/signup',       category: 'Review Sites',        da: 91,  pricing: 'freemium' },
  { name: 'Better Business Bureau',   searchUrl: 'https://www.bbb.org/search?find_text=',                       submitUrl: 'https://www.bbb.org/accreditation',               category: 'Review Sites',        da: 88,  pricing: 'freemium' },
  { name: 'Angi',                     searchUrl: 'https://www.angi.com/search?q=',                              submitUrl: 'https://pro.angi.com',                            category: 'Review Sites',        da: 80,  pricing: 'freemium' },
  { name: 'Facebook Business',        searchUrl: 'https://www.facebook.com/search/pages/?q=',                  submitUrl: 'https://www.facebook.com/pages/create',           category: 'Social Profiles',     da: 100, pricing: 'free'     },
  { name: 'LinkedIn Company',         searchUrl: 'https://www.linkedin.com/search/results/companies/?keywords=', submitUrl: 'https://www.linkedin.com/company/setup/new/',     category: 'Social Profiles',     da: 98,  pricing: 'free'     },
  { name: 'X / Twitter',              searchUrl: 'https://twitter.com/search?q=',                               submitUrl: 'https://twitter.com/i/flow/signup',               category: 'Social Profiles',     da: 96,  pricing: 'free'     },
  { name: 'Instagram Business',       searchUrl: 'https://www.instagram.com/explore/search/keyword/?q=',        submitUrl: 'https://www.instagram.com/accounts/emailsignup/', category: 'Social Profiles',     da: 94,  pricing: 'free'     },
]

const CATEGORIES = [...new Set(DIRECTORIES.map(d => d.category))]

const s = {
  page:        { minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#111827' },
  topbar:      { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  content:     { maxWidth: 1200, margin: '0 auto', padding: '20px 24px' },
  card:        { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 14 },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  grid5:       { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 14 },
  stat:        { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', textAlign: 'center' },
  statVal:     { fontSize: 24, fontWeight: 500, lineHeight: 1 },
  statLbl:     { fontSize: 10, color: '#9ca3af', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.4px' },
  btn:         { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: 'transparent', color: '#111827', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  btnPrimary:  { background: '#111827', color: '#fff', borderColor: '#111827' },
  btnSm:       { padding: '4px 10px', fontSize: 12 },
  btnSuccess:  { borderColor: '#86efac', color: '#166534', background: 'transparent' },
  btnDanger:   { borderColor: '#fca5a5', color: '#991b1b', background: 'transparent' },
  btnInfo:     { borderColor: '#93c5fd', color: '#1d4ed8', background: 'transparent' },
  btnSave:     { borderColor: '#6ee7b7', color: '#065f46', background: '#ecfdf5', fontSize: 12, padding: '5px 12px', cursor: 'pointer', borderRadius: 6, border: '1px solid #6ee7b7', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  table:       { width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  th:          { textAlign: 'left', padding: '9px 12px', fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  td:          { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  badge:       { fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 500 },
  urlInput:    { padding: '5px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, fontFamily: 'inherit', width: '100%', minWidth: 160, outline: 'none' },
  progressBar: { height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: '100%', background: '#3b82f6', borderRadius: 3, transition: 'width .4s' },
  select:      { padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },
  toast:       { position: 'fixed', bottom: 16, right: 16, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 999, border: '1px solid', maxWidth: 320 },
}

function StatusPill({ status }) {
  const map = {
    found:     { bg: '#dcfce7', color: '#166534', label: '✓ Listed'     },
    missing:   { bg: '#fee2e2', color: '#991b1b', label: '✗ Not listed' },
    submitted: { bg: '#dbeafe', color: '#1d4ed8', label: '↑ Submitted'  },
    live:      { bg: '#dcfce7', color: '#166534', label: '✓ Live'       },
    pending:   { bg: '#f3f4f6', color: '#6b7280', label: '— Unchecked'  },
  }
  const m = map[status] || map.pending
  return <span style={{ ...s.badge, background: m.bg, color: m.color }}>{m.label}</span>
}

function Toast({ msg, ok, visible }) {
  if (!visible) return null
  return (
    <div style={{ ...s.toast, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b', borderColor: ok ? '#86efac' : '#fca5a5' }}>
      {msg}
    </div>
  )
}

export default function ProjectDetail({ projectId, onBack }) {
  const [project,      setProject]      = useState(null)
  const [submissions,  setSubmissions]  = useState({})
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState({})
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCat,    setFilterCat]    = useState('')
  const [toast,        setToast]        = useState({ visible: false, msg: '', ok: true })
  const [urlEdits,     setUrlEdits]     = useState({})

  useEffect(() => { if (projectId) loadProject() }, [projectId])

  async function loadProject() {
    setLoading(true)
    try {
      const { data: proj, error: pe } = await supabase.from('projects').select('*').eq('id', projectId).single()
      if (pe) throw pe
      setProject(proj)

      const { data: subs, error: se } = await supabase
        .from('submissions')
        .select('*, directories(id, name, category, domain_authority, pricing_type)')
        .eq('project_id', projectId)
      if (se) throw se

      const indexed = {}
      const edits   = {}
      subs.forEach(s => {
        if (s.directories?.name) {
          indexed[s.directories.name] = s
          edits[s.directories.name]   = s.existing_url || s.live_url || ''
        }
      })
      setSubmissions(indexed)
      setUrlEdits(edits)
    } catch (err) {
      showToast('Error loading: ' + err.message, false)
    }
    setLoading(false)
  }

  async function markStatus(dirName, status) {
    const sub = submissions[dirName]
    if (!sub?.id) { showToast('No record found — try reloading the page', false); return }
    const existingUrl = urlEdits[dirName] || ''
    const now = new Date().toISOString()
    setSaving(prev => ({ ...prev, [dirName]: true }))
    const { error } = await supabase
      .from('submissions')
      .update({ status, existing_url: existingUrl, live_url: (status === 'found' || status === 'live') ? existingUrl : sub.live_url, last_checked_at: now, submitted_at: status === 'submitted' ? now : sub.submitted_at })
      .eq('id', sub.id)
    if (error) {
      showToast('Save failed: ' + error.message, false)
    } else {
      setSubmissions(prev => ({ ...prev, [dirName]: { ...prev[dirName], status, existing_url: existingUrl, last_checked_at: now } }))
      showToast(dirName + ' — ' + (status === 'found' ? 'marked as already listed' : status === 'missing' ? 'marked as not listed' : 'marked as submitted'), true)
    }
    setSaving(prev => ({ ...prev, [dirName]: false }))
  }

  async function saveUrl(dirName) {
    const sub = submissions[dirName]
    if (!sub?.id) { showToast('No record found — reload the page first', false); return }
    const existingUrl = urlEdits[dirName] || ''
    if (!existingUrl) { showToast('Please paste a URL first', false); return }
    setSaving(prev => ({ ...prev, [dirName + '_url']: true }))
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('submissions')
      .update({ existing_url: existingUrl, live_url: existingUrl, last_checked_at: now })
      .eq('id', sub.id)
    if (error) {
      showToast('URL save failed: ' + error.message, false)
    } else {
      setSubmissions(prev => ({ ...prev, [dirName]: { ...prev[dirName], existing_url: existingUrl, last_checked_at: now } }))
      showToast('URL saved for ' + dirName, true)
    }
    setSaving(prev => ({ ...prev, [dirName + '_url']: false }))
  }

  function openSearch(dir, withLocation) {
    const parts = [project.name]
    if (withLocation && project.city)  parts.push(project.city)
    if (withLocation && project.state) parts.push(project.state)
    window.open(dir.searchUrl + encodeURIComponent(parts.join(' ')), '_blank')
  }

  function runCheckAll() {
    const q = encodeURIComponent(project.name)
    let i = 0
    const iv = setInterval(() => {
      if (i >= DIRECTORIES.length) { clearInterval(iv); showToast('All directories opened — mark each one above', true); return }
      window.open(DIRECTORIES[i].searchUrl + q, '_blank')
      i++
    }, 800)
    showToast('Opening all directories...', true)
  }

  function runCheckMissing() {
    const unchecked = DIRECTORIES.filter(d => (submissions[d.name]?.status || 'pending') === 'pending')
    if (!unchecked.length) { showToast('All directories already checked', true); return }
    const q = encodeURIComponent(project.name)
    let i = 0
    const iv = setInterval(() => {
      if (i >= unchecked.length) { clearInterval(iv); showToast('Opened ' + unchecked.length + ' unchecked directories', true); return }
      window.open(unchecked[i].searchUrl + q, '_blank')
      i++
    }, 800)
  }

  function exportCSV() {
    const rows = [['Directory', 'Category', 'DA', 'Pricing', 'Status', 'Existing URL', 'Submit URL', 'Last Checked']]
    DIRECTORIES.forEach(d => {
      const sub = submissions[d.name] || {}
      rows.push([d.name, d.category, d.da, d.pricing, sub.status || 'pending', sub.existing_url || '', d.submitUrl, sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleDateString() : ''])
    })
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (project?.name || 'project').replace(/\s+/g, '-') + '-directories.csv'
    a.click()
  }

  function showToast(msg, ok) {
    setToast({ visible: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  const stats = DIRECTORIES.reduce((acc, d) => {
    const st = submissions[d.name]?.status || 'pending'
    acc[st] = (acc[st] || 0) + 1
    return acc
  }, {})

  const checked = (stats.found || 0) + (stats.missing || 0) + (stats.submitted || 0) + (stats.live || 0)
  const pct = Math.round((checked / DIRECTORIES.length) * 100)
  const lastChecked = Object.values(submissions).map(s => s.last_checked_at).filter(Boolean).sort().pop()
  const filtered = DIRECTORIES.filter(d => {
    const matchSt  = !filterStatus || (submissions[d.name]?.status || 'pending') === filterStatus
    const matchCat = !filterCat    || d.category === filterCat
    return matchSt && matchCat
  })

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading project...</div>
  if (!project) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Project not found.</div>

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={onBack}>← Projects</span>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ fontWeight: 500 }}>{project.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn} onClick={exportCSV}>Export CSV ↓</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={runCheckAll}>Check all directories ↗</button>
        </div>
      </div>

      <div style={s.content}>

        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              {project.logo_url && <img src={project.logo_url} alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, marginBottom: 8, border: '1px solid #e5e7eb', display: 'block' }} />}
              <div style={{ fontSize: 18, fontWeight: 500 }}>{project.name}</div>
              <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>{project.url}</div>
              {project.tagline && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontStyle: 'italic' }}>{project.tagline}</div>}
            </div>
            <span style={{ ...s.badge, background: project.status === 'active' ? '#dcfce7' : '#fef3c7', color: project.status === 'active' ? '#166534' : '#92400e' }}>{project.status}</span>
          </div>
          <div style={s.grid4}>
            {[['Niche', project.niche || '—'], ['Location', [project.city, project.state].filter(Boolean).join(', ') || '—'], ['Phone', project.phone || '—'], ['Last checked', lastChecked ? new Date(lastChecked).toLocaleDateString() : 'Never']].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.grid5}>
          {[{ val: stats.found || 0, lbl: 'Already listed', color: '#166534' }, { val: stats.missing || 0, lbl: 'Not listed', color: '#991b1b' }, { val: stats.submitted || 0, lbl: 'Submitted', color: '#1d4ed8' }, { val: stats.pending || 0, lbl: 'Unchecked', color: '#d97706' }, { val: DIRECTORIES.length, lbl: 'Total', color: '#111827' }].map(({ val, lbl, color }) => (
            <div key={lbl} style={s.stat}>
              <div style={{ ...s.statVal, color }}>{val}</div>
              <div style={s.statLbl}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ ...s.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={runCheckAll}>Check all ↗</button>
            <button style={s.btn} onClick={runCheckMissing}>Check unchecked only ↗</button>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Search opens by name only · use +Location for city/state</span>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
              <span>Check progress</span><span>{pct}%</span>
            </div>
            <div style={s.progressBar}><div style={{ ...s.progressFill, width: pct + '%' }} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="found">Already listed</option>
            <option value="missing">Not listed</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Unchecked</option>
          </select>
          <select style={s.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {filtered.length} of {DIRECTORIES.length}</span>
        </div>

        {CATEGORIES.map(cat => {
          const dirs = filtered.filter(d => d.category === cat)
          if (!dirs.length) return null
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>{cat} ({dirs.length})</div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: 170 }}>Directory</th>
                    <th style={{ ...s.th, width: 45 }}>DA</th>
                    <th style={{ ...s.th, width: 105 }}>Status</th>
                    <th style={s.th}>Existing listing URL — paste then click Save</th>
                    <th style={{ ...s.th, width: 90 }}>Last checked</th>
                    <th style={{ ...s.th, width: 240 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dirs.map(d => {
                    const sub   = submissions[d.name] || {}
                    const st    = sub.status || 'pending'
                    const rowBg = st === 'found' ? '#f0fdf4' : st === 'submitted' ? '#eff6ff' : '#fff'
                    return (
                      <tr key={d.name} style={{ background: rowBg }}>
                        <td style={s.td}>
                          <div style={{ fontWeight: 500 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{d.pricing}</div>
                        </td>
                        <td style={{ ...s.td, fontWeight: 500 }}>{d.da}</td>
                        <td style={s.td}><StatusPill status={st} /></td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              style={s.urlInput}
                              value={urlEdits[d.name] || ''}
                              placeholder="https://..."
                              onChange={e => setUrlEdits(prev => ({ ...prev, [d.name]: e.target.value }))}
                            />
                            <button
                              style={s.btnSave}
                              disabled={saving[d.name + '_url']}
                              onClick={() => saveUrl(d.name)}
                            >
                              {saving[d.name + '_url'] ? '...' : 'Save'}
                            </button>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            <button style={{ ...s.btn, ...s.btnSm }} onClick={() => openSearch(d, false)}>Search ↗</button>
                            <button style={{ ...s.btn, ...s.btnSm, color: '#6b7280', fontSize: 11 }} onClick={() => openSearch(d, true)}>+Location</button>
                            <button style={{ ...s.btn, ...s.btnSm, ...s.btnSuccess }} disabled={saving[d.name]} onClick={() => markStatus(d.name, 'found')}>Listed</button>
                            <button style={{ ...s.btn, ...s.btnSm, ...s.btnDanger }} disabled={saving[d.name]} onClick={() => markStatus(d.name, 'missing')}>Missing</button>
                            {st === 'missing' && (
                              <button style={{ ...s.btn, ...s.btnSm, ...s.btnInfo }} onClick={() => window.open(d.submitUrl, '_blank')}>Submit ↗</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
      <Toast {...toast} />
    </div>
  )
}
