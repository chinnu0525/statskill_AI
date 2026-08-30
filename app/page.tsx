const gaps = [
  ["GIS", "High priority"],
  ["AI / ML", "High priority"],
  ["Python", "Medium priority"]
];
const courses = [
  ["Python for Official Statistics", 62],
  ["GIS Fundamentals", 34],
  ["AI / ML Foundations", 18]
];

export default function Home() {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">StatSkill AI</div>
      <nav className="nav" aria-label="Primary navigation">
        <a className="active" href="#dashboard">Dashboard</a><a href="#skills">My Skills</a><a href="#learning">Learning</a><a href="#assessments">Assessments</a><a href="#assistant">AI Assistant</a>
      </nav>
      <div className="language">Language<br/><strong>English · हिन्दी · తెలుగు</strong></div>
    </aside>
    <main className="main" id="dashboard">
      <header className="top"><div><p className="eyebrow">Learner workspace</p><h1 className="h1">Good morning</h1></div><button className="lang" aria-label="Change language">English ▾</button></header>
      <section className="grid" aria-label="Competency overview">
        <article className="card"><div className="label">Overall competency</div><div className="score">68%</div><div className="muted">+6% since last assessment</div></article>
        <article className="card"><div className="label">Priority skills to improve</div>{gaps.map(([name,p])=><div className="gap" key={name}><span>{name}</span><span className="priority">{p}</span></div>)}</article>
        <article className="card"><div className="label">Recommended next</div><strong>Python for Official Statistics</strong><div className="muted">Continue from where you stopped</div><div className="action">Continue learning →</div></article>
      </section>
      <h2 className="section" id="learning">Your learning path</h2>
      <section className="card">{courses.map(([name,p])=><div className="course" key={name}><div><strong>{name}</strong><div className="progress" aria-label={`${p}% complete`}><span style={{width:`${p}%`}} /></div></div><span className="muted">{p}%</span></div>)}</section>
    </main>
  </div>;
}
