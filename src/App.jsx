import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!session)  return <LoginPage />
  return <Dashboard session={session} />
}

function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}> 
      <div style={{width:340,padding:32,border:"1px solid #e5e7eb",borderRadius:12}}>
        <h2 style={{marginBottom:20}}>LinkTrack Pro</h2>
        <input placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{width:"100%",padding:"8px 10px",marginBottom:10,border:"1px solid #ddd",borderRadius:6}} />
        <input placeholder="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width:"100%",padding:"8px 10px",marginBottom:16,border:"1px solid #ddd",borderRadius:6}} />
        {error && <p style={{color:"red",marginBottom:10,fontSize:13}}>{error}</p>}
        <button onClick={login}
          style={{width:"100%",padding:"9px",background:"#1e40af",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}}>
          Sign In
        </button>
      </div>
    </div>
  )
}

function Dashboard({ session }) {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    // Fetch projects from Supabase
    supabase.from('projects').select('*').then(({ data }) => {
      if (data) setProjects(data)
    })
  }, [])

  return (
    <div style={{padding:32}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
        <h1>LinkTrack Pro Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()}
          style={{padding:"6px 14px",borderRadius:6,border:"1px solid #ddd",cursor:"pointer"}}>
          Sign Out
        </button>
      </div>
      <p style={{color:"#6b7280",marginBottom:24}}>Logged in as: {session.user.email}</p>
      <h2 style={{marginBottom:12}}>Projects ({projects.length})</h2>
      {projects.length === 0 && <p style={{color:"#9ca3af"}}>No projects yet. Add one from the admin panel.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {projects.map(p => (
          <div key={p.id} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:16}}>
            <h3 style={{marginBottom:4}}>{p.name}</h3>
            <p style={{color:"#6b7280",fontSize:13}}>{p.niche} · {p.city}</p>
            <span style={{display:"inline-block",marginTop:8,padding:"2px 10px",
              background: p.status==="active" ? "#dcfce7" : "#fef3c7",
              color: p.status==="active" ? "#166534" : "#92400e",
              borderRadius:10,fontSize:12}}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
