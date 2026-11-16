'use client';

import { useEffect, useState } from 'react';
import { Search, Siren } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { TextField, TextareaField } from '@/components/common/FormFields';
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/adminService';
import { errorMessage } from '@/services/api';
import { cn } from '@/lib/utils';

/** Add an emergency / walk-in patient to the front of today's queue (finds the patient by name, phone or email). */
export function EmergencyModal({ open, onClose, doctorId, date, onAdded }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(null);
      setSymptoms('');
    }
  }, [open]);

  // Debounced patient search.
  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await adminService.patients({ search: term });
        if (!cancelled) setResults(data.patients || []);
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err, 'Patient search failed.'));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, toast]);

  async function submit(e) {
    e.preventDefault();
    if (!selected) {
      toast.warning('Please choose the patient first.');
      return;
    }
    setSubmitting(true);
    try {
      await adminService.addEmergencyPatient({
        patientId: selected._id,
        doctorId,
        date,
        symptoms: symptoms.trim() || undefined,
      });
      toast.success(`${selected.name} was added to the front of the queue.`);
      onAdded?.();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the emergency patient.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add emergency patient" size="lg">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <TextField
            label="Find the patient"
            hint="Type at least 2 letters of their name, phone number or email."
            placeholder="Search patients…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            autoComplete="off"
          />
          <div className="mt-3" aria-live="polite">
            {searching ? (
              <p className="flex items-center gap-2 text-slate-600">
                <Spinner className="h-5 w-5" /> Searching…
              </p>
            ) : query.trim().length >= 2 && results.length === 0 ? (
              <p className="text-slate-600">No patients found. The patient must have an account first.</p>
            ) : null}
            {results.length > 0 ? (
              <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto" role="listbox" aria-label="Matching patients">
                {results.map((p) => {
                  const isSelected = selected?._id === p._id;
                  return (
                    <li key={p._id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left',
                          isSelected ? 'border-brand-700 bg-brand-50' : 'border-slate-200 hover:border-brand-600'
                        )}
                      >
                        <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink-900">{p.name}</span>
                          <span className="block truncate text-sm text-slate-600">
                            {p.phone} · {p.email}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>

        <TextareaField
          label="Symptoms / reason"
          placeholder="What is the emergency?"
          rows={3}
          maxLength={500}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" icon={Siren} loading={submitting} disabled={!selected}>
            Add to queue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
