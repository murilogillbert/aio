import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileCheck2, FileText, Link as LinkIcon, Paperclip, Save } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Modal, Skeleton, Textarea } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { useToast } from "../../context/ToastContext";
import { useMedicalRecord, useSessionNoteEditor } from "../../hooks/useMedicalRecord";
import { uploadFile } from "../../services/api";
import type { MedicalAttachmentUpsert, MedicalRecord, MedicalRecordUpsert, SessionNote, SessionNoteUpsert } from "../../types";

type Tab = "ficha" | "evolucoes" | "anexos";
type SessionNoteForm = Record<keyof Required<SessionNoteUpsert>, string>;

export function ReceptionMedicalRecordPage() {
  return <MedicalRecordPage readOnly />;
}

export function ProfessionalMedicalRecordPage() {
  return <MedicalRecordPage />;
}

function MedicalRecordPage({ readOnly = false }: { readOnly?: boolean }) {
  const { patientId = "" } = useParams();
  const navigate = useNavigate();
  const { record, notes, attachments, loading, error, saveRecord, addAttachment, removeAttachment, reload } = useMedicalRecord(patientId);
  const [tab, setTab] = useState<Tab>("ficha");

  if (loading) return <Skeleton className="h-96" />;
  if (error || !record) {
    return (
      <Card>
        <PageHeader title="Prontuario" description="Nao foi possivel carregar os dados clinicos." actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Voltar</Button>} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={`Prontuario - ${record.patientName}`}
        description={record.isRestrictedView ? "Vista resumida para recepcao: conteudos clinicos sensiveis ficam redigidos." : "Ficha clinica, evolucoes e anexos do paciente."}
        actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Voltar</Button>}
      />
      <RecordHeader record={record} />
      <div className="my-4 grid grid-cols-3 gap-1 rounded-lg border border-brown-mid/20 bg-bg-secondary p-1">
        <TabButton active={tab === "ficha"} onClick={() => setTab("ficha")} label="Ficha" />
        <TabButton active={tab === "evolucoes"} onClick={() => setTab("evolucoes")} label={`Evolucoes (${notes.length})`} />
        <TabButton active={tab === "anexos"} onClick={() => setTab("anexos")} label={`Anexos (${attachments.length})`} />
      </div>
      {tab === "ficha" ? <RecordForm record={record} readOnly={readOnly || record.isRestrictedView} onSave={saveRecord} /> : null}
      {tab === "evolucoes" ? <NotesTimeline notes={notes} canOpen={!readOnly} /> : null}
      {tab === "anexos" ? (
        <AttachmentList
          items={attachments}
          readOnly={readOnly}
          onCreate={async (body) => { await addAttachment(body); await reload(); }}
          onRemove={async (id) => { await removeAttachment(id); await reload(); }}
        />
      ) : null}
    </>
  );
}

function RecordHeader({ record }: { record: MedicalRecord }) {
  const bmi = record.heightCm && record.weightKg ? record.weightKg / ((record.heightCm / 100) ** 2) : null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><p className="text-xs font-bold uppercase text-brown-mid">Tipo sanguineo</p><p className="mt-2 text-xl font-bold">{record.bloodType || "-"}</p></Card>
      <Card><p className="text-xs font-bold uppercase text-brown-mid">Alergias</p><p className="mt-2 text-sm">{record.allergies || "Nao informado"}</p></Card>
      <Card><p className="text-xs font-bold uppercase text-brown-mid">Medicacoes</p><p className="mt-2 text-sm">{record.currentMedications || "Nao informado"}</p></Card>
      <Card><p className="text-xs font-bold uppercase text-brown-mid">IMC</p><p className="mt-2 text-xl font-bold">{bmi ? bmi.toFixed(1) : "-"}</p></Card>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-md px-2 text-sm font-bold transition ${active ? "bg-surface text-primary shadow-soft" : "text-brown-mid hover:bg-surface/70"}`}
    >
      {label}
    </button>
  );
}

function RecordForm({ record, readOnly, onSave }: { record: MedicalRecord; readOnly: boolean; onSave: (body: MedicalRecordUpsert) => Promise<MedicalRecord> }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bloodType: record.bloodType ?? "",
    allergies: record.allergies ?? "",
    chronicConditions: record.chronicConditions ?? "",
    currentMedications: record.currentMedications ?? "",
    familyHistory: record.familyHistory ?? "",
    surgicalHistory: record.surgicalHistory ?? "",
    habits: record.habits ?? "",
    heightCm: record.heightCm?.toString() ?? "",
    weightKg: record.weightKg?.toString() ?? "",
  });

  useEffect(() => {
    setForm({
      bloodType: record.bloodType ?? "",
      allergies: record.allergies ?? "",
      chronicConditions: record.chronicConditions ?? "",
      currentMedications: record.currentMedications ?? "",
      familyHistory: record.familyHistory ?? "",
      surgicalHistory: record.surgicalHistory ?? "",
      habits: record.habits ?? "",
      heightCm: record.heightCm?.toString() ?? "",
      weightKg: record.weightKg?.toString() ?? "",
    });
  }, [record]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
      });
      showToast("success", "Ficha salva.");
    } catch {
      showToast("error", "Nao foi possivel salvar a ficha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Tipo sanguineo" value={form.bloodType} disabled={readOnly} onChange={(event) => setForm({ ...form, bloodType: event.target.value })} />
          <Input label="Altura (cm)" type="number" value={form.heightCm} disabled={readOnly} onChange={(event) => setForm({ ...form, heightCm: event.target.value })} />
          <Input label="Peso (kg)" type="number" value={form.weightKg} disabled={readOnly} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} />
        </div>
        <Textarea label="Alergias" value={form.allergies} disabled={readOnly} onChange={(event) => setForm({ ...form, allergies: event.target.value })} />
        <Textarea label="Medicacoes em uso" value={form.currentMedications} disabled={readOnly} onChange={(event) => setForm({ ...form, currentMedications: event.target.value })} />
        <Textarea label="Condicoes cronicas" value={form.chronicConditions} disabled={readOnly} onChange={(event) => setForm({ ...form, chronicConditions: event.target.value })} />
        <Textarea label="Historico familiar" value={form.familyHistory} disabled={readOnly} onChange={(event) => setForm({ ...form, familyHistory: event.target.value })} />
        <Textarea label="Historico cirurgico" value={form.surgicalHistory} disabled={readOnly} onChange={(event) => setForm({ ...form, surgicalHistory: event.target.value })} />
        <Textarea label="Habitos" value={form.habits} disabled={readOnly} onChange={(event) => setForm({ ...form, habits: event.target.value })} />
        {!readOnly ? <Button loading={saving} className="w-fit"><Save className="h-4 w-4" />Salvar ficha</Button> : <Badge>Somente leitura</Badge>}
      </form>
    </Card>
  );
}

function NotesTimeline({ notes, canOpen }: { notes: SessionNote[]; canOpen: boolean }) {
  if (!notes.length) return <EmptyState title="Nenhuma evolucao registrada para este paciente." />;
  return (
    <div className="grid gap-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-bold"><FileText className="h-4 w-4 text-primary" />{note.serviceName || "Atendimento"}</h2>
              <p className="text-xs text-brown-mid">{new Date(note.appointmentStartTime).toLocaleString("pt-BR")} com {note.professionalName}</p>
            </div>
            <Badge tone={note.isSigned ? "success" : "warning"}>{note.isSigned ? "Assinada" : "Rascunho"}</Badge>
          </div>
          {note.isRestrictedView ? (
            <p className="mt-3 rounded-lg bg-bg-secondary p-3 text-sm text-brown-mid">Conteudo clinico redigido para esta permissao.</p>
          ) : (
            <div className="mt-3 grid gap-2 text-sm">
              {note.chiefComplaint ? <p><strong>Queixa/demanda:</strong> {note.chiefComplaint}</p> : null}
              {note.assessment ? <p><strong>Impressão clínica:</strong> {note.assessment}</p> : null}
              {note.plan ? <p><strong>Conduta terapêutica:</strong> {note.plan}</p> : null}
            </div>
          )}
          {canOpen ? <Link className="mt-3 inline-flex text-sm font-bold text-primary" to={`/profissional/agendamentos/${note.appointmentId}/evolucao`}>Abrir evolucao</Link> : null}
        </Card>
      ))}
    </div>
  );
}

function AttachmentList({ items, readOnly, onCreate, onRemove }: {
  items: { id: string; title: string; fileUrl: string; fileType: string; createdAt: string }[];
  readOnly: boolean;
  onCreate: (body: MedicalAttachmentUpsert) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MedicalAttachmentUpsert>({ title: "", fileUrl: "", fileType: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setDraft((current) => ({ ...current, fileUrl: url, fileType: file.type || file.name.split(".").pop() || "" }));
    } catch {
      showToast("error", "Nao foi possivel enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.fileUrl) {
      showToast("error", "Envie um arquivo antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await onCreate(draft);
      setDraft({ title: "", fileUrl: "", fileType: "" });
      setOpen(false);
      showToast("success", "Anexo salvo.");
    } catch {
      showToast("error", "Nao foi possivel salvar o anexo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-3 flex justify-end">{!readOnly ? <Button onClick={() => setOpen(true)}><Paperclip className="h-4 w-4" />Novo anexo</Button> : null}</div>
      {!items.length ? <EmptyState title="Nenhum anexo cadastrado." /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <h2 className="flex items-center gap-2 font-bold"><LinkIcon className="h-4 w-4 text-primary" />{item.title}</h2>
              <p className="text-xs text-brown-mid">{item.fileType} - {new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="inline-flex min-h-11 items-center rounded-lg border border-brown-mid/30 px-4 py-2 text-sm font-bold" href={item.fileUrl} target="_blank" rel="noreferrer">Abrir</a>
                {!readOnly ? <Button variant="ghost" onClick={() => void onRemove(item.id)}>Remover</Button> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} title="Novo anexo" onClose={() => setOpen(false)}>
        <form className="grid gap-3" onSubmit={submit}>
          <Input label="Titulo" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
          <label className="grid gap-2 text-sm font-medium text-brown-dark">
            <span>Arquivo</span>
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void pickFile(file);
              }}
            />
          </label>
          {uploading ? <p className="text-xs text-brown-mid">Enviando arquivo...</p> : null}
          {draft.fileUrl ? <p className="text-xs text-brown-mid">Arquivo pronto para salvar.</p> : null}
          <Button loading={saving} disabled={uploading || !draft.fileUrl}>Salvar anexo</Button>
        </form>
      </Modal>
    </>
  );
}

export function SessionNoteEditorPage() {
  const { appointmentId = "" } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { note, loading, error, save, sign } = useSessionNoteEditor(appointmentId);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [form, setForm] = useState<SessionNoteForm>({
    chiefComplaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    diagnosis: "",
    diagnosisCode: "",
    prescription: "",
    vitalSignsJson: "",
  });

  useEffect(() => {
    if (!note) return;
    setForm({
      chiefComplaint: note.chiefComplaint ?? "",
      subjective: note.subjective ?? "",
      objective: note.objective ?? "",
      assessment: note.assessment ?? "",
      plan: note.plan ?? "",
      diagnosis: note.diagnosis ?? "",
      diagnosisCode: note.diagnosisCode ?? "",
      prescription: note.prescription ?? "",
      vitalSignsJson: note.vitalSignsJson ?? "",
    });
  }, [note]);

  if (loading) return <Skeleton className="h-96" />;
  if (error || !note) return <Card><PageHeader title="Evolucao" description="Nao foi possivel carregar esta evolucao." actions={<Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>} /></Card>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await save(form);
      showToast("success", "Evolucao salva.");
    } catch {
      showToast("error", "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  };

  const submitSign = async () => {
    setSigning(true);
    try {
      const saved = note.id ? note : await save(form);
      await sign(saved.id);
      showToast("success", "Evolucao assinada.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Nao foi possivel assinar.");
    } finally {
      setSigning(false);
    }
  };

  const locked = note.isSigned;
  return (
    <>
      <PageHeader
        title="Evolucao do atendimento"
        description={`${note.serviceName || "Atendimento"} - ${new Date(note.appointmentStartTime).toLocaleString("pt-BR")}`}
        actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Voltar</Button>}
      />
      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={locked ? "success" : "warning"}>{locked ? "Assinada" : "Rascunho"}</Badge>
            <Link className="text-sm font-bold text-primary" to={`/profissional/pacientes/${note.patientId}/prontuario`}>Abrir prontuario do paciente</Link>
          </div>
          <Textarea label="Queixa / demanda" value={form.chiefComplaint} disabled={locked} onChange={(event) => setForm({ ...form, chiefComplaint: event.target.value })} />
          <Textarea label="Relato do paciente" value={form.subjective} disabled={locked} onChange={(event) => setForm({ ...form, subjective: event.target.value })} />
          <Textarea label="Observações da sessão" value={form.objective} disabled={locked} onChange={(event) => setForm({ ...form, objective: event.target.value })} />
          <Textarea label="Impressão clínica" value={form.assessment} disabled={locked} onChange={(event) => setForm({ ...form, assessment: event.target.value })} />
          <Textarea label="Conduta terapêutica" value={form.plan} disabled={locked} onChange={(event) => setForm({ ...form, plan: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Hipótese diagnóstica" value={form.diagnosis} disabled={locked} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} />
            <Input label="CID (opcional)" value={form.diagnosisCode} disabled={locked} onChange={(event) => setForm({ ...form, diagnosisCode: event.target.value })} />
          </div>
          <Textarea label="Encaminhamentos e orientações" value={form.prescription} disabled={locked} onChange={(event) => setForm({ ...form, prescription: event.target.value })} />
          {!locked ? (
            <div className="flex flex-wrap gap-2">
              <Button loading={saving}><Save className="h-4 w-4" />Salvar rascunho</Button>
              <Button type="button" variant="secondary" loading={signing} onClick={() => void submitSign()}><FileCheck2 className="h-4 w-4" />Assinar evolucao</Button>
            </div>
          ) : null}
        </form>
      </Card>
    </>
  );
}
