import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/context/AuthContext";

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
  getStats: (entityId: string) => ToolSocialStats;
  toggleLike: (entityId: string, entityType: string, toolName: string) => void;
  addComment: (entityId: string, entityType: string, toolName: string, content: string, parentId?: string) => Promise<void>;
  share: (entityId: string, entityType: string, toolName: string) => void;
  toggleBookmark: (entityId: string, entityType: string, toolName: string) => void;
  loadStats: (entityId: string, entityType: string) => void;
  bookmarkedIds: string[];
  hubPoints: number;
  notifications: HubNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

const DEFAULT_STATE: SocialState = { stats: {}, hubPoints: 0, notifications: [] };

function seedStats(entityId: string): ToolSocialStats {
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) hash = (hash * 31 + entityId.charCodeAt(i)) >>> 0;
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
  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setState(loadState(userId));
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }, [state, userId]);

  const getStats = useCallback(
    (entityId: string): ToolSocialStats => state.stats[entityId] ?? seedStats(entityId),
    [state.stats],
  );

  /** Load real stats from the server for a specific entity (debounced per entity). */
  const loadStats = useCallback((entityId: string, _entityType: string) => {
    if (fetchingRef.current.has(entityId)) return;
    fetchingRef.current.add(entityId);
    apiFetch(`/interactions/stats?entityId=${encodeURIComponent(entityId)}`)
      .then((data: { likes: number; comments: number; shares: number; liked: boolean; bookmarked: boolean }) => {
        setState((prev) => {
          const current = prev.stats[entityId] ?? seedStats(entityId);
          return {
            ...prev,
            stats: {
              ...prev.stats,
              [entityId]: {
                likes: current.likes + data.likes,
                liked: data.liked,
                comments: current.comments + data.comments,
                shares: current.shares + data.shares,
                bookmarked: data.bookmarked,
              },
            },
          };
        });
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => fetchingRef.current.delete(entityId), 30000);
      });
  }, []);

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

  const mutateStat = useCallback((entityId: string, mutator: (s: ToolSocialStats) => ToolSocialStats) => {
    setState((prev) => {
      const current = prev.stats[entityId] ?? seedStats(entityId);
      return { ...prev, stats: { ...prev.stats, [entityId]: mutator(current) } };
    });
  }, []);

  const toggleLike = useCallback((entityId: string, entityType: string, toolName: string) => {
    const current = state.stats[entityId] ?? seedStats(entityId);
    const nowLiked = !current.liked;
    mutateStat(entityId, (s) => ({ ...s, liked: nowLiked, likes: s.likes + (nowLiked ? 1 : -1) }));
    if (nowLiked) notify(`You liked ${toolName}. +5 Hub Points`, 5);
    if (userId) {
      apiFetch("/interactions/toggle", { method: "POST", body: JSON.stringify({ entityId, entityType, action: "like" }) }).catch(() => {});
    }
  }, [state.stats, mutateStat, notify, userId]);

  const addComment = useCallback(async (entityId: string, entityType: string, toolName: string, content: string, parentId?: string): Promise<void> => {
    if (!content.trim()) return;
    // Only bump the visible counter for top-level comments (replies are nested)
    if (!parentId) mutateStat(entityId, (s) => ({ ...s, comments: s.comments + 1 }));
    notify(`You commented on ${toolName}. +3 Hub Points`, 3);
    if (userId) {
      await apiFetch("/interactions/comment", { method: "POST", body: JSON.stringify({ entityId, entityType, content, parentId }) }).catch(() => {});
    }
  }, [mutateStat, notify, userId]);

  const share = useCallback((entityId: string, entityType: string, toolName: string) => {
    mutateStat(entityId, (s) => ({ ...s, shares: s.shares + 1 }));
    notify(`You shared ${toolName}. +8 Hub Points`, 8);
    apiFetch("/interactions/share", { method: "POST", body: JSON.stringify({ entityId, entityType }) }).catch(() => {});
  }, [mutateStat, notify]);

  const toggleBookmark = useCallback((entityId: string, entityType: string, toolName: string) => {
    const current = state.stats[entityId] ?? seedStats(entityId);
    const nowBookmarked = !current.bookmarked;
    mutateStat(entityId, (s) => ({ ...s, bookmarked: nowBookmarked }));
    if (nowBookmarked) notify(`You bookmarked ${toolName}. +10 Hub Points`, 10);
    else notify(`Removed ${toolName} from your bookmarks.`, 0);
    if (userId) {
      apiFetch("/interactions/toggle", { method: "POST", body: JSON.stringify({ entityId, entityType, action: "bookmark" }) }).catch(() => {});
    }
  }, [state.stats, mutateStat, notify, userId]);

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
        loadStats,
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
