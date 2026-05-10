import { useState, useEffect } from "react";

const AUTH_URL = "https://functions.poehali.dev/9424784b-313d-4253-8027-0018619e33f2";
const PROFILE_URL = "https://functions.poehali.dev/5bf4e383-9065-431d-94a7-b2de63c5e1cd";
const CITIES_URL = "https://functions.poehali.dev/bf57efbf-5c36-4d3f-b92e-931d75944dad";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface PassengerProfile {
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string;
  gender: string;
  passport_series: string;
  passport_number: string;
  passport_issued_by: string;
  passport_issued_date: string;
  passport_expires_date: string;
  citizenship: string;
}

export interface City {
  id: number;
  city_name: string;
  country: string;
  iata_code: string;
  emoji: string;
  visited_at: string;
}

function getToken() {
  return localStorage.getItem("kompas_token");
}

function setToken(t: string) {
  localStorage.setItem("kompas_token", t);
}

function clearToken() {
  localStorage.removeItem("kompas_token");
}

let _globalUser: User | null = null;
const _listeners = new Set<(u: User | null) => void>();

function setGlobalUser(u: User | null) {
  _globalUser = u;
  _listeners.forEach(fn => fn(u));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(_globalUser);
  const [loading, setLoading] = useState(_globalUser === null && !!getToken());

  useEffect(() => {
    const syncUser = (u: User | null) => setUser(u);
    _listeners.add(syncUser);
    return () => { _listeners.delete(syncUser); };
  }, []);

  useEffect(() => {
    if (_globalUser) { setLoading(false); return; }
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetch(`${AUTH_URL}?action=me`, { headers: { "X-Auth-Token": token } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.id) setGlobalUser(parsed);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function register(email: string, password: string, first_name: string, last_name: string) {
    const r = await fetch(`${AUTH_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, first_name, last_name }),
    });
    const raw = await r.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data.token) {
      setToken(data.token);
      setGlobalUser(data.user);
      return { ok: true };
    }
    return { ok: false, error: data.error };
  }

  async function login(email: string, password: string) {
    const r = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const raw = await r.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data.token) {
      setToken(data.token);
      setGlobalUser(data.user);
      return { ok: true };
    }
    return { ok: false, error: data.error };
  }

  function logout() {
    clearToken();
    setGlobalUser(null);
  }

  async function getProfile(): Promise<PassengerProfile | null> {
    const token = getToken();
    if (!token) return null;
    const r = await fetch(PROFILE_URL, { headers: { "X-Auth-Token": token } });
    const raw = await r.json();
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }

  async function saveProfile(data: PassengerProfile) {
    const token = getToken();
    if (!token) return { ok: false };
    const r = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify(data),
    });
    const raw = await r.json();
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed;
  }

  async function getCities(): Promise<City[]> {
    const token = getToken();
    if (!token) return [];
    const r = await fetch(CITIES_URL, { headers: { "X-Auth-Token": token } });
    const raw = await r.json();
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed.cities || [];
  }

  async function addCity(city: Omit<City, "id" | "visited_at">) {
    const token = getToken();
    if (!token) return { ok: false };
    const r = await fetch(CITIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify(city),
    });
    const raw = await r.json();
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }

  async function removeCity(id: number) {
    const token = getToken();
    if (!token) return { ok: false };
    const r = await fetch(`${CITIES_URL}/${id}`, {
      method: "DELETE",
      headers: { "X-Auth-Token": token },
    });
    const raw = await r.json();
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }

  return { user, loading, register, login, logout, getProfile, saveProfile, getCities, addCity, removeCity };
}