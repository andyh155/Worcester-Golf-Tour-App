"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

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
  rawDate: string;
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

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState("");

  const [pairings, setPairings] = useState<PairingRow[]>([]);
  const [pairingsLoading, setPairingsLoading] = useState(true);
  const [pairingsError, setPairingsError] = useState("");

  const [results, setResults] = useState<ResultRow[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");

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

  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventCourse, setNewEventCourse] = useState("");
  const [newEventFormat, setNewEventFormat] = useState("");
  const [newEventStatus, setNewEventStatus] = useState("Open");
  const [newEventRegistrationText, setNewEventRegistrationText] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventMessage, setNewEventMessage] = useState("");
  const [newEventLoading, setNewEventLoading] = useState(false);

  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventCourse, setEditEventCourse] = useState("");
  const [editEventFormat, setEditEventFormat] = useState("");
  const [editEventStatus, setEditEventStatus] = useState("Open");
  const [editEventRegistrationText, setEditEventRegistrationText] = useState("");
  const [editEventDescription, setEditEventDescription] = useState("");
  const [editEventMessage, setEditEventMessage] = useState("");
  const [editEventLoading, setEditEventLoading] = useState(false);

  const [editingPairingId, setEditingPairingId] = useState<number | null>(null);
  const [editPairingEventId, setEditPairingEventId] = useState<number>(1);
  const [editPairingTeeTime, setEditPairingTeeTime] = useState("");
  const [editPairingPlayerName, setEditPairingPlayerName] = useState("");
  const [editPairingGroupNumber, setEditPairingGroupNumber] = useState("");
  const [editPairingMessage, setEditPairingMessage] = useState("");
  const [editPairingLoading, setEditPairingLoading] = useState(false);

  const [editingResultId, setEditingResultId] = useState<number | null>(null);
  const [editResultEventId, setEditResultEventId] = useState<number>(1);
  const [editResultPlayerName, setEditResultPlayerName] = useState("");
  const [editResultPosition, setEditResultPosition] = useState("");
  const [editResultScore, setEditResultScore] = useState("");
  const [editResultPoints, setEditResultPoints] = useState("");
  const [editResultMessage, setEditResultMessage] = useState("");
  const [editResultLoading, setEditResultLoading] = useState(false);

  const brand = {
    navy: "#0B2A66",
    green: "#117A45",
    light: "#F6F8FB",
    border: "#DCE3EE",
    text: "#0f172a",
    muted: "#64748b",
  };

  const styles = {
    shell: {
      minHeight: "100vh",
      background: brand.light,
      color: brand.text,
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      padding: 24,
    } as const,
    card: {
      background: "white",
      border: `1px solid ${brand.border}`,
      borderRadius: 24,
      padding: 20,
      boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
    } as const,
    button: (primary: boolean) =>
      ({
        border: primary ? "none" : `1px solid ${brand.border}`,
        background: primary ? brand.green : "white",
        color: primary ? "white" : brand.text,
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
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{value}</div>
      </div>
    );
  }

  async function loadEvents() {
    setEventsLoading(true);
    setEventsError("");

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
        rawDate: event.event_date,
        course: event.course,
        format: event.format || "Event Format TBD",
        status: event.status || "Open",
        registration:
          event.registration_text || "Registration details coming soon",
        description: event.description || "Event details coming soon",
      })) || [];

    setEvents(mapped);

    if (mapped.length > 0) {
      setPairingEventId((current) =>
        mapped.some((event) => event.id === current) ? current : mapped[0].id
      );
      setResultEventId((current) =>
        mapped.some((event) => event.id === current) ? current : mapped[0].id
      );
    }

    setEventsLoading(false);
  }

  async function loadRegistrations() {
    setRegistrationsLoading(true);
    setRegistrationsError("");

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
    setPairingsLoading(true);
    setPairingsError("");

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
    setResultsLoading(true);
    setResultsError("");

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

  useEffect(() => {
    async function checkAdminAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentEmail = user?.email?.toLowerCase() || "";
      setEmail(currentEmail);

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const isAdmin = !!user && adminEmails.includes(currentEmail);

      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      if (!isAdmin) {
        setLoading(false);
        router.replace("/");
        return;
      }

      setAuthorized(true);
      setLoading(false);

      await Promise.all([
        loadEvents(),
        loadRegistrations(),
        loadPairings(),
        loadResults(),
      ]);
    }

    checkAdminAndLoad();
  }, [router, supabase]);

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

    await loadRegistrations();
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
      await loadPairings();
    }

    setPairingLoading(false);
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setNewEventMessage("");

    if (!newEventName || !newEventDate || !newEventCourse) {
      setNewEventMessage("Please enter event name, date, and course.");
      return;
    }

    setNewEventLoading(true);

    const { error } = await supabase.from("events").insert([
      {
        name: newEventName,
        event_date: newEventDate,
        course: newEventCourse,
        format: newEventFormat || null,
        status: newEventStatus || "Open",
        registration_text: newEventRegistrationText || null,
        description: newEventDescription || null,
      },
    ]);

    if (error) {
      setNewEventMessage(`Error: ${error.message}`);
    } else {
      setNewEventMessage("Event created successfully.");
      setNewEventName("");
      setNewEventDate("");
      setNewEventCourse("");
      setNewEventFormat("");
      setNewEventStatus("Open");
      setNewEventRegistrationText("");
      setNewEventDescription("");
      await loadEvents();
    }

    setNewEventLoading(false);
  }

  function startEditingEvent(event: AppEvent) {
    setEditingEventId(event.id);
    setEditEventName(event.name);
    setEditEventDate(event.rawDate);
    setEditEventCourse(event.course);
    setEditEventFormat(event.format === "Event Format TBD" ? "" : event.format);
    setEditEventStatus(event.status || "Open");
    setEditEventRegistrationText(
      event.registration === "Registration details coming soon"
        ? ""
        : event.registration
    );
    setEditEventDescription(
      event.description === "Event details coming soon" ? "" : event.description
    );
    setEditEventMessage("");
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    setEditEventMessage("");

    if (!editingEventId) {
      setEditEventMessage("No event selected.");
      return;
    }

    if (!editEventName || !editEventDate || !editEventCourse) {
      setEditEventMessage("Please enter event name, date, and course.");
      return;
    }

    setEditEventLoading(true);

    const { error } = await supabase
      .from("events")
      .update({
        name: editEventName,
        event_date: editEventDate,
        course: editEventCourse,
        format: editEventFormat || null,
        status: editEventStatus || "Open",
        registration_text: editEventRegistrationText || null,
        description: editEventDescription || null,
      })
      .eq("id", editingEventId);

    if (error) {
      setEditEventMessage(`Error: ${error.message}`);
    } else {
      setEditEventMessage("Event updated successfully.");
      await loadEvents();
    }

    setEditEventLoading(false);
  }

  async function handleDeleteEvent(eventId: number) {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      alert(`Error deleting event: ${error.message}`);
      return;
    }

    if (editingEventId === eventId) {
      setEditingEventId(null);
      setEditEventName("");
      setEditEventDate("");
      setEditEventCourse("");
      setEditEventFormat("");
      setEditEventStatus("Open");
      setEditEventRegistrationText("");
      setEditEventDescription("");
      setEditEventMessage("");
    }

    await loadEvents();
  }

  function startEditingPairing(pairing: PairingRow) {
    setEditingPairingId(pairing.id);
    setEditPairingEventId(pairing.event_id);
    setEditPairingTeeTime(pairing.tee_time);
    setEditPairingPlayerName(pairing.player_name);
    setEditPairingGroupNumber(
      pairing.group_number !== null ? String(pairing.group_number) : ""
    );
    setEditPairingMessage("");
  }

  async function handleUpdatePairing(e: React.FormEvent) {
    e.preventDefault();
    setEditPairingMessage("");

    if (!editingPairingId) {
      setEditPairingMessage("No pairing selected.");
      return;
    }

    if (!editPairingEventId || !editPairingTeeTime || !editPairingPlayerName) {
      setEditPairingMessage("Please choose an event, tee time, and player name.");
      return;
    }

    setEditPairingLoading(true);

    const { error } = await supabase
      .from("pairings")
      .update({
        event_id: editPairingEventId,
        tee_time: editPairingTeeTime,
        player_name: editPairingPlayerName,
        group_number: editPairingGroupNumber ? Number(editPairingGroupNumber) : null,
      })
      .eq("id", editingPairingId);

    if (error) {
      setEditPairingMessage(`Error: ${error.message}`);
    } else {
      setEditPairingMessage("Pairing updated successfully.");
      await loadPairings();
    }

    setEditPairingLoading(false);
  }

  async function handleDeletePairing(pairingId: number) {
    const confirmed = window.confirm("Delete this pairing?");
    if (!confirmed) return;

    const { error } = await supabase.from("pairings").delete().eq("id", pairingId);

    if (error) {
      alert(`Error deleting pairing: ${error.message}`);
      return;
    }

    if (editingPairingId === pairingId) {
      setEditingPairingId(null);
      setEditPairingEventId(events[0]?.id || 1);
      setEditPairingTeeTime("");
      setEditPairingPlayerName("");
      setEditPairingGroupNumber("");
      setEditPairingMessage("");
    }

    await loadPairings();
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
      await loadResults();
    }

    setResultLoading(false);
  }

  function startEditingResult(result: ResultRow) {
    setEditingResultId(result.id);
    setEditResultEventId(result.event_id);
    setEditResultPlayerName(result.player_name);
    setEditResultPosition(result.position !== null ? String(result.position) : "");
    setEditResultScore(result.score || "");
    setEditResultPoints(result.points !== null ? String(result.points) : "");
    setEditResultMessage("");
  }

  async function handleUpdateResult(e: React.FormEvent) {
    e.preventDefault();
    setEditResultMessage("");

    if (!editingResultId) {
      setEditResultMessage("No result selected.");
      return;
    }

    if (!editResultEventId || !editResultPlayerName) {
      setEditResultMessage("Please choose an event and enter a player name.");
      return;
    }

    setEditResultLoading(true);

    const { error } = await supabase
      .from("results")
      .update({
        event_id: editResultEventId,
        player_name: editResultPlayerName,
        position: editResultPosition ? Number(editResultPosition) : null,
        score: editResultScore || null,
        points: editResultPoints ? Number(editResultPoints) : null,
      })
      .eq("id", editingResultId);

    if (error) {
      setEditResultMessage(`Error: ${error.message}`);
    } else {
      setEditResultMessage("Result updated successfully.");
      await loadResults();
    }

    setEditResultLoading(false);
  }

  async function handleDeleteResult(resultId: number) {
    const confirmed = window.confirm("Delete this result?");
    if (!confirmed) return;

    const { error } = await supabase.from("results").delete().eq("id", resultId);

    if (error) {
      alert(`Error deleting result: ${error.message}`);
      return;
    }

    if (editingResultId === resultId) {
      setEditingResultId(null);
      setEditResultEventId(events[0]?.id || 1);
      setEditResultPlayerName("");
      setEditResultPosition("");
      setEditResultScore("");
      setEditResultPoints("");
      setEditResultMessage("");
    }

    await loadResults();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const counts = {
    confirmed: registrations.filter((r) => r.status === "Confirmed").length,
    pending: registrations.filter((r) => r.status === "Pending").length,
    waitlist: registrations.filter((r) => r.status === "Waitlist").length,
  };

  if (loading) {
    return <main style={{ padding: 40 }}>Checking admin access...</main>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div style={styles.shell}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: brand.navy }}>Admin Dashboard</h1>
          <p style={{ marginTop: 8, color: brand.muted }}>Signed in as: {email}</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              ...styles.button(false),
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Back to Site
          </Link>
          <button type="button" style={styles.button(false)} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
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
          marginBottom: 20,
        }}
      >
        <div style={styles.card}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Create Event</div>
          <div style={{ color: brand.muted, marginTop: 4 }}>
            Add a new tournament to the season schedule
          </div>

          <form onSubmit={handleCreateEvent} style={{ marginTop: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <input
                style={styles.input}
                placeholder="Event name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
              />

              <input
                type="date"
                style={styles.input}
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Course"
                value={newEventCourse}
                onChange={(e) => setNewEventCourse(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Format"
                value={newEventFormat}
                onChange={(e) => setNewEventFormat(e.target.value)}
              />

              <select
                style={styles.input}
                value={newEventStatus}
                onChange={(e) => setNewEventStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Closed">Closed</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                style={styles.input}
                placeholder="Registration text"
                value={newEventRegistrationText}
                onChange={(e) => setNewEventRegistrationText(e.target.value)}
              />
            </div>

            <textarea
              style={{
                ...styles.input,
                marginTop: 12,
                minHeight: 110,
                resize: "vertical",
              }}
              placeholder="Event description"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
            />

            {newEventMessage && (
              <div
                style={{
                  marginTop: 12,
                  color: newEventMessage.startsWith("Error") ? "red" : brand.green,
                }}
              >
                {newEventMessage}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                style={styles.button(true)}
                disabled={newEventLoading}
              >
                {newEventLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Events</div>
          <div style={{ color: brand.muted, marginTop: 4 }}>
            Edit or remove tournaments from the schedule
          </div>

          {eventsLoading && <p style={{ marginTop: 12 }}>Loading events...</p>}
          {eventsError && (
            <p style={{ marginTop: 12, color: "red" }}>Error: {eventsError}</p>
          )}

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  border: `1px solid ${brand.border}`,
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700 }}>{event.name}</div>
                <div style={{ marginTop: 6, color: brand.muted }}>
                  {event.course} • {event.date}
                </div>
                <div style={{ marginTop: 6, color: brand.muted }}>
                  {event.format} • {event.status}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <button
                    type="button"
                    style={styles.button(true)}
                    onClick={() => startEditingEvent(event)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.button(false)}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingEventId && (
            <form
              onSubmit={handleUpdateEvent}
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: `1px solid ${brand.border}`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>Edit Event</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <input
                  style={styles.input}
                  placeholder="Event name"
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                />

                <input
                  type="date"
                  style={styles.input}
                  value={editEventDate}
                  onChange={(e) => setEditEventDate(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Course"
                  value={editEventCourse}
                  onChange={(e) => setEditEventCourse(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Format"
                  value={editEventFormat}
                  onChange={(e) => setEditEventFormat(e.target.value)}
                />

                <select
                  style={styles.input}
                  value={editEventStatus}
                  onChange={(e) => setEditEventStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Closed">Closed</option>
                  <option value="Completed">Completed</option>
                </select>

                <input
                  style={styles.input}
                  placeholder="Registration text"
                  value={editEventRegistrationText}
                  onChange={(e) => setEditEventRegistrationText(e.target.value)}
                />
              </div>

              <textarea
                style={{
                  ...styles.input,
                  marginTop: 12,
                  minHeight: 110,
                  resize: "vertical",
                }}
                placeholder="Event description"
                value={editEventDescription}
                onChange={(e) => setEditEventDescription(e.target.value)}
              />

              {editEventMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: editEventMessage.startsWith("Error") ? "red" : brand.green,
                  }}
                >
                  {editEventMessage}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  type="submit"
                  style={styles.button(true)}
                  disabled={editEventLoading}
                >
                  {editEventLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  style={styles.button(false)}
                  onClick={() => {
                    setEditingEventId(null);
                    setEditEventName("");
                    setEditEventDate("");
                    setEditEventCourse("");
                    setEditEventFormat("");
                    setEditEventStatus("Open");
                    setEditEventRegistrationText("");
                    setEditEventDescription("");
                    setEditEventMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
          marginBottom: 20,
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
              <p style={{ color: "red" }}>Error: {registrationsError}</p>
            )}
            {!registrationsLoading && registrations.length === 0 && (
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
                      onClick={() => handleRegistrationStatusUpdate(item.id, "Pending")}
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      style={styles.button(true)}
                      onClick={() => handleRegistrationStatusUpdate(item.id, "Confirmed")}
                    >
                      Confirm
                    </button>

                    <button
                      type="button"
                      style={styles.button(false)}
                      onClick={() => handleRegistrationStatusUpdate(item.id, "Waitlist")}
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

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <button
                    type="button"
                    style={styles.button(true)}
                    onClick={() => startEditingPairing(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.button(false)}
                    onClick={() => handleDeletePairing(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingPairingId && (
            <form
              onSubmit={handleUpdatePairing}
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: `1px solid ${brand.border}`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>Edit Pairing</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <select
                  style={styles.input}
                  value={editPairingEventId}
                  onChange={(e) => setEditPairingEventId(Number(e.target.value))}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>

                <input
                  style={styles.input}
                  placeholder="Tee time"
                  value={editPairingTeeTime}
                  onChange={(e) => setEditPairingTeeTime(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Player name"
                  value={editPairingPlayerName}
                  onChange={(e) => setEditPairingPlayerName(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Group number"
                  value={editPairingGroupNumber}
                  onChange={(e) => setEditPairingGroupNumber(e.target.value)}
                />
              </div>

              {editPairingMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: editPairingMessage.startsWith("Error") ? "red" : brand.green,
                  }}
                >
                  {editPairingMessage}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  type="submit"
                  style={styles.button(true)}
                  disabled={editPairingLoading}
                >
                  {editPairingLoading ? "Saving..." : "Save Pairing Changes"}
                </button>

                <button
                  type="button"
                  style={styles.button(false)}
                  onClick={() => {
                    setEditingPairingId(null);
                    setEditPairingEventId(events[0]?.id || 1);
                    setEditPairingTeeTime("");
                    setEditPairingPlayerName("");
                    setEditPairingGroupNumber("");
                    setEditPairingMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Saved Results</div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {resultsLoading && <p>Loading results...</p>}
            {resultsError && <p style={{ color: "red" }}>Error: {resultsError}</p>}
            {!resultsLoading && results.length === 0 && (
              <p style={{ color: brand.muted }}>No results yet.</p>
            )}

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

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <button
                    type="button"
                    style={styles.button(true)}
                    onClick={() => startEditingResult(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.button(false)}
                    onClick={() => handleDeleteResult(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingResultId && (
            <form
              onSubmit={handleUpdateResult}
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: `1px solid ${brand.border}`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>Edit Result</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <select
                  style={styles.input}
                  value={editResultEventId}
                  onChange={(e) => setEditResultEventId(Number(e.target.value))}
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
                  value={editResultPlayerName}
                  onChange={(e) => setEditResultPlayerName(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Position"
                  value={editResultPosition}
                  onChange={(e) => setEditResultPosition(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Final score"
                  value={editResultScore}
                  onChange={(e) => setEditResultScore(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Points"
                  value={editResultPoints}
                  onChange={(e) => setEditResultPoints(e.target.value)}
                />
              </div>

              {editResultMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: editResultMessage.startsWith("Error") ? "red" : brand.green,
                  }}
                >
                  {editResultMessage}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  type="submit"
                  style={styles.button(true)}
                  disabled={editResultLoading}
                >
                  {editResultLoading ? "Saving..." : "Save Result Changes"}
                </button>

                <button
                  type="button"
                  style={styles.button(false)}
                  onClick={() => {
                    setEditingResultId(null);
                    setEditResultEventId(events[0]?.id || 1);
                    setEditResultPlayerName("");
                    setEditResultPosition("");
                    setEditResultScore("");
                    setEditResultPoints("");
                    setEditResultMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}