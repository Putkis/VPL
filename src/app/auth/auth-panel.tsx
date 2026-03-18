"use client";

import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { clearViewerEmail, setViewerEmail } from "../../lib/game/viewer-identity";
import { getSupabaseClient } from "../../lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";
type AuthStatus = "idle" | "submitting" | "success" | "error";

function getHeadline(mode: AuthMode) {
  return mode === "sign-up" ? "Luo tili" : "Kirjaudu sisaan";
}

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [message, setMessage] = useState(
    "Supabase Auth hoitaa salasanan hashauksen ja session sailytyksen."
  );

  function resolveSupabaseClient() {
    try {
      const supabase = getSupabaseClient();
      setIsConfigured(true);
      return supabase;
    } catch {
      setIsConfigured(false);
      setStatus("error");
      setMessage(
        "Supabase-ymparistomuuttujat puuttuvat. Lisaa NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY testataksesi kirjautumista."
      );
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;
    const supabase = resolveSupabaseClient();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        if (data.session?.user.email) {
          setViewerEmail(data.session.user.email);
        }
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.email) {
        setViewerEmail(nextSession.user.email);
      } else {
        clearViewerEmail();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = resolveSupabaseClient();

    if (!supabase) {
      return;
    }

    if (password.trim().length < 8) {
      setStatus("error");
      setMessage("Salasanan on oltava vahintaan 8 merkkia.");
      return;
    }

    setStatus("submitting");
    setMessage("Kasitellaan pyyntoa...");

    const action =
      mode === "sign-up"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

    const { error, data } = await action;
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setSession(data.session ?? null);
    if (data.session?.user.email) {
      setViewerEmail(data.session.user.email);
    }
    setStatus("success");
    setMessage(
      mode === "sign-up"
        ? "Tili luotu. Tarkista sahkopostivahvistus, jos projekti vaatii sen."
        : "Kirjautuminen onnistui."
    );
  }

  async function handleSignOut() {
    const supabase = resolveSupabaseClient();

    if (!supabase) {
      return;
    }

    setStatus("submitting");
    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setSession(null);
    clearViewerEmail();
    setStatus("success");
    setMessage("Kirjauduit ulos onnistuneesti.");
  }

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Auth / Supabase</p>
        <h1>{getHeadline(mode)}</h1>
        <p className="lead">
          Perus-auth emaililla ja salasanalla. Sessio sailyy Supabasen selainasiakkaassa
          sivun paivitysten yli.
        </p>
      </div>

      <div className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-up"}
            className={mode === "sign-up" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("sign-up");
              setStatus("idle");
              setMessage("Luo uusi tili testikayttoon.");
            }}
          >
            Rekisteroidy
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-in"}
            className={mode === "sign-in" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("sign-in");
              setStatus("idle");
              setMessage("Kirjaudu olemassa olevalla tililla.");
            }}
          >
            Kirjaudu
          </button>
        </div>

        {session ? (
          <div className="auth-session">
            <p className="auth-session-label">Aktiivinen kayttaja</p>
            <strong>{session.user.email}</strong>
            <p className="status status-success">{message}</p>
            <button type="button" className="auth-submit" onClick={handleSignOut}>
              Kirjaudu ulos
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">Sahkoposti</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="auth-password">Salasana</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={status === "submitting" || !isConfigured}
            >
              {status === "submitting"
                ? "Kasitellaan..."
                : mode === "sign-up"
                ? "Luo tili"
                : "Kirjaudu sisaan"}
            </button>
            <p className={`status status-${status}`} role="status">
              {message}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
