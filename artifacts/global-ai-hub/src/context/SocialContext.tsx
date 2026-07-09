import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

export interface ToolSocialStats {
  likes: number;
  liked: boolean;
  comments: number;
  shares: number;
  bookmarked: boolean;
}

export interface HubNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface SocialState {
  stats: Record<string, ToolSocialStats>;
  hubPoints: number;
  notifications: HubNotification[];
}

interface SocialContextValue {
  getStats: (toolId: string) => ToolSocialStats;
  toggleLike: (toolId: string, toolName: string) => void;
  addComment: (toolId: string, toolName: string) => void;
  share: (toolId: string, toolName: string) => void;
  toggleBookmark: (toolId: string, toolName: string) => void;
  bookmarkedIds: string[];
  hubPoints: number;
  notifications: HubNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

const DEFAULT_STATE: SocialState = { stats: {}, hubPoints: 0, notifications: [] };

function seedStats(toolId: string): ToolSocialStats {
  // Deterministic pseudo-random baseline so counts look "alive" but stay stable per tool.
  let hash = 0;
  for (let i = 0; i < toolId.length; i++) hash = (hash * 31 + toolId.charCodeAt(i)) >>> 0;
  return {
    likes: 40 + (hash % 260),
    liked: false,
    comments: 3 + (hash % 40),
    shares: 1 + (hash % 20),
    bookmarked: false,
  };
}

function storageKey(userId: string | null) {
  return `gah-social-state:${userId ?? "guest"}`;
}

function loadState(userId: string | null): SocialState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as SocialState;
    return { stats: parsed.stats ?? {}, hubPoints: parsed.hubPoints ?? 0, notifications: parsed.notifications ?? [] };
  } catch {
    return DEFAULT_STATE;
  }
}

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<SocialState>(() => loadState(userId));

  useEffect(() => {
    setState(loadState(userId));
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // ignore storage failures (e.g. private mode quota)
    }
  }, [state, userId]);

  const getStats = useCallback(
    (toolId: string): ToolSocialStats => state.stats[toolId] ?? seedStats(toolId),
    [state.stats],
  );

  const notify = useCallback((message: string, points: number) => {
    setState((prev) => ({
      ...prev,
      hubPoints: prev.hubPoints + points,
      notifications: [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, message, createdAt: new Date().toISOString(), read: false },
        ...prev.notifications,
      ].slice(0, 30),
    }));
  }, []);

  const mutateStat = useCallback((toolId: string, mutator: (s: ToolSocialStats) => ToolSocialStats) => {
    setState((prev) => {
      const current = prev.stats[toolId] ?? seedStats(toolId);
      return { ...prev, stats: { ...prev.stats, [toolId]: mutator(current) } };
    });
  }, []);

  const toggleLike = useCallback((toolId: string, toolName: string) => {
    const current = state.stats[toolId] ?? seedStats(toolId);
    const nowLiked = !current.liked;
    mutateStat(toolId, (s) => ({ ...s, liked: nowLiked, likes: s.likes + (nowLiked ? 1 : -1) }));
    if (nowLiked) notify(`You liked ${toolName}. +5 Hub Points`, 5);
  }, [state.stats, mutateStat, notify]);

  const addComment = useCallback((toolId: string, toolName: string) => {
    mutateStat(toolId, (s) => ({ ...s, comments: s.comments + 1 }));
    notify(`You joined the discussion on ${toolName}. +3 Hub Points`, 3);
  }, [mutateStat, notify]);

  const share = useCallback((toolId: string, toolName: string) => {
    mutateStat(toolId, (s) => ({ ...s, shares: s.shares + 1 }));
    notify(`You shared ${toolName}. +8 Hub Points`, 8);
  }, [mutateStat, notify]);

  const toggleBookmark = useCallback((toolId: string, toolName: string) => {
    const current = state.stats[toolId] ?? seedStats(toolId);
    const nowBookmarked = !current.bookmarked;
    mutateStat(toolId, (s) => ({ ...s, bookmarked: nowBookmarked }));
    if (nowBookmarked) notify(`You bookmarked ${toolName}. +10 Hub Points`, 10);
    else notify(`Removed ${toolName} from your bookmarks.`, 0);
  }, [state.stats, mutateStat, notify]);

  const markAllRead = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const bookmarkedIds = useMemo(
    () => Object.entries(state.stats).filter(([, s]) => s.bookmarked).map(([id]) => id),
    [state.stats],
  );

  const unreadCount = useMemo(() => state.notifications.filter((n) => !n.read).length, [state.notifications]);

  return (
    <SocialContext.Provider
      value={{
        getStats,
        toggleLike,
        addComment,
        share,
        toggleBookmark,
        bookmarkedIds,
        hubPoints: state.hubPoints,
        notifications: state.notifications,
        unreadCount,
        markAllRead,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used inside <SocialProvider>");
  return ctx;
}
