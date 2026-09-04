// Service du Groupe de Discussion & Salon Météo (Page 13)
export interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  authorBadge: string;
  isAdmin?: boolean;
  timestamp: string;
  content: string;
  locationTag?: string;
  weatherTag?: string;
  reactions: {
    thumbsUp: number;
    storm: number;
    fire: number;
    rain: number;
    snow: number;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  topic: string;
  icon: string;
  badge?: string;
}

export const CHAT_CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'général-météo', topic: 'Observations directes, partage du ciel et discussions météo du jour', icon: '💬', badge: 'Actif' },
  { id: 'orages', name: 'chasseurs-orages', topic: 'Suivi des cellules orageuses, foudre, grêle, impacts radar', icon: '⚡', badge: 'Live' },
  { id: 'alertes', name: 'alertes-vigilance', topic: 'Signalements de terrain, crues, vents violents, canicule/grand froid', icon: '🚨' },
  { id: 'photos', name: 'photos-du-ciel', topic: 'Partage de formations nuageuses, arcs-en-ciel, couchers de soleil', icon: '📸' },
  { id: 'agro', name: 'agro-territoires', topic: 'Gelées nocturnes, sécheresse, pluviométrie agricole et potagers', icon: '🌾' }
];

const STORAGE_KEY = 'instant_meteo_discussion_messages';

const INITIAL_MESSAGES: ChatMessage[] = [];

export function getChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: ChatMessage[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Nettoyer les faux comptes et anciens bots
    const filtered = parsed.filter(m => 
      m && 
      !['Thomas Météo 78', 'Sophie_Climat', 'Alex_Météo_78', 'Alexis_Orages', 'Observatoire_Sud', 'Jean-Luc_Vignoble'].includes(m.author) &&
      m.id !== 'msg-1' && m.id !== 'msg-2' && m.id !== 'msg-3' && m.id !== 'msg-4' && m.id !== 'msg-5'
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('instant_meteo_chat_updated', { detail: messages }));
  } catch (e) {
    console.warn('Erreur sauvegarde messages:', e);
  }
}

export async function fetchRemoteChatMessages(): Promise<ChatMessage[] | null> {
  try {
    const res = await fetch('/api/discussion/messages');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      saveChatMessages(data.messages);
      return data.messages;
    }
    return null;
  } catch {
    return null;
  }
}

export function postChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'reactions'>): ChatMessage {
  const all = getChatMessages();
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const newMsg: ChatMessage = {
    ...message,
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: `Aujourd'hui à ${timeString}`,
    reactions: { thumbsUp: 0, storm: 0, fire: 0, rain: 0, snow: 0 }
  };

  const updated = [newMsg, ...all];
  saveChatMessages(updated);

  // Sync avec le serveur distant
  fetch('/api/discussion/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMsg)
  }).catch(() => {});

  return newMsg;
}

export function deleteChatMessage(id: string): void {
  const all = getChatMessages().filter(m => m.id !== id);
  saveChatMessages(all);

  // Supprimer également sur le serveur central
  fetch(`/api/discussion/messages/${encodeURIComponent(id)}/delete`, {
    method: 'POST'
  }).catch(() => {});
}

export function addMessageReaction(messageId: string, reactionType: keyof ChatMessage['reactions']): void {
  const all = getChatMessages();
  const updated = all.map(m => {
    if (m.id === messageId) {
      return {
        ...m,
        reactions: {
          ...m.reactions,
          [reactionType]: (m.reactions[reactionType] || 0) + 1
        }
      };
    }
    return m;
  });
  saveChatMessages(updated);

  // Sync réaction
  fetch(`/api/discussion/messages/${encodeURIComponent(messageId)}/reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction: reactionType })
  }).catch(() => {});
}
