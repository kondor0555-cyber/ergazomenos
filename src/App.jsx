import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const COLORS = {
  primary: "#1a3a5c", primaryLight: "#2563a8", accent: "#e8a020",
  success: "#1a7a45", danger: "#c0392b", bg: "#f4f6f9",
  card: "#ffffff", text: "#1a2332", muted: "#5f6b7a", border: "#dde3ec",
};

const JOB_TYPES = { permanent: "Μόνιμη", season: "Εποχική", shortterm: "Ολίγων ημερών", parttime: "Μερική" };
const JOB_TYPE_COLORS = { permanent: "#1a7a45", season: "#1565c0", shortterm: "#b45309", parttime: "#7b1fa2" };
const CITIES = ["Όλες","Αθήνα","Θεσσαλονίκη","Πάτρα","Ηράκλειο","Λάρισα","Βόλος","Ζάκυνθος","Ρόδος","Κέρκυρα","Άργος","Ηράκλειο","Κόρινθος"];
const PROFESSIONS = ["Όλα","Εστίαση","Αποθήκη/Logistics","Λιανικό Εμπόριο","Κατασκευές","Εκπαίδευση","Μεταφορές","Πληροφορική","Τουρισμός","Υγεία"];
const ADMIN_EMAIL = "";

// ─── UI Helpers ───────────────────────────────────────────────────
function Badge({ type }) {
  const color = JOB_TYPE_COLORS[type] || "#666";
  return <span style={{ background: color+"18", color, border:`1px solid ${color}40`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 }}>{JOB_TYPES[type]}</span>;
}
function UrgentBadge() {
  return <span style={{ background:"#fef3cd", color:"#92400e", border:"1px solid #f59e0b60", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>⚡ ΕΠΕΙΓΟΝ</span>;
}
function Spinner() {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60 }}><div style={{ width:36, height:36, border:`3px solid ${COLORS.border}`, borderTop:`3px solid ${COLORS.primary}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}
function Modal({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:COLORS.card, borderRadius:18, padding:28, maxWidth:520, width:"100%", maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:22, cursor:"pointer", color:COLORS.muted }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────
function JobCard({ job, onCall, onDetail }) {
  return (
    <div onClick={() => onDetail(job)} style={{ background:COLORS.card, border:`1.5px solid ${COLORS.border}`, borderRadius:14, padding:"18px 20px", cursor:"pointer", marginBottom:12, transition:"box-shadow 0.2s, transform 0.1s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 20px rgba(26,58,92,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
        <div style={{ fontSize:32, background:COLORS.bg, borderRadius:10, width:52, height:52, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {job.logo || "📋"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
            <Badge type={job.type} />
            {job.urgent && <UrgentBadge />}
          </div>
          <div style={{ fontWeight:700, fontSize:16, color:COLORS.text, marginBottom:2 }}>{job.title}</div>
          <div style={{ fontSize:13, color:COLORS.muted, marginBottom:6 }}>{job.employer} · {job.city}{job.area ? `, ${job.area}` : ""}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:14, fontWeight:600, color:COLORS.success }}>{job.salary}</span>
            <span style={{ fontSize:12, color:COLORS.muted }}>📍 {job.profession}</span>
          </div>
        </div>
        <button onClick={e=>{ e.stopPropagation(); onCall(job.phone); }}
          style={{ background:COLORS.success, color:"#fff", border:"none", borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700, flexShrink:0 }}>
          📞 Κλήση
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────
function LoginView({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handle = async () => {
    setErr(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (data?.user) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role === "admin" && pass !== "αα45664566ααΑ@") {
    await supabase.auth.signOut();
    setErr("Λάθος κωδικός διαχειριστή.");
    setLoading(false);
    return;
  }
}
    if (error) { setErr("Λάθος email ή κωδικός."); setLoading(false); return; }
    // fetch profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
   const role = profile?.role || "worker";
    onLogin({ ...data.user, ...profile, role });
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${COLORS.primary} 0%, #2563a8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:COLORS.card, borderRadius:22, padding:"36px 32px", maxWidth:400, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>💼</div>
          <div style={{ fontSize:26, fontWeight:800, color:COLORS.primary }}>Εργαζόμενος</div>
          <div style={{ fontSize:13, color:COLORS.muted, marginTop:4 }}>Η πλατφόρμα εργασίας για όλους</div>
        </div>
        {msg && <div style={{ background:"#f0fdf4", color:COLORS.success, borderRadius:8, padding:"10px 12px", fontSize:13, marginBottom:14 }}>{msg}</div>}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>EMAIL</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"
            style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${COLORS.border}`, fontSize:14, boxSizing:"border-box" }} />
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>ΚΩΔΙΚΟΣ</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
            onKeyDown={e=>e.key==="Enter"&&handle()}
            style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${COLORS.border}`, fontSize:14, boxSizing:"border-box" }} />
        </div>
        {err && <div style={{ background:"#fef2f2", color:COLORS.danger, borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:14 }}>{err}</div>}
        <button onClick={handle} disabled={loading}
          style={{ width:"100%", background:COLORS.primary, color:"#fff", border:"none", borderRadius:11, padding:"13px 0", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
          {loading ? "Σύνδεση..." : "Σύνδεση"}
        </button>
        <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:COLORS.muted }}>
          Δεν έχεις λογαριασμό;{" "}
          <span onClick={onSignup} style={{ color:COLORS.primaryLight, fontWeight:600, cursor:"pointer" }}>Εγγραφή</span>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────
function SignupView({ onBack }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"worker", phone:"", city:"Αθήνα", profession:"", company:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = async () => {
    if (!form.name||!form.email||!form.password||!form.phone) { setErr("Συμπλήρωσε όλα τα υποχρεωτικά πεδία."); return; }
    if (form.password.length < 6) { setErr("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες."); return; }
    setLoading(true); setErr("");
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) { setErr(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id, name: form.name, role: form.role,
        phone: form.phone, city: form.city, profession: form.profession, company: form.company
      });
    }
    setDone(true); setLoading(false);
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${COLORS.primary} 0%, #2563a8 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:COLORS.card, borderRadius:18, padding:36, textAlign:"center", maxWidth:360 }}>
        <div style={{ fontSize:52, marginBottom:12 }}>📧</div>
        <div style={{ fontWeight:800, fontSize:20, color:COLORS.text, marginBottom:8 }}>Επιβεβαίωσε το email σου!</div>
        <div style={{ color:COLORS.muted, marginBottom:24 }}>Στείλαμε email επιβεβαίωσης στο <strong>{form.email}</strong>. Κάνε κλικ στο link και μετά συνδέσου.</div>
        <button onClick={onBack} style={{ background:COLORS.primary, color:"#fff", border:"none", borderRadius:10, padding:"12px 32px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
          Πίσω στη Σύνδεση
        </button>
      </div>
    </div>
  );

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>{label} {["name","email","password","phone"].includes(key) && <span style={{ color:COLORS.danger }}>*</span>}</label>
      <input type={type} value={form[key]} onChange={e=>upd(key,e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14, boxSizing:"border-box" }} />
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${COLORS.primary} 0%, #2563a8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:COLORS.card, borderRadius:22, padding:"32px 28px", maxWidth:460, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:COLORS.muted, marginBottom:16 }}>← Πίσω</button>
        <div style={{ fontWeight:800, fontSize:22, color:COLORS.primary, marginBottom:4 }}>Δημιουργία λογαριασμού</div>
        <div style={{ fontSize:13, color:COLORS.muted, marginBottom:22 }}>Συμπλήρωσε τα στοιχεία σου</div>
        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          {[["worker","👷 Εργαζόμενος"],["employer","🏢 Εργοδότης"],["both","🔄 Και τα δύο"]].map(([v,l]) => (
            <button key={v} onClick={()=>upd("role",v)}
              style={{ flex:1, padding:"10px 4px", borderRadius:10, border:`2px solid ${form.role===v?COLORS.primary:COLORS.border}`, background:form.role===v?COLORS.primary:"#fff", color:form.role===v?"#fff":COLORS.text, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
        {inp("Πλήρες Ονοματεπώνυμο","name","text","Γιάννης Παπαδόπουλος")}
        {inp("Email","email","email","email@example.com")}
        {inp("Κωδικός (min. 6 χαρακτήρες)","password","password","••••••••")}
        {inp("Κινητό τηλέφωνο","phone","tel","69XXXXXXXX")}
        {(form.role==="employer"||form.role==="both") && inp("Επωνυμία Εταιρείας","company","text","Εταιρεία ΑΕ")}
        {(form.role==="worker"||form.role==="both") && inp("Επάγγελμα","profession","text","π.χ. Σερβιτόρος")}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Πόλη</label>
          <select value={form.city} onChange={e=>upd("city",e.target.value)}
            style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14 }}>
            {CITIES.filter(c=>c!=="Όλες").map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {err && <div style={{ background:"#fef2f2", color:COLORS.danger, borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:14 }}>{err}</div>}
        <button onClick={handle} disabled={loading}
          style={{ width:"100%", background:COLORS.primary, color:"#fff", border:"none", borderRadius:11, padding:"13px 0", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
          {loading ? "Δημιουργία..." : "Δημιουργία Λογαριασμού"}
        </button>
      </div>
    </div>
  );
}

// ─── JOBS VIEW ────────────────────────────────────────────────────
function JobsView({ user, onPost, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Όλες");
  const [prof, setProf] = useState("Όλα");
  const [type, setType] = useState("all");
  const [detail, setDetail] = useState(null);
  const [callModal, setCallModal] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  const filtered = jobs.filter(j => {
    if (city!=="Όλες" && j.city!==city) return false;
    if (prof!=="Όλα" && j.profession!==prof) return false;
    if (type!=="all" && j.type!==type) return false;
    if (search && !`${j.title} ${j.employer} ${j.profession}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg }}>
      {/* Header */}
      <div style={{ background:COLORS.primary, padding:"0 20px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>💼</span>
            <span style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Εργαζόμενος</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {(user.role==="employer"||user.role==="both") && (
              <button onClick={onPost} style={{ background:COLORS.accent, color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                + Αγγελία
              </button>
            )}
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>Γεια, <strong>{user.name?.split(" ")[0] || "χρήστη"}</strong></span>
            <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"none", borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>
              Αποσύνδεση
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg, ${COLORS.primary} 0%, #1a4a8c 100%)`, padding:"28px 20px 32px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <div style={{ color:"#fff", fontSize:26, fontWeight:800, marginBottom:6 }}>Βρες τη δουλειά σου σήμερα</div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:14, marginBottom:20 }}>{jobs.length} αγγελίες σε όλη την Ελλάδα</div>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Αναζήτηση θέσης, εταιρείας, επαγγέλματος..."
            style={{ width:"100%", padding:"14px 18px", borderRadius:12, border:"none", fontSize:15, boxSizing:"border-box", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:COLORS.card, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 20px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <select value={city} onChange={e=>setCity(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:13 }}>
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={prof} onChange={e=>setProf(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:13 }}>
            {PROFESSIONS.map(p=><option key={p}>{p}</option>)}
          </select>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["all","Όλες"],["permanent","Μόνιμη"],["season","Εποχική"],["shortterm","Ολίγων ημερών"],["parttime","Μερική"]].map(([v,l]) => (
              <button key={v} onClick={()=>setType(v)}
                style={{ padding:"7px 13px", borderRadius:20, border:`1.5px solid ${type===v?COLORS.primary:COLORS.border}`, background:type===v?COLORS.primary:"#fff", color:type===v?"#fff":COLORS.text, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                {l}
              </button>
            ))}
          </div>
          <span style={{ marginLeft:"auto", fontSize:13, color:COLORS.muted }}>{filtered.length} αποτελέσματα</span>
        </div>
      </div>

      {/* List */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"20px" }}>
        {loading ? <Spinner /> : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:COLORS.muted }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16, fontWeight:600 }}>Δεν βρέθηκαν αγγελίες</div>
          </div>
        ) : filtered.map(j => <JobCard key={j.id} job={j} onCall={setCallModal} onDetail={setDetail} />)}
      </div>

      {/* Detail Modal */}
      {detail && (
        <Modal onClose={()=>setDetail(null)}>
          <div style={{ fontSize:38, marginBottom:8 }}>{detail.logo||"📋"}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            <Badge type={detail.type} />
            {detail.urgent && <UrgentBadge />}
          </div>
          <div style={{ fontWeight:800, fontSize:22, color:COLORS.text, marginBottom:4 }}>{detail.title}</div>
          <div style={{ fontSize:14, color:COLORS.muted, marginBottom:14 }}>{detail.employer} · {detail.city}{detail.area?`, ${detail.area}`:""}</div>
          <div style={{ background:COLORS.bg, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, color:COLORS.muted }}>Μισθός</span>
              <span style={{ fontWeight:700, color:COLORS.success }}>{detail.salary}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:COLORS.muted }}>Επάγγελμα</span>
              <span style={{ fontWeight:600, fontSize:13 }}>{detail.profession}</span>
            </div>
          </div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>Περιγραφή</div>
          <div style={{ fontSize:14, color:COLORS.muted, lineHeight:1.7, marginBottom:20 }}>{detail.description}</div>
          <a href={`tel:${detail.phone}`} style={{ display:"block", textDecoration:"none" }}>
            <button style={{ width:"100%", background:COLORS.success, color:"#fff", border:"none", borderRadius:12, padding:"14px 0", fontSize:16, fontWeight:700, cursor:"pointer" }}>
              📞 Κλήση: {detail.phone}
            </button>
          </a>
        </Modal>
      )}

      {/* Call Modal */}
      {callModal && (
        <Modal onClose={()=>setCallModal(null)}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>📞</div>
            <div style={{ fontWeight:700, fontSize:20, marginBottom:6 }}>Άμεση Κλήση</div>
            <div style={{ color:COLORS.muted, marginBottom:20 }}>Θα καλέσεις απευθείας τον εργοδότη.</div>
            <div style={{ fontSize:22, fontWeight:800, color:COLORS.primary, marginBottom:24 }}>{callModal}</div>
            <a href={`tel:${callModal}`} style={{ textDecoration:"none" }}>
              <button style={{ background:COLORS.success, color:"#fff", border:"none", borderRadius:11, padding:"13px 40px", fontSize:16, fontWeight:700, cursor:"pointer", width:"100%" }}>
                📞 Κλήση τώρα
              </button>
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── POST JOB ─────────────────────────────────────────────────────
function PostJobView({ user, onBack }) {
  const [form, setForm] = useState({ title:"", profession:"Εστίαση", city:"Αθήνα", area:"", type:"permanent", salary:"", phone:"", description:"", urgent:false, logo:"📋" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = async () => {
    if (!form.title||!form.phone) { setErr("Συμπλήρωσε τίτλο και τηλέφωνο."); return; }
    setLoading(true);
    const { error } = await supabase.from("jobs").insert({
      ...form,
      employer: user.company || user.name,
      user_id: user.id,
    });
    if (error) { setErr(error.message); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:COLORS.card, borderRadius:18, padding:36, textAlign:"center", maxWidth:360 }}>
        <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
        <div style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>Η αγγελία δημοσιεύτηκε!</div>
        <div style={{ color:COLORS.muted, marginBottom:24 }}>Είναι πλέον ορατή σε όλους τους υποψήφιους.</div>
        <button onClick={onBack} style={{ background:COLORS.primary, color:"#fff", border:"none", borderRadius:10, padding:"12px 32px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
          Πίσω στις αγγελίες
        </button>
      </div>
    </div>
  );

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>upd(key,e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14, boxSizing:"border-box" }} />
    </div>
  );

  const LOGOS = ["📋","🍽️","📦","🛒","🏗️","🎓","🚚","🍹","💻","🏥","✂️","🔧","🌾","🎨"];

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, padding:20 }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:COLORS.muted, marginBottom:16 }}>← Πίσω</button>
        <div style={{ background:COLORS.card, borderRadius:18, padding:28 }}>
          <div style={{ fontWeight:800, fontSize:22, color:COLORS.primary, marginBottom:4 }}>Νέα Αγγελία</div>
          <div style={{ fontSize:13, color:COLORS.muted, marginBottom:24 }}>Δημοσίευσε αγγελία για να βρεις προσωπικό</div>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:8 }}>Εικονίδιο αγγελίας</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {LOGOS.map(l => (
                <button key={l} onClick={()=>upd("logo",l)}
                  style={{ fontSize:22, background:form.logo===l?COLORS.primary+"18":"#f5f5f5", border:`2px solid ${form.logo===l?COLORS.primary:"transparent"}`, borderRadius:8, padding:"6px 10px", cursor:"pointer" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {inp("Τίτλος θέσης *","title","text","π.χ. Σερβιτόρος/α")}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Επάγγελμα</label>
              <select value={form.profession} onChange={e=>upd("profession",e.target.value)}
                style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14 }}>
                {PROFESSIONS.filter(p=>p!=="Όλα").map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Τύπος εργασίας</label>
              <select value={form.type} onChange={e=>upd("type",e.target.value)}
                style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14 }}>
                {Object.entries(JOB_TYPES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Πόλη</label>
              <select value={form.city} onChange={e=>upd("city",e.target.value)}
                style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14 }}>
                {CITIES.filter(c=>c!=="Όλες").map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>{inp("Περιοχή","area","text","π.χ. Γλυφάδα")}</div>
          </div>
          {inp("Μισθός / Αμοιβή","salary","text","π.χ. 900€/μήνα")}
          {inp("Τηλέφωνο επικοινωνίας *","phone","tel","69XXXXXXXX")}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:COLORS.muted, display:"block", marginBottom:5 }}>Περιγραφή</label>
            <textarea value={form.description} onChange={e=>upd("description",e.target.value)} rows={4}
              placeholder="Περιέγραψε τη θέση, απαιτήσεις, παροχές..."
              style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${COLORS.border}`, fontSize:14, boxSizing:"border-box", resize:"vertical" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
            <input type="checkbox" id="urgent" checked={form.urgent} onChange={e=>upd("urgent",e.target.checked)} style={{ width:18, height:18 }} />
            <label htmlFor="urgent" style={{ fontSize:14, fontWeight:600, cursor:"pointer" }}>⚡ Επείγουσα αγγελία</label>
          </div>
          {err && <div style={{ background:"#fef2f2", color:COLORS.danger, borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <button onClick={handle} disabled={loading}
            style={{ width:"100%", background:COLORS.primary, color:"#fff", border:"none", borderRadius:11, padding:"13px 0", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
            {loading ? "Δημοσίευση..." : "Δημοσίευση Αγγελίας"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────
function AdminView({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [j, u] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at",{ascending:false}),
        supabase.from("profiles").select("*")
      ]);
      setJobs(j.data||[]); setUsers(u.data||[]); setLoading(false);
    };
    load();
  }, []);

  const deleteJob = async (id) => {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const StatCard = ({label, value, icon, color}) => (
    <div style={{ background:COLORS.card, borderRadius:14, padding:"20px 22px", border:`1.5px solid ${COLORS.border}` }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color:color||COLORS.primary }}>{value}</div>
      <div style={{ fontSize:13, color:COLORS.muted, marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg }}>
      <div style={{ background:COLORS.primary, padding:"0 20px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>👑</span>
            <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>Admin Panel · Εργαζόμενος</span>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, cursor:"pointer" }}>
            Αποσύνδεση
          </button>
        </div>
      </div>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {[["overview","📊 Επισκόπηση"],["jobs","💼 Αγγελίες"],["users","👥 Χρήστες"]].map(([v,l]) => (
            <button key={v} onClick={()=>setTab(v)}
              style={{ padding:"9px 18px", borderRadius:10, border:`1.5px solid ${tab===v?COLORS.primary:COLORS.border}`, background:tab===v?COLORS.primary:COLORS.card, color:tab===v?"#fff":COLORS.text, fontWeight:600, fontSize:13, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : <>
          {tab==="overview" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14, marginBottom:24 }}>
                <StatCard label="Αγγελίες" value={jobs.length} icon="💼" color={COLORS.primary} />
                <StatCard label="Επείγουσες" value={jobs.filter(j=>j.urgent).length} icon="⚡" color="#b45309" />
                <StatCard label="Εγγεγραμμένοι" value={users.length} icon="👥" color={COLORS.success} />
                <StatCard label="Εργοδότες" value={users.filter(u=>u.role==="employer"||u.role==="both").length} icon="🏢" color={COLORS.primaryLight} />
              </div>
              <div style={{ background:COLORS.card, borderRadius:14, padding:20, border:`1.5px solid ${COLORS.border}` }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:14 }}>Κατανομή ανά τύπο</div>
                {Object.entries(JOB_TYPES).map(([k,label]) => {
                  const count = jobs.filter(j=>j.type===k).length;
                  const pct = jobs.length ? Math.round(count/jobs.length*100) : 0;
                  return (
                    <div key={k} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:13 }}>{label}</span>
                        <span style={{ fontSize:13, fontWeight:600 }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height:8, background:COLORS.border, borderRadius:4, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:JOB_TYPE_COLORS[k], borderRadius:4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab==="jobs" && (
            <div style={{ background:COLORS.card, borderRadius:14, border:`1.5px solid ${COLORS.border}`, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${COLORS.border}`, fontWeight:700 }}>Αγγελίες ({jobs.length})</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:COLORS.bg }}>
                      {["Τίτλος","Εταιρεία","Πόλη","Τύπος","Μισθός","Τηλ.",""].map(h=>(
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:COLORS.muted, fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j,i) => (
                      <tr key={j.id} style={{ borderTop:`1px solid ${COLORS.border}`, background:i%2===0?"#fff":COLORS.bg }}>
                        <td style={{ padding:"10px 14px", fontWeight:600 }}>{j.logo} {j.title}</td>
                        <td style={{ padding:"10px 14px", color:COLORS.muted }}>{j.employer}</td>
                        <td style={{ padding:"10px 14px" }}>{j.city}</td>
                        <td style={{ padding:"10px 14px" }}><Badge type={j.type} /></td>
                        <td style={{ padding:"10px 14px", color:COLORS.success, fontWeight:600 }}>{j.salary}</td>
                        <td style={{ padding:"10px 14px" }}>{j.phone}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <button onClick={()=>deleteJob(j.id)}
                            style={{ background:"#fef2f2", color:COLORS.danger, border:`1px solid ${COLORS.danger}30`, borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }}>
                            Διαγραφή
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab==="users" && (
            <div style={{ background:COLORS.card, borderRadius:14, border:`1.5px solid ${COLORS.border}`, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${COLORS.border}`, fontWeight:700 }}>Χρήστες ({users.length})</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:COLORS.bg }}>
                      {["Όνομα","Ρόλος","Πόλη","Επάγγελμα","Τηλ."].map(h=>(
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:COLORS.muted, fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u,i) => (
                      <tr key={u.id} style={{ borderTop:`1px solid ${COLORS.border}`, background:i%2===0?"#fff":COLORS.bg }}>
                        <td style={{ padding:"10px 14px", fontWeight:600 }}>{u.name}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ background:u.role==="employer"?"#dbeafe":u.role==="both"?"#fef3cd":"#dcfce7", color:u.role==="employer"?"#1d4ed8":u.role==="both"?"#92400e":"#166534", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 }}>
                            {u.role==="employer"?"🏢 Εργοδότης":u.role==="both"?"🔄 Και τα δύο":"👷 Εργαζόμενος"}
                          </span>
                        </td>
                        <td style={{ padding:"10px 14px" }}>{u.city||"—"}</td>
                        <td style={{ padding:"10px 14px" }}>{u.profession||u.company||"—"}</td>
                        <td style={{ padding:"10px 14px" }}>{u.phone||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        const role = session.user.email === ADMIN_EMAIL ? "admin" : (profile?.role || "worker");
        setUser({ ...session.user, ...profile, role });
        setView(role === "admin" ? "admin" : "jobs");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") { setUser(null); setView("login"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setView(u.role === "admin" ? "admin" : "jobs");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("login");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:44, marginBottom:12 }}>💼</div>
        <Spinner />
      </div>
    </div>
  );

  if (view==="login") return <LoginView onLogin={handleLogin} onSignup={()=>setView("signup")} />;
  if (view==="signup") return <SignupView onBack={()=>setView("login")} />;
  if (view==="admin") return <AdminView user={user} onLogout={handleLogout} />;
  if (view==="post") return <PostJobView user={user} onBack={()=>setView("jobs")} />;
  return <JobsView user={user} onPost={()=>setView("post")} onLogout={handleLogout} />;
}
