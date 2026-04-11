import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { X, Gamepad2 } from 'lucide-react';
import { getMapsForGame, modes } from './MatchOptions'; 
import { MatchValidationSchema } from '../../utils/MatchesValidation';

const MatchForm = ({ groups = [], gameTitle = '', onSubmit, onCancel, loading }) => {
  const availableMaps = getMapsForGame(gameTitle);

  const fields = [
    {
      name: 'group',
      label: 'Group *',
      type: 'select',
      options: groups.map((g) => ({ value: g, label: g })),
      required: true,
      placeholder: 'Select a group',
    },
    {
      name: 'matchNumber',
      label: 'Match Number *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 1',
      min: 1,
    },
    {
      name: 'dateTime',
      label: 'Date & Time *',
      type: 'datetime-local',
      required: true,
      placeholder: 'dd-mm-yyyy --:--',
    },
    {
      name: 'map',
      label: 'Map (Optional)',
      type: 'select',
      options: availableMaps.map((m) => ({ value: m, label: m })),
      required: false,
      placeholder: availableMaps.length ? 'Select map' : 'No maps available for this game',
      disabled: availableMaps.length === 0,
    },
    {
      name: 'mode',
      label: 'Mode (Optional)',
      type: 'select',
      options: modes.map((m) => ({ value: m, label: m })),
      required: false,
      placeholder: 'Select mode',
    },
  ];

  const initialValues = {
    group: '',
    matchNumber: '',
    dateTime: '',
    map: '',
    mode: '',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={MatchValidationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-md border border-[#1e293b] relative overflow-hidden">

            {/* Header */}
            <div className="p-6 pb-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-white">
                  <Gamepad2 className="w-5 h-5 text-[#3b82f6]" />
                  <h2 className="text-xl font-bold">Create Match</h2>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-[#94a3b8] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#94a3b8] text-sm">
                Create a new match within a group. Players will be able to view match details and submit results.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 pt-2 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-white text-sm font-medium">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <div className="relative">
                      <Field
                        as="select"
                        name={field.name}
                        disabled={field.disabled}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Field>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  ) : (
                    <Field
                      type={field.type}
                      name={field.name}
                      min={field.min}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                      placeholder={field.placeholder}
                    />
                  )}
                  <ErrorMessage name={field.name} component="div" className="text-red-500 text-xs" />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-[#1e293b] flex justify-end gap-3 bg-[#0f172a]">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-white hover:bg-[#1e293b] transition-colors text-sm font-medium"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MatchForm;
