'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TextareaField } from '@/components/common/FormFields';
import { useToast } from '@/context/ToastContext';
import { appointmentService } from '@/services/appointmentService';
import { errorMessage } from '@/services/api';

/** Save clinical notes for an appointment without changing its status. */
export function NotesModal({ appointment, onClose, onSaved }) {
  const toast = useToast();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(appointment?.notes || '');
  }, [appointment]);

  async function save(e) {
    e.preventDefault();
    if (!notes.trim()) {
      toast.warning('Please write a note before saving.');
      return;
    }
    setSaving(true);
    try {
      await appointmentService.saveNotes(appointment._id, notes.trim());
      toast.success('Notes saved.');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the notes.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!appointment} onClose={onClose} title="Patient notes">
      <form onSubmit={save} className="flex flex-col gap-5">
        <p className="text-lg">
          Patient: <strong>{appointment?.userId?.name || '—'}</strong> · Token #{appointment?.tokenNumber}
        </p>
        <TextareaField
          label="Clinical notes"
          hint="Diagnosis, prescription, follow-up instructions. The patient can read these."
          rows={6}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} loading={saving}>
            Save notes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
