const stack = [
  "Next.js on Cloud Run",
  "Supabase Postgres + Auth (EU)",
  "Drizzle ORM + migrations",
  "GitHub Actions CI/CD",
  "Cloud Logging + Monitoring"
];

export default function Home() {
  return (
    <main className="page">
      <h1>VPL MVP Foundation</h1>
      <p>GCP-first setup is locked for implementation.</p>
      <ul>
        {stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}

