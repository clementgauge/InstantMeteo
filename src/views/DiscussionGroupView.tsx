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
    if (confirm('Supprimer ce message du groupe de discussion ?')) {
      deleteChatMessage(messageId);
    }
  };

  const handleQuickBan = (author: string) => {
    if (confirm(`Bannir l'utilisateur "${author}" du concours et du groupe pendant 24h ?`)) {
      banUser(author, 24, 'Modération via salon de discussion');
      alert(`Utilisateur "${author}" banni pendant 24h.`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header Hub du Groupe de Discussion */}
      <div id="discussion-header-hero" className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300">
                  Page 13 • Communauté Météo
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Salon Ouvert
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white mt-1">
                Groupe de Discussion &amp; Observatoire Citoyen
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl">
                Échangez en temps réel avec la communauté de passionnés, chasseurs d'orages et observateurs météo de votre région.
              </p>
            </div>
          </div>

          {/* User profile & admin shortcut */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPseudoModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer shadow"
            >
              <User className="h-4 w-4 text-amber-400" />
              <span>{profile?.pseudo || 'Mon Pseudo'}</span>
              {profile?.isAdmin ? (
                <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-black">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">({profile?.totalPoints || 0} pts)</span>
              )}
            </button>

            {profile?.isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Crown className="h-4 w-4 text-amber-300" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Salons Thématiques (Channels) */}
      {isBlockVisible('discussionGroup', 'channels') && (
        <div id="discussion-channels-bar" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CHAT_CHANNELS.map((ch) => {
            const isActive = activeChannelId === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400/50 shadow-lg shadow-blue-600/25 ring-2 ring-blue-400/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-sm">{ch.icon}</span>
                <span>#{ch.name}</span>
                {ch.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] rounded-full uppercase font-black ${
                    isActive ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'
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
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-base">{activeChannel.icon}</span>
          <span className="font-black text-white">#{activeChannel.name} :</span>
          <span className="text-slate-400">{activeChannel.topic}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {channelMessages.length} message(s)
        </span>
      </div>

      {/* 3. Messages Feed */}
      {isBlockVisible('discussionGroup', 'messages_feed') && (
        <div id="discussion-messages-feed" className="space-y-3">
          {channelMessages.length === 0 ? (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Aucun message dans ce salon pour l'instant.</p>
              <p className="text-xs text-slate-500">Soyez le premier à partager une observation météo ci-dessous !</p>
            </div>
          ) : (
            channelMessages.map((msg) => (
              <div 
                key={msg.id}
                className="relative p-4 sm:p-5 rounded-3xl border border-slate-800/90 bg-slate-900/80 shadow-md space-y-2.5 transition hover:border-slate-700"
              >
                {/* Message Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm">
                      {msg.author}
                    </span>

                    {/* Badge */}
                    {msg.isAdmin ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-black uppercase shadow">
                        <Crown className="h-3 w-3 text-amber-400" />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-bold">
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
                      <span className="flex items-center gap-1 text-[11px] text-blue-300 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3 text-blue-400" />
                        {msg.locationTag}
                      </span>
                    )}

                    {msg.weatherTag && (
                      <span className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        {msg.weatherTag}
                      </span>
                    )}

                    {/* Admin Moderation Actions */}
                    {profile?.isAdmin && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Supprimer ce message (Admin)"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {!msg.isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleQuickBan(msg.author)}
                            title="Bannir cet auteur (Admin)"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-sm text-slate-200 leading-relaxed break-words">
                  {msg.content}
                </p>

                {/* Reactions Bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'thumbsUp')}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>👍</span>
                    <span className="text-[11px] font-mono">{msg.reactions.thumbsUp || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'storm')}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>⚡</span>
                    <span className="text-[11px] font-mono">{msg.reactions.storm || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'rain')}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>🌧️</span>
                    <span className="text-[11px] font-mono">{msg.reactions.rain || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'fire')}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>🔥</span>
                    <span className="text-[11px] font-mono">{msg.reactions.fire || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, 'snow')}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
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
        <form id="discussion-composer-section" onSubmit={handleSendMessage} className="p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span>Poster un message dans #{activeChannel.name}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-blue-300 cursor-pointer lowercase">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
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
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
              placeholder={`Écrivez votre observation pour #${activeChannel.name}...`}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
};
