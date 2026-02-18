import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Megaphone } from 'lucide-react';
import matchAnnouncementValidation from '../../utils/matchAnnouncementValidation';

const MatchAnnouncement = ({
  open,
  announcementMatch,
  onClose,
  onSubmit,
}) => {
  if (!open || !announcementMatch) return null;

  const initialValues = {
    roomId: '',
    roomPass: '',
    description: '',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-md border border-[#1e293b] overflow-hidden">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="text-xl font-bold">Match Announcement</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-white transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[#94a3b8] text-sm">
            Share room details with players for this match.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={matchAnnouncementValidation}
          onSubmit={onSubmit}
          enableReinitialize
          validateOnMount
          validateOnBlur
          validateOnChange
        >
          {({ isSubmitting }) => (
            <Form className="p-6 pt-2 space-y-4">
              <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-sm text-[#e2e8f0]">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Match</span>
                  <span>#{announcementMatch.match_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Group</span>
                  <span>{announcementMatch.group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Match ID</span>
                  <span>{announcementMatch.id}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Room ID *</label>
                <Field
                  type="text"
                  name="roomId"
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  placeholder="Enter game room ID"
                />
                <ErrorMessage name="roomId" component="p" className="text-xs text-red-400" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Room Pass *</label>
                <Field
                  type="text"
                  name="roomPass"
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  placeholder="Enter room pass"
                />
                <ErrorMessage name="roomPass" component="p" className="text-xs text-red-400" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Description *</label>
                <Field
                  as="textarea"
                  rows="3"
                  name="description"
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  placeholder="Add instructions for players"
                />
                <ErrorMessage name="description" component="p" className="text-xs text-red-400" />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white hover:bg-[#1e293b] transition-colors text-sm font-medium"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Announcement'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default MatchAnnouncement;
