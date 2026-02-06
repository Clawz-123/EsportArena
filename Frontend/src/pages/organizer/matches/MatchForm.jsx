import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { maps, modes } from './MatchOptions'; // You can move maps/modes to a separate file if you want
import { MatchValidationSchema } from '../../utils/MatchesValidation';

const MatchForm = ({ groups = [], onSubmit, onCancel, loading }) => {
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
      options: maps.map((m) => ({ value: m, label: m })),
      required: false,
      placeholder: 'Select map',
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <Formik
        initialValues={initialValues}
        validationSchema={MatchValidationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-[#192132] rounded-2xl shadow-xl p-8 w-full max-w-md space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <span role="img" aria-label="gamepad">🎮</span> Create Match
            </h2>
            <p className="text-[#bfc9db] text-sm mb-4">
              Create a new match within a group. Players will be able to view match details and submit results.
            </p>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-[#bfc9db] text-sm mb-1 font-medium">{field.label}</label>
                  {field.type === 'select' ? (
                    <Field
                      as="select"
                      name={field.name}
                      className="w-full bg-[#232c3b] border border-[#243044] rounded-lg px-4 py-2 text-white focus:outline-none"
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Field>
                  ) : (
                    <Field
                      type={field.type}
                      name={field.name}
                      min={field.min}
                      className="w-full bg-[#232c3b] border border-[#243044] rounded-lg px-4 py-2 text-white focus:outline-none"
                      placeholder={field.placeholder}
                    />
                  )}
                  <ErrorMessage name={field.name} component="div" className="text-red-400 text-xs mt-1" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-[#232c3b] text-[#bfc9db] font-medium hover:bg-[#20293a] transition"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#2563eb] text-white font-semibold hover:bg-[#1d4ed8] transition disabled:opacity-60"
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
