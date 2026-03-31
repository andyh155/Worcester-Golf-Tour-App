"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../src/lib/supabase/client";
import Link from "next/link";

type DbEventRow = {
  id: number;
  name: string;
  event_date: string;
  course: string;
  format: string | null;
  status: string | null;
  registration_text: string | null;
  description: string | null;
};

type AppEvent = {
  id: number;
  name: string;
  date: string;
  course: string;
  format: string;
  status: string;
  registration: string;
  description: string;
};

type RegistrationRow = {
  id: number;
  event_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  status: string | null;
  created_at: string;
};

type PairingRow = {
  id: number;
  event_id: number;
  tee_time: string;
  player_name: string;
  group_number: number | null;
  created_at: string;
};

type ResultRow = {
  id: number;
  event_id: number;
  player_name: string;
  position: number | null;
  score: string | null;
  points: number | null;
  created_at: string;
};

const fallbackEvents: AppEvent[] = [
  {
    id: 1,
    name: "Spring Opener",
    date: "April 12, 2026",
    course: "Wachusett Country Club",
    format: "18-Hole Stroke Play",
    status: "Open",
    registration: "Pending / Confirmed / Waitlist",
    description:
      "Season-opening event with admin-managed pairings and post-round results entry.",
  },
  {
    id: 2,
    name: "May Major",
    date: "May 3, 2026",
    course: "Tatnuck Country Club",
    format: "Major Event",
    status: "Open",
    registration: "Pending / Confirmed / Waitlist",
    description:
      "Signature spring tournament with priority field management and published tee times.",
  },
  {
    id: 3,
    name: "Summer Classic",
    date: "June 7, 2026",
    course: "Pleasant Valley",
    format: "Season Points Event",
    status: "Coming Soon",
    registration: "Opens next month",
    description:
      "Mid-season event focused on points standings and polished player communications.",
  },
];

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getEventCapabilities(status: string) {
  return {
    isPublic: ["Open", "Coming Soon", "Closed", "Completed"].includes(status),
    canRegister: status === "Open",
    showPairings: status === "Closed" || status === "Completed",
    showResults: status === "Completed",
    isCancelled: false,
  };
}

export default function Page() {
  const supabase = useMemo(() => createClient(), []);

  const [page, setPage] = useState("home");
  const [events, setEvents] = useState<AppEvent[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState("");

  const [pairings, setPairings] = useState<PairingRow[]>([]);
  const [pairingsLoading, setPairingsLoading] = useState(true);
  const [pairingsError, setPairingsError] = useState("");

  const [results, setResults] = useState<ResultRow[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");

  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const [eventRegName, setEventRegName] = useState("");
  const [eventRegEmail, setEventRegEmail] = useState("");
  const [eventRegPhone, setEventRegPhone] = useState("");
  const [eventRegMessage, setEventRegMessage] = useState("");
  const [eventRegLoading, setEventRegLoading] = useState(false);

  const [pairingEventId, setPairingEventId] = useState<number>(1);
  const [pairingTeeTime, setPairingTeeTime] = useState("");
  const [pairingPlayerName, setPairingPlayerName] = useState("");
  const [pairingGroupNumber, setPairingGroupNumber] = useState("");
  const [pairingMessage, setPairingMessage] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);

  const [resultEventId, setResultEventId] = useState<number>(1);
  const [resultPlayerName, setResultPlayerName] = useState("");
  const [resultPosition, setResultPosition] = useState("");
  const [resultScore, setResultScore] = useState("");
  const [resultPoints, setResultPoints] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultLoading, setResultLoading] = useState(false);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = adminEmails.includes(currentUserEmail.toLowerCase());

  const brand = {
    navy: "#0B2A66",
    green: "#117A45",
    light: "#F6F8FB",
    border: "#DCE3EE",
    text: "#0f172a",
    muted: "#64748b",
  };

  const navItems: [string, string][] = [
    ["home", "Home"],
    ["join", "Join"],
    ["events", "Schedule"],
    ["standings", "Standings"],
    ["member", "Player Portal"],
    ...(isAdmin ? [["admin", "Admin"] as [string, string]] : []),
  ];

  useEffect(() => {
    async function loadAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserEmail(user?.email || "");
      setAuthLoading(false);
    }

    async function loadEvents() {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, event_date, course, format, status, registration_text, description"
        )
        .order("event_date", { ascending: true });

      if (error) {
        setEventsError(error.message);
        setEventsLoading(false);
        return;
      }

      const mapped: AppEvent[] =
        data?.map((event: DbEventRow) => ({
          id: event.id,
          name: event.name,
          date: formatDate(event.event_date),
          course: event.course,
          format: event.format || "Event Format TBD",
          status: event.status || "Open",
          registration:
            event.registration_text || "Registration details coming soon",
          description: event.description || "Event details coming soon",
        })) || [];

      if (mapped.length > 0) {
        setEvents(mapped);
        setSelectedEvent(0);
        setPairingEventId(mapped[0].id);
        setResultEventId(mapped[0].id);
      }

      setEventsLoading(false);
    }

    async function loadRegistrations() {
      const { data, error } = await supabase
        .from("registrations")
        .select("id, event_id, name, email, phone, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setRegistrationsError(error.message);
      } else {
        setRegistrations(data || []);
      }

      setRegistrationsLoading(false);
    }

    async function loadPairings() {
      const { data, error } = await supabase
        .from("pairings")
        .select("id, event_id, tee_time, player_name, group_number, created_at")
        .order("tee_time", { ascending: true });

      if (error) {
        setPairingsError(error.message);
      } else {
        setPairings(data || []);
      }

      setPairingsLoading(false);
    }

    async function loadResults() {
      const { data, error } = await supabase
        .from("results")
        .select("id, event_id, player_name, position, score, points, created_at")
        .order("position", { ascending: true });

      if (error) {
        setResultsError(error.message);
      } else {
        setResults(data || []);
      }

      setResultsLoading(false);
    }

    loadAuth();
    loadEvents();
    loadRegistrations();
    loadPairings();
    loadResults();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserEmail(session?.user?.email || "");
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function reloadRegistrations() {
    const { data, error } = await supabase
      .from("registrations")
      .select("id, event_id, name, email, phone, status, created_at")
      .order("created_at", { ascending: false });

    if (!error) setRegistrations(data || []);
  }

  async function reloadPairings() {
    const { data, error } = await supabase
      .from("pairings")
      .select("id, event_id, tee_time, player_name, group_number, created_at")
      .order("tee_time", { ascending: true });

    if (!error) setPairings(data || []);
  }

  async function reloadResults() {
    const { data, error } = await supabase
      .from("results")
      .select("id, event_id, player_name, position, score, points, created_at")
      .order("position", { ascending: true });

    if (!error) setResults(data || []);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUserEmail("");
    setPage("home");
  }

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJoinMessage("");

    if (!joinName || !joinEmail) {
      setJoinMessage("Please enter your name and email.");
      return;
    }

    setJoinLoading(true);

    const { error } = await supabase.from("registrations").insert([
      {
        event_id: null,
        name: joinName,
        email: joinEmail,
        phone: joinPhone,
        status: "Pending",
      },
    ]);

    if (error) {
      setJoinMessage(`Error: ${error.message}`);
    } else {
      setJoinMessage("Thanks! Your application was submitted.");
      setJoinName("");
      setJoinEmail("");
      setJoinPhone("");
      await reloadRegistrations();
    }

    setJoinLoading(false);
  }

  const currentEvent = events[selectedEvent] || fallbackEvents[0];
  const currentEventCapabilities = getEventCapabilities(currentEvent.status);

  async function handleEventRegistrationSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentEventCapabilities.canRegister) {
      setEventRegMessage("Registration is not open for this event.");
      return;
    }

    setEventRegMessage("");

    if (!eventRegName || !eventRegEmail) {
      setEventRegMessage("Please enter your name and email.");
      return;
    }

    setEventRegLoading(true);

    const { error } = await supabase.from("registrations").insert([
      {
        event_id: currentEvent.id,
        name: eventRegName,
        email: eventRegEmail,
        phone: eventRegPhone,
        status: "Pending",
      },
    ]);

    if (error) {
      setEventRegMessage(`Error: ${error.message}`);
    } else {
      setEventRegMessage("You are registered for this event.");
      setEventRegName("");
      setEventRegEmail("");
      setEventRegPhone("");
      await reloadRegistrations();
    }

    setEventRegLoading(false);
  }

  async function handleRegistrationStatusUpdate(
    registrationId: number,
    newStatus: string
  ) {
    const { error } = await supabase
      .from("registrations")
      .update({ status: newStatus })
      .eq("id", registrationId);

    if (error) {
      alert(`Error updating status: ${error.message}`);
      return;
    }

    await reloadRegistrations();
  }

  async function handlePairingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPairingMessage("");

    if (!pairingEventId || !pairingTeeTime || !pairingPlayerName) {
      setPairingMessage("Please choose an event, tee time, and player name.");
      return;
    }

    setPairingLoading(true);

    const { error } = await supabase.from("pairings").insert([
      {
        event_id: pairingEventId,
        tee_time: pairingTeeTime,
        player_name: pairingPlayerName,
        group_number: pairingGroupNumber ? Number(pairingGroupNumber) : null,
      },
    ]);

    if (error) {
      setPairingMessage(`Error: ${error.message}`);
    } else {
      setPairingMessage("Pairing saved.");
      setPairingTeeTime("");
      setPairingPlayerName("");
      setPairingGroupNumber("");
      await reloadPairings();
    }

    setPairingLoading(false);
  }

  async function handleResultSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResultMessage("");

    if (!resultEventId || !resultPlayerName) {
      setResultMessage("Please choose an event and enter a player name.");
      return;
    }

    setResultLoading(true);

    const { error } = await supabase.from("results").insert([
      {
        event_id: resultEventId,
        player_name: resultPlayerName,
        position: resultPosition ? Number(resultPosition) : null,
        score: resultScore || null,
        points: resultPoints ? Number(resultPoints) : null,
      },
    ]);

    if (error) {
      setResultMessage(`Error: ${error.message}`);
    } else {
      setResultMessage("Result saved.");
      setResultPlayerName("");
      setResultPosition("");
      setResultScore("");
      setResultPoints("");
      await reloadResults();
    }

    setResultLoading(false);
  }

  const counts = {
    confirmed: registrations.filter((r) => r.status === "Confirmed").length,
    pending: registrations.filter((r) => r.status === "Pending").length,
    waitlist: registrations.filter((r) => r.status === "Waitlist").length,
  };

  const currentEventPairings = pairings
    .filter((p) => p.event_id === currentEvent.id)
    .sort((a, b) => {
      if (a.tee_time === b.tee_time) {
        return (a.group_number || 0) - (b.group_number || 0);
      }
      return a.tee_time.localeCompare(b.tee_time);
    });

  const groupedPairings = currentEventPairings.reduce<
    Record<string, PairingRow[]>
  >((acc, pairing) => {
    const key = `${pairing.tee_time}|${pairing.group_number || 0}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pairing);
    return acc;
  }, {});

  const currentEventResults = results
    .filter((r) => r.event_id === currentEvent.id)
    .sort((a, b) => (a.position || 999) - (b.position || 999));

  const calculatedStandings = Object.values(
    results.reduce<
      Record<string, { player: string; points: number; played: number }>
    >((acc, row) => {
      const player = row.player_name;

      if (!acc[player]) {
        acc[player] = {
          player,
          points: 0,
          played: 0,
        };
      }

      acc[player].points += row.points ?? 0;
      acc[player].played += 1;

      return acc;
    }, {})
  ).sort((a, b) => b.points - a.points);

  const standingsRows = calculatedStandings.map((row, index) => ({
    rank: index + 1,
    player: row.player,
    points: row.points,
    played: row.played,
  }));

  const styles = {
    shell: {
      minHeight: "100vh",
      background: brand.light,
      color: brand.text,
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    } as const,
    card: {
      background: "white",
      border: `1px solid ${brand.border}`,
      borderRadius: 24,
      padding: 20,
      boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
    } as const,
    button: (primary: boolean, active?: boolean) =>
      ({
        border: primary || active ? "none" : `1px solid ${brand.border}`,
        background: active ? brand.navy : primary ? brand.green : "white",
        color: primary || active ? "white" : brand.text,
        borderRadius: 14,
        padding: "12px 16px",
        fontWeight: 600,
        cursor: "pointer",
      }) as const,
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 14,
      border: `1px solid ${brand.border}`,
      outline: "none",
      fontSize: 14,
      boxSizing: "border-box",
    } as const,
  };

  function Pill({ text, filled }: { text: string; filled?: boolean }) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: 999,
          border: filled ? "none" : `1px solid ${brand.border}`,
          background: filled ? brand.green : "white",
          color: filled ? "white" : brand.text,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
    );
  }

  function InfoBox({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ ...styles.card, padding: 16 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: brand.muted,
          }}
        >
          {label}
        </div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>
          {value}
        </div>
      </div>
    );
  }

  function Header() {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            height: 48,
            width: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.green} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          WGT
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: brand.muted,
            }}
          >
            Worcester Golf Tour
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: brand.navy }}>
            Simplified App
          </div>
        </div>
      </div>
    );
  }

  function renderHomePage() {
    return (
      <div>
        <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
          >
            <Header />
          </div>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0, color: brand.navy }}>
            Golfers Wanted.
          </h1>
          <p
            style={{
              maxWidth: 720,
              margin: "16px auto 0",
              color: brand.muted,
              fontSize: 18,
            }}
          >
            A clean first release focused on event management, pairings, post-round
            results, and season standings.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <button style={styles.button(true)} onClick={() => setPage("join")}>
              Join the Tour
            </button>
            <button style={styles.button(false)} onClick={() => setPage("events")}>
              View Schedule
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          <InfoBox label="Upcoming Events" value={String(events.length)} />
          <InfoBox label="Registration Model" value="Admin Confirmed" />
          <InfoBox label="Results" value="Post-Round Entry" />
        </div>
      </div>
    );
  }

  function renderJoinPage() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 32 }}>Join Worcester Golf Tour</h2>
            <p style={{ marginTop: 8, color: brand.muted }}>
              Simple onboarding for players interested in joining the tour and
              registering for events.
            </p>
          </div>
          <Pill text="Player Onboarding" filled />
        </div>

        <div style={{ ...styles.card, overflow: "hidden", padding: 0 }}>
          <div
            style={{
              padding: 20,
              background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.green} 100%)`,
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Become a Worcester Golf Tour Player
          </div>

          <form style={{ padding: 20 }} onSubmit={handleJoinSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <input
                style={styles.input}
                placeholder="Full name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Email address"
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Mobile phone"
                value={joinPhone}
                onChange={(e) => setJoinPhone(e.target.value)}
              />
            </div>

            {joinMessage && (
              <div
                style={{
                  marginTop: 16,
                  color: joinMessage.startsWith("Error") ? "red" : brand.green,
                }}
              >
                {joinMessage}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <div style={{ color: brand.muted, fontSize: 14 }}>
                Applications can be reviewed manually by the tour admin before approval.
              </div>
              <button type="submit" style={styles.button(true)} disabled={joinLoading}>
                {joinLoading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderEventsPage() {
    const publicEvents = events.filter(
      (event) => getEventCapabilities(event.status).isPublic
    );

    return (
      <div>
        <h2 style={{ margin: 0, fontSize: 32 }}>Schedule</h2>
        <p style={{ marginTop: 8, color: brand.muted }}>
          Browse tournaments, event details, and simple registration status without
          payments.
        </p>

        {eventsLoading && <p style={{ marginTop: 16 }}>Loading events...</p>}
        {eventsError && (
          <p style={{ marginTop: 16, color: "red" }}>
            Could not load live events. Showing fallback data. Error: {eventsError}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {publicEvents.map((event, index) => {
            const capabilities = getEventCapabilities(event.status);

            return (
              <div key={event.id} style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{event.name}</div>
                  <Pill text={event.status} filled={event.status === "Open"} />
                </div>

                <div style={{ color: brand.muted, marginTop: 4 }}>{event.course}</div>

                <div style={{ marginTop: 12, color: brand.muted, fontSize: 14 }}>
                  {event.date}
                </div>

                <div style={{ marginTop: 6 }}>{event.format}</div>

                <div style={{ marginTop: 10, color: brand.muted }}>
                  {event.description}
                </div>

                <div style={{ marginTop: 12, fontSize: 14 }}>
                  <strong>Registration:</strong> {event.registration}
                </div>

                <div style={{ marginTop: 16 }}>
                  {capabilities.canRegister && (
                    <button
                      style={styles.button(true)}
                      onClick={() => {
                        setSelectedEvent(index);
                        setEventRegMessage("");
                        setPage("member");
                      }}
                    >
                      Register
                    </button>
                  )}

                  {!capabilities.canRegister && event.status === "Closed" && (
                    <button style={styles.button(false)}>Registration Closed</button>
                  )}

                  {capabilities.showResults && (
                    <button
                      style={styles.button(false)}
                      onClick={() => {
                        setSelectedEvent(index);
                        setPage("member");
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStandingsPage() {
    return (
      <div>
        <h2 style={{ margin: 0, fontSize: 32 }}>Season Standings</h2>
        <p style={{ marginTop: 8, color: brand.muted }}>
          Points-based rankings that update automatically from event results.
        </p>

        {resultsLoading && <p style={{ marginTop: 16 }}>Loading standings...</p>}
        {resultsError && (
          <p style={{ marginTop: 16, color: "red" }}>
            Error loading standings: {resultsError}
          </p>
        )}
        {!resultsLoading && standingsRows.length === 0 && (
          <p style={{ marginTop: 16, color: brand.muted }}>
            No standings yet. Add results first.
          </p>
        )}

        <div style={{ ...styles.card, padding: 0, overflow: "hidden", marginTop: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 120px 120px",
              padding: 16,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: brand.muted,
              borderBottom: `1px solid ${brand.border}`,
            }}
          >
            <div>Rank</div>
            <div>Player</div>
            <div>Points</div>
            <div>Events</div>
          </div>
          {standingsRows.map((row) => (
            <div
              key={row.player}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 120px 120px",
                padding: 16,
                borderBottom: `1px solid ${brand.border}`,
              }}
            >
              <div>{row.rank}</div>
              <div>{row.player}</div>
              <div>{row.points}</div>
              <div>{row.played}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMemberPage() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 32 }}>Player Portal</h2>
          <p style={{ marginTop: 8, color: brand.muted }}>
            Players can register, view tee times, and review final results after an
            event.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
            gap: 16,
          }}
        >
          <div style={styles.card}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{currentEvent.name}</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              {currentEvent.course} • {currentEvent.date}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 16,
              }}
            >
              <InfoBox label="Format" value={currentEvent.format} />
              <InfoBox label="Registration" value={currentEvent.registration} />
            </div>

            <div
              style={{
                marginTop: 16,
                background: "#f8fafc",
                border: `1px solid ${brand.border}`,
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700 }}>Event overview</div>
              <div style={{ marginTop: 8, color: brand.muted }}>
                {currentEvent.description}
              </div>
            </div>

            {currentEventCapabilities.canRegister ? (
              <form onSubmit={handleEventRegistrationSubmit} style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  <input
                    style={styles.input}
                    placeholder="Your name"
                    value={eventRegName}
                    onChange={(e) => setEventRegName(e.target.value)}
                  />

                  <input
                    style={styles.input}
                    placeholder="Your email"
                    value={eventRegEmail}
                    onChange={(e) => setEventRegEmail(e.target.value)}
                  />

                  <input
                    style={styles.input}
                    placeholder="Your phone"
                    value={eventRegPhone}
                    onChange={(e) => setEventRegPhone(e.target.value)}
                  />
                </div>

                {eventRegMessage && (
                  <div
                    style={{
                      marginTop: 12,
                      color: eventRegMessage.startsWith("Error")
                        ? "red"
                        : brand.green,
                    }}
                  >
                    {eventRegMessage}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  <button
                    type="submit"
                    style={styles.button(true)}
                    disabled={eventRegLoading}
                  >
                    {eventRegLoading ? "Submitting..." : "Register for Event"}
                  </button>

                  {currentEventCapabilities.showPairings && (
                    <button type="button" style={styles.button(false)}>
                      See Tee Times
                    </button>
                  )}

                  {currentEventCapabilities.showResults && (
                    <button type="button" style={styles.button(false)}>
                      View Final Results
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  background: "#f8fafc",
                  border: `1px solid ${brand.border}`,
                  borderRadius: 18,
                  padding: 16,
                  color: brand.muted,
                }}
              >
                Registration is not open for this event.
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>My Season</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Simple player snapshot
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 10, color: brand.muted }}>
              <div>
                <strong style={{ color: brand.text }}>Status:</strong> Active player
              </div>
              <div>
                <strong style={{ color: brand.text }}>Registered Events:</strong> 2
              </div>
              <div>
                <strong style={{ color: brand.text }}>Best Finish:</strong> 2nd
              </div>
              <div>
                <strong style={{ color: brand.text }}>Season Points:</strong> 198
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Published Tee Times</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Live pairings for this event
            </div>

            {!currentEventCapabilities.showPairings ? (
              <p style={{ marginTop: 12, color: brand.muted }}>
                Tee times are not published yet for this event.
              </p>
            ) : (
              <>
                {pairingsLoading && <p style={{ marginTop: 12 }}>Loading pairings...</p>}
                {pairingsError && (
                  <p style={{ marginTop: 12, color: "red" }}>
                    Error loading pairings: {pairingsError}
                  </p>
                )}
                {!pairingsLoading && currentEventPairings.length === 0 && (
                  <p style={{ marginTop: 12, color: brand.muted }}>
                    No pairings published yet for this event.
                  </p>
                )}

                <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                  {Object.entries(groupedPairings).map(([key, group]) => (
                    <div
                      key={key}
                      style={{
                        border: `1px solid ${brand.border}`,
                        borderRadius: 18,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {group[0].tee_time}
                        {group[0].group_number ? ` • Group ${group[0].group_number}` : ""}
                      </div>
                      <div style={{ marginTop: 6, color: brand.muted }}>
                        {group.map((p) => p.player_name).join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Final Results</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Posted after the round by the admin
            </div>

            {!currentEventCapabilities.showResults ? (
              <p style={{ marginTop: 12, color: brand.muted }}>
                Results are not published yet for this event.
              </p>
            ) : (
              <>
                {resultsLoading && <p style={{ marginTop: 12 }}>Loading results...</p>}
                {resultsError && (
                  <p style={{ marginTop: 12, color: "red" }}>
                    Error loading results: {resultsError}
                  </p>
                )}
                {!resultsLoading && currentEventResults.length === 0 && (
                  <p style={{ marginTop: 12, color: brand.muted }}>
                    No results published yet for this event.
                  </p>
                )}

                <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                  {currentEventResults.map((row) => (
                    <div
                      key={row.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        border: `1px solid ${brand.border}`,
                        borderRadius: 18,
                        padding: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {row.position ? `${row.position}. ` : ""}
                          {row.player_name}
                        </div>
                        <div style={{ marginTop: 6, color: brand.muted }}>
                          Score {row.score || "-"}
                        </div>
                      </div>
                      <Pill text={`${row.points ?? 0} pts`} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderAdminPage() {
    if (authLoading) {
      return <p>Checking admin access...</p>;
    }

    if (!currentUserEmail) {
      return (
        <div style={{ display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 32 }}>Admin</h2>
          <p>Please log in to access admin tools.</p>
          <a href="/login">Go to Login</a>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div style={{ display: "grid", gap: 16 }}>
          <h2>Admin</h2>
          <p>Your account does not have admin access.</p>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 32 }}>Admin Dashboard</h2>
            <p style={{ marginTop: 8, color: brand.muted }}>
              Create events, approve registrations, publish pairings, and enter
              post-round results.
            </p>
          </div>
          <Pill text="Admin Controls" filled />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <InfoBox label="Confirmed" value={String(counts.confirmed)} />
          <InfoBox label="Pending" value={String(counts.pending)} />
          <InfoBox label="Waitlist" value={String(counts.waitlist)} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Registrations</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Approve and manage the field
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {registrationsLoading && <p>Loading registrations...</p>}

              {registrationsError && (
                <p style={{ color: "red" }}>
                  Error loading registrations: {registrationsError}
                </p>
              )}

              {!registrationsLoading &&
                !registrationsError &&
                registrations.length === 0 && (
                  <p style={{ color: brand.muted }}>No registrations yet.</p>
                )}

              {registrations.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    border: `1px solid ${brand.border}`,
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ marginTop: 6, color: brand.muted }}>{item.email}</div>
                    {item.phone && (
                      <div style={{ marginTop: 6, color: brand.muted }}>{item.phone}</div>
                    )}
                    {item.event_id && (
                      <div style={{ marginTop: 6, color: brand.muted }}>
                        Event:{" "}
                        {events.find((e) => e.id === item.event_id)?.name ||
                          `#${item.event_id}`}
                      </div>
                    )}
                    {!item.event_id && (
                      <div style={{ marginTop: 6, color: brand.muted }}>
                        General tour application
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                    <Pill
                      text={item.status || "Pending"}
                      filled={item.status === "Confirmed"}
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        style={styles.button(false)}
                        onClick={() =>
                          handleRegistrationStatusUpdate(item.id, "Pending")
                        }
                      >
                        Pending
                      </button>

                      <button
                        type="button"
                        style={styles.button(true)}
                        onClick={() =>
                          handleRegistrationStatusUpdate(item.id, "Confirmed")
                        }
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        style={styles.button(false)}
                        onClick={() =>
                          handleRegistrationStatusUpdate(item.id, "Waitlist")
                        }
                      >
                        Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Add Pairing</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Add players to tee times for an event
            </div>

            <form onSubmit={handlePairingSubmit} style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <select
                  style={styles.input}
                  value={pairingEventId}
                  onChange={(e) => setPairingEventId(Number(e.target.value))}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>

                <input
                  style={styles.input}
                  placeholder="Tee time (e.g. 8:00 AM)"
                  value={pairingTeeTime}
                  onChange={(e) => setPairingTeeTime(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Player name"
                  value={pairingPlayerName}
                  onChange={(e) => setPairingPlayerName(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Group number"
                  value={pairingGroupNumber}
                  onChange={(e) => setPairingGroupNumber(e.target.value)}
                />
              </div>

              {pairingMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: pairingMessage.startsWith("Error") ? "red" : brand.green,
                  }}
                >
                  {pairingMessage}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button type="submit" style={styles.button(true)} disabled={pairingLoading}>
                  {pairingLoading ? "Saving..." : "Save Pairing"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Saved Pairings</div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {pairingsLoading && <p>Loading pairings...</p>}
              {pairingsError && <p style={{ color: "red" }}>Error: {pairingsError}</p>}
              {!pairingsLoading && pairings.length === 0 && (
                <p style={{ color: brand.muted }}>No pairings yet.</p>
              )}

              {pairings.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `1px solid ${brand.border}`,
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{item.player_name}</div>
                  <div style={{ marginTop: 6, color: brand.muted }}>
                    {events.find((e) => e.id === item.event_id)?.name ||
                      `Event #${item.event_id}`}
                  </div>
                  <div style={{ marginTop: 6, color: brand.muted }}>
                    {item.tee_time}
                    {item.group_number ? ` • Group ${item.group_number}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Results Entry</div>
            <div style={{ color: brand.muted, marginTop: 4 }}>
              Save event results to the database
            </div>

            <form onSubmit={handleResultSubmit} style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <select
                  style={styles.input}
                  value={resultEventId}
                  onChange={(e) => setResultEventId(Number(e.target.value))}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>

                <input
                  style={styles.input}
                  placeholder="Player name"
                  value={resultPlayerName}
                  onChange={(e) => setResultPlayerName(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Position"
                  value={resultPosition}
                  onChange={(e) => setResultPosition(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Final score"
                  value={resultScore}
                  onChange={(e) => setResultScore(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Points"
                  value={resultPoints}
                  onChange={(e) => setResultPoints(e.target.value)}
                />
              </div>

              {resultMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: resultMessage.startsWith("Error") ? "red" : brand.green,
                  }}
                >
                  {resultMessage}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button type="submit" style={styles.button(true)} disabled={resultLoading}>
                  {resultLoading ? "Saving..." : "Save Result"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Saved Results</div>
              {resultsLoading && <p>Loading results...</p>}
              {resultsError && <p style={{ color: "red" }}>Error: {resultsError}</p>}
              {!resultsLoading && results.length === 0 && (
                <p style={{ color: brand.muted }}>No results yet.</p>
              )}

              <div style={{ display: "grid", gap: 10 }}>
                {results.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: `1px solid ${brand.border}`,
                      borderRadius: 18,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {item.position ? `${item.position}. ` : ""}
                      {item.player_name}
                    </div>
                    <div style={{ marginTop: 6, color: brand.muted }}>
                      {events.find((e) => e.id === item.event_id)?.name ||
                        `Event #${item.event_id}`}
                    </div>
                    <div style={{ marginTop: 6, color: brand.muted }}>
                      Score: {item.score || "-"} • Points: {item.points ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let content = renderHomePage();
  if (page === "join") content = renderJoinPage();
  if (page === "events") content = renderEventsPage();
  if (page === "standings") content = renderStandingsPage();
  if (page === "member") content = renderMemberPage();
  if (page === "admin") content = renderAdminPage();

  return (
    <div style={styles.shell}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            borderRight: `1px solid ${brand.border}`,
            background: "white",
            padding: 20,
          }}
        >
          <Header />

          <div style={{ color: brand.muted, marginTop: 12, fontSize: 14 }}>
            No payments. No live scoring. Just events, pairings, results, and standings.
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            {currentUserEmail ? (
              <>
                <div style={{ fontSize: 14, color: brand.muted }}>
                  Signed in as: {currentUserEmail}
                </div>
                <button type="button" style={styles.button(false)} onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/login"
                style={{
                  ...styles.button(false),
                  display: "inline-block",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Admin Login
              </a>
            )}
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
            {navItems.map(([id, label]) =>
              id === "admin" ? (
                <Link
                  key={id}
                  href="/admin"
                  style={{
                    ...styles.button(false, false),
                    textAlign: "left",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {label}
                </Link>
              ) : (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  style={{ ...styles.button(false, page === id), textAlign: "left" }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </aside>

        <main style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ color: brand.muted, fontSize: 14 }}>Current view</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: brand.navy }}>
                {navItems.find(([id]) => id === page)?.[1]}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill text="No payments" filled />
              <Pill text="No live scoring" />
            </div>
          </div>

          {content}
        </main>
      </div>
    </div>
  );
}