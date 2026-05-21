import { useCallback, useEffect, useState } from "react";
import {
  createMedicalAttachment,
  createSessionNote,
  deleteMedicalAttachment,
  getMedicalRecord,
  getSessionNoteByAppointment,
  listMedicalAttachments,
  listSessionNotes,
  signSessionNote,
  updateMedicalRecord,
  updateSessionNote,
} from "../services/api";
import type {
  MedicalAttachment,
  MedicalAttachmentUpsert,
  MedicalRecord,
  MedicalRecordUpsert,
  SessionNote,
  SessionNoteUpsert,
} from "../types";

export function useMedicalRecord(patientId?: string) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [attachments, setAttachments] = useState<MedicalAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [recordData, noteData, attachmentData] = await Promise.all([
        getMedicalRecord(patientId),
        listSessionNotes(patientId),
        listMedicalAttachments(patientId),
      ]);
      setRecord(recordData);
      setNotes(noteData);
      setAttachments(attachmentData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar prontuario."));
      setRecord(null);
      setNotes([]);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveRecord = useCallback(async (body: MedicalRecordUpsert) => {
    if (!patientId) throw new Error("Paciente invalido.");
    const next = await updateMedicalRecord(patientId, body);
    setRecord(next);
    return next;
  }, [patientId]);

  const addAttachment = useCallback(async (body: MedicalAttachmentUpsert) => {
    if (!patientId) throw new Error("Paciente invalido.");
    const created = await createMedicalAttachment(patientId, body);
    setAttachments((current) => [created, ...current]);
    return created;
  }, [patientId]);

  const removeAttachment = useCallback(async (id: string) => {
    await deleteMedicalAttachment(id);
    setAttachments((current) => current.filter((item) => item.id !== id));
  }, []);

  return { record, notes, attachments, loading, error, reload, saveRecord, addAttachment, removeAttachment };
}

export function useSessionNoteEditor(appointmentId?: string) {
  const [note, setNote] = useState<SessionNote | null>(null);
  const [loading, setLoading] = useState(Boolean(appointmentId));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      setNote(await getSessionNoteByAppointment(appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar evolucao."));
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (body: SessionNoteUpsert) => {
    if (!appointmentId) throw new Error("Agendamento invalido.");
    const saved = note?.id
      ? await updateSessionNote(note.id, body)
      : await createSessionNote(appointmentId, body);
    setNote(saved);
    return saved;
  }, [appointmentId, note?.id]);

  const sign = useCallback(async (id?: string) => {
    const targetId = id || note?.id;
    if (!targetId) throw new Error("Salve a evolucao antes de assinar.");
    const signed = await signSessionNote(targetId);
    setNote(signed);
    return signed;
  }, [note?.id]);

  return { note, loading, error, reload, save, sign };
}
