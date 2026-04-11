/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Gamepad2,
  Calendar,
  Clock,
  Map as MapIcon,
  Megaphone,
  Plus,
  ChevronDown,
  Pin,
  Trash2,
  CheckCircle2,

} from 'lucide-react';
import MatchForm from '../matches/MatchForm';
import MatchAnnouncement from './MatchAnnouncement';
import { fetchTournamentBracket } from '../../../slices/BracketSlice';
import { fetchMatchesByTournament, createMatch, deleteMatch, updateMatch } from '../../../slices/MatchSlice';

// Creating a component to display and manage matches for a tournament
const MatchesCard = ({ tournamentId, gameTitle }) => {
  const dispatch = useDispatch();
  const { bracket } = useSelector((state) => state.bracket);
  const { createLoading, loading: matchesLoading, error: matchesError, matches } = useSelector(
    (state) => state.match || {}
  );
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementMatch, setAnnouncementMatch] = useState(null);
  const [groups, setGroups] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentBracket(tournamentId));
      dispatch(fetchMatchesByTournament(tournamentId));
    }
  }, [dispatch, tournamentId]);

  useEffect(() => {
    if (bracket && bracket.bracket_data) {
      let extractedGroups = [];

      if (Array.isArray(bracket.bracket_data)) {
        extractedGroups = bracket.bracket_data.map((g) => g.name ?? g).filter(Boolean);
      } else if (bracket.bracket_data.groups && Array.isArray(bracket.bracket_data.groups)) {
        extractedGroups = bracket.bracket_data.groups.map((g) => g.name ?? g).filter(Boolean);
      }

      if (JSON.stringify(groups) !== JSON.stringify(extractedGroups)) {
        setGroups(extractedGroups);
        setSelectedGroup(extractedGroups.length > 0 ? extractedGroups[0] : '');
      }
    }
  }, [bracket, groups]);

  const formatDate = (value) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredMatches = (matches || []).filter((match) => {
    if (!selectedGroup) return true;
    return match.group === selectedGroup;
  });

  const announcements = [
    {
      id: 1,
      title: 'Match 1 Schedule Confirmed',
      content: 'Match 1 for Group A will start at 3:00 PM. All teams must join lobby 15 minutes early.',
      date: '2/1/2026',
      isPinned: true
    },
    {
      id: 2,
      title: 'Match 2 Map Selection',
      content: 'Miramar has been selected for Match 2. Rules remain the same.',
      date: '2/1/2026',
      isPinned: false
    }
  ];

  const handleCreateMatch = async (values, actions) => {
    const duplicate = (matches || []).find(
      (match) =>
        match.group === values.group &&
        match.match_number === Number(values.matchNumber)
    );

    if (duplicate) {
      actions.setFieldError('matchNumber', 'Match number already exists for this group.');
      actions.setSubmitting(false);
      return;
    }

    const payload = {
      tournament: tournamentId,
      group: values.group,
      match_number: Number(values.matchNumber),
      date_time: values.dateTime,
      map: values.map || null,
      mode: values.mode || null,
      status: 'Scheduled',
    };

    try {
      const result = await dispatch(createMatch(payload));
      if (createMatch.fulfilled.match(result)) {
        toast.success('Match created successfully');
        actions.resetForm();
        setShowMatchForm(false);
        dispatch(fetchMatchesByTournament(tournamentId));
      } else {
        const errorMessage =
          result.payload?.Error_Message ||
          result.payload?.error_message ||
          result.payload?.message ||
          'Failed to create match';
        toast.error(
          typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
        );
      }
    } catch (error) {
      toast.error('Failed to create match');
    } finally {
      actions.setSubmitting(false);
    }
  };

  const extractApiMessage = (payload, fallbackMessage) => {
    const base = payload?.Error_Message ?? payload?.error_message ?? payload?.message ?? payload;
    if (!base) return fallbackMessage;
    if (typeof base === 'string') return base;
    if (Array.isArray(base) && base.length > 0) return String(base[0]);
    if (typeof base === 'object') {
      const firstValue = Object.values(base)[0];
      if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
      if (typeof firstValue === 'string') return firstValue;
    }
    return fallbackMessage;
  };

  const handleDeleteMatch = async (matchId) => {
    try {
      const result = await dispatch(deleteMatch(matchId));
      if (deleteMatch.fulfilled.match(result)) {
        const successMessage = extractApiMessage(result.payload?.Result || result.payload?.result, 'Match cancelled successfully.');
        toast.success(successMessage);
        dispatch(fetchMatchesByTournament(tournamentId));
      } else {
        toast.error(extractApiMessage(result.payload, 'Failed to cancel match'));
      }
    } catch (error) {
      toast.error('Failed to cancel match');
    }
  };

  const handleCompleteMatch = async (matchId) => {
    try {
      const result = await dispatch(updateMatch({
        matchId,
        matchData: { status: 'Completed' },
      }));
      if (updateMatch.fulfilled.match(result)) {
        toast.success('Match marked as completed');
        dispatch(fetchMatchesByTournament(tournamentId));
      } else {
        toast.error(extractApiMessage(result.payload, 'Failed to update match'));
      }
    } catch (error) {
      toast.error('Failed to update match');
    }
  };

  const handleAnnounceMatch = (match) => {
    setAnnouncementMatch(match);
    setShowAnnouncementModal(true);
  };

  const handleAnnouncementSubmit = async (values, actions) => {
    if (!announcementMatch?.id) {
      toast.error('Match not found for announcement');
      actions.setSubmitting(false);
      return;
    }

    try {
      const result = await dispatch(updateMatch({
        matchId: announcementMatch.id,
        matchData: {
          room_id: values.roomId,
          room_pass: values.roomPass,
          announcement: values.description,
        },
      }));

      if (updateMatch.fulfilled.match(result)) {
        toast.success(`Announcement sent for Match ${announcementMatch.match_number}`);
        dispatch(fetchMatchesByTournament(tournamentId));
        setShowAnnouncementModal(false);
        actions.resetForm();
      } else {
        toast.error('Failed to send announcement');
      }
    } catch (error) {
      toast.error('Failed to send announcement');
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Matches Section */}
      <div className="bg-[#1E293B] rounded-xl p-6 border border-[#2D3748]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-[#3B82F6]" />
            <h2 className="text-xl font-semibold text-white">Matches</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/dropdown">
              <button className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#2D3748] text-sm md:min-w-[140px] justify-between">
                <span>{selectedGroup || 'Select Group'}</span>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
              </button>
              {groups.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-full bg-[#1e293b] border border-[#2d3748] rounded-lg shadow-xl z-10 hidden group-hover/dropdown:block">
                  {groups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className="w-full text-left px-4 py-2 text-sm text-[#bfc9db] hover:bg-[#2d3748] hover:text-white first:rounded-t-lg last:rounded-b-lg"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-[#9CA3AF] hidden md:block">
               {groups.length} Groups Available
            </div>

            <button
              className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              onClick={() => setShowMatchForm(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create Match</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[10%]">#</th>
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[25%]">Date & Time</th>
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[15%]">Map</th>
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[20%]">Mode</th>
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[15%] text-center">Status</th>
                <th className="px-4 py-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {matchesLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">Loading matches...</p>
                  </td>
                </tr>
              ) : matchesError ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-red-400">Failed to load matches.</p>
                  </td>
                </tr>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-[#2D3748]/20 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#9CA3AF]">Match</span>
                        <span className="text-lg font-bold text-white">{match.match_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[#E2E8F0]">
                          <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                          <span className="text-sm">{formatDate(match.date_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#E2E8F0]">
                          <Clock className="w-4 h-4 text-[#9CA3AF]" />
                          <span className="text-sm">{formatTime(match.date_time)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[#E2E8F0]">
                        <MapIcon className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-sm">{match.map || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-[#9CA3AF]">{match.mode || 'TBD'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-[100px] border ${match.status === 'Completed'
                          ? 'bg-[#1E293B] text-[#9CA3AF] border-[#2D3748]'
                          : 'bg-[#1E293B] text-white border-[#2D3748]'
                        }`}>
                        {match.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="text-[#9CA3AF] hover:text-white inline-flex items-center gap-2 text-sm transition-colors"
                          onClick={() => handleAnnounceMatch(match)}
                          title="Send announcement"
                        >
                          <Megaphone className="w-4 h-4" />
                        </button>
                        <button
                          className="text-[#9CA3AF] hover:text-white inline-flex items-center gap-2 text-sm transition-colors"
                          onClick={() => handleCompleteMatch(match.id)}
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-[#9CA3AF] hover:text-red-400 inline-flex items-center gap-2 text-sm transition-colors"
                          onClick={() => handleDeleteMatch(match.id)}
                          title="Delete match"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">No matches yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-[#3B82F6]" />
        <h3 className="text-lg font-semibold text-white">Match Announcements</h3>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-[#1E293B]/50 border border-[#2D3748] rounded-xl p-5 hover:bg-[#1E293B] transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {announcement.isPinned && (
                  <Pin className="w-4 h-4 text-[#3B82F6] fill-blue-500/20" />
                )}
                <h4 className="text-white font-medium">{announcement.title}</h4>
              </div>
              <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                <Clock className="w-3 h-3" />
                <span>{announcement.date}</span>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm leading-relaxed pl-6">
              {announcement.content}
            </p>
          </div>
        ))}
      </div>
      {showMatchForm && (
        <MatchForm
          groups={groups}
          gameTitle={gameTitle}
          onSubmit={handleCreateMatch}
          onCancel={() => setShowMatchForm(false)}
          loading={createLoading}
        />
      )}
      <MatchAnnouncement
        open={showAnnouncementModal}
        announcementMatch={announcementMatch}
        onClose={() => setShowAnnouncementModal(false)}
        onSubmit={handleAnnouncementSubmit}
      />
    </div>
  );
};

export default MatchesCard;
