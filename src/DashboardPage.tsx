import { useState, type FormEvent } from "react";
import { logout } from "wasp/client/auth";
import { useQuery, getSites, addSite } from "wasp/client/operations";

export function DashboardPage() {
  const { data, isLoading, error } = useQuery(getSites);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!label || !url) return;
    await addSite({ label, url });
    setLabel("");
    setUrl("");
  }

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Watchtower</h1>
        <button onClick={logout}>Log out</button>
      </header>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="submit">Add site</button>
      </form>

      <h2>My sites</h2>
      <ul>
        {data!.sites.map((s) => (
          <li key={s.id}>
            <strong>{s.label}</strong> — {s.url}
            {s.lastCheckedAt && ` (checked ${new Date(s.lastCheckedAt).toLocaleString()})`}
          </li>
        ))}
      </ul>

      <h2>Last 10 checks</h2>
      <ul>
        {data!.recentChecks.map((c) => (
          <li key={c.id}>
            [{c.status}] {c.site.label} — {new Date(c.createdAt).toLocaleString()}
            {c.note && ` — ${c.note}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
