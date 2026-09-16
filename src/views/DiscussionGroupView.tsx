import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  Crown, 
  ThumbsUp, 
  Flame, 
  CloudRain, 
  Zap, 
  Snowflake, 
  Trash2, 
  UserX, 
  Sliders, 
  User, 
  Smile, 
  Radio,
  Tag,
  Hash
} from 'lucide-react';
import { 
  CHAT_CHANNELS, 
  getChatMessages, 
  fetchRemoteChatMessages,
  postChatMessage, 
  deleteChatMessage, 
  addMessageReaction, 
  ChatMessage, 
  ChatChannel 
} from '../services/discussionGroupService';
import { 
  loadPlayerProfile, 
  banUser, 
  PlayerProfile 
} from '../services/competitiveGameService';
import { LocationPoint } from '../types/weather';
import { isBlockVisible } from '../services/displayPreferencesService';

interface DiscussionGroupViewProps {
  station: LocationPoint;
  seniorMode: boolean;
  onOpenPseudoModal?: () => void;
  onOpenAdminPanel?: () => void;
}

const QUICK_WEATHER_TAGS = [
  '☀️ Ciel dégagé',
  '⛅ Cumulus bourgeonnant',
  '🌧️ Averse en cours',
  '⚡ Orage & Éclairs',
  '💨 Rafales de vent',
  '🌫️ Brouillard',
  '❄️ Flocons de neige',
  '🌈 Arc-en-ciel'
];

export const DiscussionGroupView: React.FC<DiscussionGroupViewProps> = ({
  station,
  seniorMode,
  onOpenPseudoModal,
  onOpenAdminPanel
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  
  // Composer state
  const [messageInput, setMessageInput] = useState<string>('');
  const [selectedWeatherTag, setSelectedWeatherTag] = useState<string>('');
  const [includeLocation, setIncludeLocation] = useState<boolean>(true);

  // Moderation modal states
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [authorToBan, setAuthorToBan] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshMessages = () => {
    setMessages(getChatMessages());
    setProfile(loadPlayerProfile());
  };

  useEffect(() => {
    refreshMessages();
    fetchRemoteChatMessages().then(msgs => {
      if (msgs) setMessages(msgs);
    });

    const pollInterval = setInterval(() => {
      fetchRemoteChatMessages().then(msgs => {
        if (msgs) setMessages(msgs);
      });
    }, 4000);

    const handleChatUpdate = () => refreshMessages();
    window.addEventListener('instant_meteo_chat_updated', handleChatUpdate);
    window.addEventListener('instant_meteo_score_updated', handleChatUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('instant_meteo_chat_updated', handleChatUpdate);
      window.removeEventListener('instant_meteo_score_updated', handleChatUpdate);
    };
  }, []);

  const activeChannel = CHAT_CHANNELS.find(c => c.id === activeChannelId) || CHAT_CHANNELS[0];
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = messageInput.trim();
    if (!clean) return;

    const currentProfile = profile || loadPlayerProfile();
    const authorName = currentProfile?.pseudo || 'Observateur Citoyen';
    
    // Déterminer le badge de l'auteur
    let authorBadge = 'Apprenti Météo';
    if (currentProfile?.isAdmin) authorBadge = 'Admin';
    else if ((currentProfile?.totalPoints || 0) >= 3000) authorBadge = 'Grand Maître Cumulonimbus';
    else if ((currentProfile?.totalPoints || 0) >= 2000) authorBadge = 'Sentinelle Météorologique';
    else if ((currentProfile?.totalPoints || 0) >= 1000) authorBadge = 'Chasseur Émérite';
    else if ((currentProfile?.totalPoints || 0) >= 400) authorBadge = 'Observateur Averti';

    postChatMessage({
      channelId: activeChannelId,
      author: authorName,
      authorBadge,
      isAdmin: !!currentProfile?.isAdmin,
      content: clean,
      locationTag: includeLocation ? `${station.name} (${station.department || 'France'})` : undefined,
      weatherTag: selectedWeatherTag || undefined
    });

    setMessageInput('');
    setSelectedWeatherTag('');
  };

  const handleReaction = (messageId: string, type: keyof ChatMessage['reactions']) => {
    addMessageReaction(messageId, type);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteChatMessage(messageId);
    setMessageToDelete(null);
    showToast('Message supprimé.');
  };

  const handleQuickBan = (author: string) => {
    banUser(author, 24, 'Modération via salon de discussion');
    setAuthorToBan(null);
    showToast(`Utilisateur "${author}" banni pendant 24h.`);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* 1. Header Hub du Groupe de Discussion */}
      <div id="discussion-header-hero" className="rounded-lg border border-slate-800 bg-[#0F172A] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300">
                  Communauté Météo
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Direct
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
                Observations &amp; Échanges Citoyens
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Signalements météo locaux et retours d'observation terrain en direct.
              </p>
            </div>
          </div>

          {/* User profile & admin shortcut */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPseudoModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition border border-slate-800 cursor-pointer"
            >
              <User className="h-4 w-4 text-amber-400" />
              <span>{profile?.pseudo || 'Mon Profil'}</span>
              {profile?.isAdmin ? (
                <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-bold">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">({profile?.totalPoints || 0} pts)</span>
              )}
            </button>

            {profile?.isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Crown className="h-4 w-4 text-amber-300" />
                <span>Modération</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Salons Thématiques (Channels) */}
      {isBlockVisible('discussionGroup', 'channels') && (
        <div id="discussion-channels-bar" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CHAT_CHANNELS.map((ch) => {
            const isActive = activeChannelId === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#0284C7] text-white border-sky-400'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{ch.icon}</span>
                <span>#{ch.name}</span>
                {ch.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] rounded uppercase font-bold ${
                    isActive ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ch.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Channel Banner */}
      <div className="p-3 rounded-md bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span>{activeChannel.icon}</span>
          <span className="font-bold text-white">#{activeChannel.name} :</span>
          <span className="text-slate-400">{activeChannel.topic}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {channelMessages.length} message(s)
        </span>
      </div>

      {/* 3. Messages Feed */}
      {isBlockVisible('discussionGroup', 'messages_feed') && (
        <div id="discussion-messages-feed" className="space-y-2">
          {channelMessages.length === 0 ? (
            <div className="p-8 rounded-lg border border-slate-800 bg-[#0F172A] text-center space-y-1.5">
              <MessageSquare className="h-6 w-6 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Aucun message dans ce canal pour l'instant.</p>
              <p className="text-xs text-slate-500">Transmettez une observation météo ci-dessous.</p>
            </div>
          ) : (
            channelMessages.map((msg) => (
              <div 
                key={msg.id}
                className="p-3.5 sm:p-4 rounded-lg border border-slate-800 bg-[#0F172A] space-y-2"
              >
                {/* Message Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {msg.author}
                    </span>

                    {/* Badge */}
                    {msg.isAdmin ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-bold">
                        <Crown className="h-3 w-3 text-amber-400" />
                        Admin
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-medium">
                        {msg.authorBadge}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      • {msg.timestamp}
                    </span>
                  </div>

                  {/* Badges / Tags */}
                  <div className="flex items-center gap-1.5">
                    {msg.locationTag && (
                      <span className="flex items-center gap-1 text-[11px] text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded">
                        <MapPin className="h-3 w-3 text-sky-400" />
                        {msg.locationTag}
                      </span>
                    )}

                    {msg.weatherTag && (
                      <span className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                        {msg.weatherTag}
                      </span>
                    )}

                    {/* Admin Moderation Actions */}
                    {profile?.isAdmin && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(msg.id)}
                          title="Supprimer ce message (Admin)"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {!msg.isAdmin && (
                          <button
                            type="button"
                            onClick={() => setAuthorToBan(msg.author)}
                            title="Bannir cet auteur (Admin)"
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  {msg.content}
                </p>

                {/* Reactions Bar */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'thumbsUp')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700/60"
                  >
                    <span>👍</span>
                    <span className="text-[11px] font-mono">{msg.reactions.thumbsUp || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'storm')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700/60"
                  >
                    <span>⚡</span>
                    <span className="text-[11px] font-mono">{msg.reactions.storm || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'rain')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700/60"
                  >
                    <span>🌧️</span>
                    <span className="text-[11px] font-mono">{msg.reactions.rain || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'fire')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700/60"
                  >
                    <span>🔥</span>
                    <span className="text-[11px] font-mono">{msg.reactions.fire || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'snow')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700/60"
                  >
                    <span>❄️</span>
                    <span className="text-[11px] font-mono">{msg.reactions.snow || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Composer (Zone d'Envoi) */}
      {isBlockVisible('discussionGroup', 'composer') && (
        <form id="discussion-composer-section" onSubmit={handleSendMessage} className="p-4 rounded-lg border border-slate-800 bg-[#0F172A] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Poster un message dans #{activeChannel.name}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-sky-300 cursor-pointer normal-case">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>Ajouter ma commune ({station.name})</span>
              </label>
            </div>
          </div>

          {/* Quick weather tags pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_WEATHER_TAGS.map((tag) => {
              const isSelected = selectedWeatherTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedWeatherTag(isSelected ? '' : tag)}
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold border-amber-400'
                      : 'bg-slate-850 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Observation pour #${activeChannel.name}...`}
              className="w-full px-3.5 py-2.5 rounded-md bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#0284C7] resize-none"
            />

            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-[#0284C7] text-white font-semibold text-xs transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Confirmation Dialog : Supprimer un message */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-lg border border-rose-500/40 bg-[#0F172A] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-rose-400 border border-slate-700">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Supprimer ce message ?</h4>
                <p className="text-xs text-slate-400">Action immédiate dans le salon.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Voulez-vous vraiment retirer définitivement ce message du salon de discussion ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(messageToDelete)}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog : Bannir un utilisateur */}
      {authorToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-lg border border-red-500/40 bg-[#0F172A] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-red-400 border border-slate-700">
                <UserX className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bannir {authorToBan} ?</h4>
                <p className="text-xs text-red-300 font-semibold">Exclusion temporaire de 24h</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              L'utilisateur <strong>« {authorToBan} »</strong> sera exclu de l'accès au salon de discussion et aux concours pendant 24 heures.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAuthorToBan(null)}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleQuickBan(authorToBan)}
                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Confirmer l'exclusion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50">
          <div className="px-3.5 py-2 rounded-md bg-[#0F172A] border border-slate-700 text-white text-xs font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
};
