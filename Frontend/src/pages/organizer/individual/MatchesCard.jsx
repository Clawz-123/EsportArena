import React, { useState } from 'react';
import {
  Gamepad2,
  Calendar,
  Clock,
  Map as MapIcon,
  Megaphone,
  Plus,
  ChevronDown,
  Pin,
  Send,
  Trophy
} from 'lucide-react';
import MatchForm from '../matches/MatchForm';

const MatchesCard = () => {
  const [showMatchForm, setShowMatchForm] = useState(false);
  const groups = ['Group A', 'Group B'];

  // Mock matches data
  const matches = [
    {
      id: 1,
      date: '1/17/2025',
      time: '08:45 PM',
      map: 'Erangel',
      mode: 'Battle Royale - TPP',
      status: 'Completed',
      group: 'Group A'
    },
    {
      id: 2,
      date: '1/17/2025',
      time: '10:45 PM',
      map: 'Miramar',
      mode: 'Battle Royale - TPP',
      status: 'Scheduled',
      group: 'Group A'
    },
    {
      id: 3,
      date: '1/18/2025',
      time: '08:45 PM',
      map: 'Sanhok',
      mode: 'Battle Royale - TPP',
      status: 'Scheduled',
      group: 'Group A'
    },
  ];

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

  const handleCreateMatch = (values, actions) => {
    console.log('Match created:', values);
    actions.setSubmitting(false);
    actions.resetForm();
    setShowMatchForm(false);
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
            <div className="relative">
              <button className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-lg border border-[#2D3748] text-sm md:min-w-[140px] justify-between">
                <span>Group A</span>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
              </button>
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
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-[#2D3748]/20 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#9CA3AF]">Match</span>
                      <span className="text-lg font-bold text-white">{match.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[#E2E8F0]">
                        <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-sm">{match.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#E2E8F0]">
                        <Clock className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-sm">{match.time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-[#E2E8F0]">
                      <MapIcon className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="text-sm">{match.map}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#9CA3AF]">{match.mode}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-[100px] border ${match.status === 'Completed'
                        ? 'bg-[#1E293B] text-[#9CA3AF] border-[#2D3748]'
                        : 'bg-[#1E293B] text-white border-[#2D3748]'
                      }`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-[#9CA3AF] hover:text-white inline-flex items-center gap-2 text-sm transition-colors">
                      <Megaphone className="w-4 h-4" />
                      <span>Announce</span>
                    </button>
                  </td>
                </tr>
              ))}
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
          onSubmit={handleCreateMatch}
          onCancel={() => setShowMatchForm(false)}
        />
      )}
    </div>
  );
};

export default MatchesCard;
