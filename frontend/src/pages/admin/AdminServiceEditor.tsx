import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Modal, Select, Skeleton, Textarea } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { currency } from "../../utils";
import {
  ApiError,
  createAdminService,
  deleteAdminService,
  getAdminService,
  getServiceReferences,
  listAdminServices,
  updateAdminService,
} from "../../services/api";
import type {
  CommissionTaxMode,
  ServiceCompensationType,
  ServiceDetail,
  ServicePlanLink,
  ServiceReferences,
  ServiceSummary,
  ServiceTaxItem,
} from "../../types";

const emptyService = (): Omit<ServiceDetail, "id"> => ({
  name: "",
  shortDescription: "",
  description: "",
  preparation: "",
  color: "#C2410C",
  durationMinutes: 60,
  basePrice: 0,
  requiresRoom: false,
  defaultRoomId: null,
  onlineBooking: true,
  showPrice: true,
  showDuration: true,
  isActive: true,
  featured: false,
  categoryIds: [],
  professionals: [],
  roomIds: [],
  equipments: [],
  taxes: [],
  plans: [],
});

type Tab = "geral" | "profissionais" | "ambiente" | "impostos" | "convenios" | "vitrine";

const tabs: { id: Tab; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "profissionais", label: "Profissionais" },
  { id: "ambiente", label: "Salas e equipamentos" },
  { id: "impostos", label: "Impostos" },
  { id: "convenios", label: "Convênios" },
  { id: "vitrine", label: "Vitrine" },
];

export function AdminServiceEditor() {
  const [items, setItems] = useState<ServiceSummary[]>([]);
  const [references, setReferences] = useState<ServiceReferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Omit<ServiceDetail, "id">>(emptyService());
  const [tab, setTab] = useState<Tab>("geral");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const open = creating || editingId !== null;

  const load = async () => {
    setLoading(true);
    try {
      const [list, refs] = await Promise.all([listAdminServices(), getServiceReferences()]);
      setItems(list);
      setReferences(refs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyService());
    setTab("geral");
    setNameError(undefined);
    setCreating(true);
  };

  const openEdit = async (id: string) => {
    setCreating(false);
    setEditingId(id);
    setTab("geral");
    setNameError(undefined);
    const detail = await getAdminService(id);
    const { id: _ignored, ...rest } = detail;
    setDraft(rest);
  };

  const closeForm = () => {
    setEditingId(null);
    setCreating(false);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNameError("Informe o nome do serviço.");
      setTab("geral");
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      if (editingId) await updateAdminService(editingId, draft);
      else await createAdminService(draft);
      showToast("success", "Serviço salvo.");
      closeForm();
      await load();
    } catch {
      showToast("error", "Não foi possível salvar o serviço.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ServiceSummary) => {
    if (!(await confirm(`Excluir o serviço "${item.name}"?`, { danger: true, confirmLabel: "Excluir" }))) return;
    try {
      await deleteAdminService(item.id);
      showToast("success", "Serviço excluído.");
      await load();
    } catch (error) {
      if (error instanceof ApiError && error.details?.blocked) {
        const cascadeConfirmed = await confirm(String(error.message), {
          title: "Existem vínculos vinculados",
          danger: true,
          confirmLabel: "Excluir mesmo assim",
        });
        if (!cascadeConfirmed) return;
        try {
          await deleteAdminService(item.id, true);
          showToast("success", "Serviço excluído.");
          await load();
        } catch {
          showToast("error", "Não foi possível excluir.");
        }
        return;
      }
      showToast("error", "Não foi possível excluir. Verifique vínculos existentes.");
    }
  };

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Cadastre serviços com salas, equipamentos, profissionais habilitados, impostos, convênios e regras de exibição."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Novo serviço</Button>}
      />
      {loading ? (
        <Skeleton className="h-72" />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum serviço cadastrado ainda." action={<Button onClick={openCreate}>Novo serviço</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="mt-1 text-sm text-brown-mid">{item.shortDescription || "Sem descrição curta."}</p>
                  <p className="mt-2 text-xs text-brown-mid">{item.durationMinutes} min · {currency(item.basePrice)} · {item.professionalCount} profissionais habilitados</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: item.color }} aria-hidden />
                  <Badge tone={item.isActive ? "success" : "danger"}>{item.isActive ? "ativo" : "inativo"}</Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => void openEdit(item.id)}>Editar</Button>
                <Button variant="ghost" onClick={() => void remove(item)}>Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title={editingId ? "Editar serviço" : "Novo serviço"} onClose={closeForm}>
        <div className="mb-4 flex flex-wrap gap-1 border-b border-brown-mid/15">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`rounded-t-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${tab === entry.id ? "bg-primary text-white" : "text-brown-mid hover:bg-bg-secondary"}`}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <form className="grid gap-4" onSubmit={save}>
          {tab === "geral" ? (
            <GeneralTab draft={draft} setDraft={setDraft} references={references} nameError={nameError} clearNameError={() => setNameError(undefined)} />
          ) : null}
          {tab === "profissionais" ? (
            <ProfessionalsTab draft={draft} setDraft={setDraft} references={references} />
          ) : null}
          {tab === "ambiente" ? (
            <RoomEquipmentTab draft={draft} setDraft={setDraft} references={references} />
          ) : null}
          {tab === "impostos" ? (
            <TaxesTab draft={draft} setDraft={setDraft} />
          ) : null}
          {tab === "convenios" ? (
            <PlansTab draft={draft} setDraft={setDraft} references={references} />
          ) : null}
          {tab === "vitrine" ? (
            <ShowcaseTab draft={draft} setDraft={setDraft} />
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button loading={saving}>Salvar serviço</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

type TabProps = {
  draft: Omit<ServiceDetail, "id">;
  setDraft: (next: Omit<ServiceDetail, "id">) => void;
  references: ServiceReferences | null;
};

function GeneralTab({ draft, setDraft, references, nameError, clearNameError }: TabProps & { nameError?: string; clearNameError: () => void }) {
  return (
    <div className="grid gap-4">
      <Input
        label="Nome"
        value={draft.name}
        error={nameError}
        onChange={(event) => { setDraft({ ...draft, name: event.target.value }); clearNameError(); }}
        required
      />
      <Input label="Descrição curta" value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} />
      <Textarea label="Descrição completa" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      <Textarea label="Orientações de preparo" value={draft.preparation} onChange={(event) => setDraft({ ...draft, preparation: event.target.value })} />
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Duração (min)" type="number" min={5} value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value || 0) })} />
        <Input label="Valor base (R$)" type="number" step="0.01" min={0} value={draft.basePrice} onChange={(event) => setDraft({ ...draft, basePrice: Number(event.target.value || 0) })} />
        <Input label="Cor (calendário)" type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
      </div>
      <CategoryMultiselect
        label="Categorias"
        options={references?.categories ?? []}
        value={draft.categoryIds}
        onChange={(next) => setDraft({ ...draft, categoryIds: next })}
      />
    </div>
  );
}

function ProfessionalsTab({ draft, setDraft, references }: TabProps) {
  const available = references?.professionals ?? [];
  const selected = draft.professionals;

  const toggle = (id: string, defaultCommission: number) => {
    const exists = selected.find((entry) => entry.professionalId === id);
    if (exists) setDraft({ ...draft, professionals: selected.filter((entry) => entry.professionalId !== id) });
    else setDraft({ ...draft, professionals: [...selected, { professionalId: id, compensationType: "default_commission", compensationValue: defaultCommission }] });
  };

  const setRule = (id: string, type: ServiceCompensationType) => {
    setDraft({
      ...draft,
      professionals: selected.map((entry) =>
        entry.professionalId === id
          ? { ...entry, compensationType: type, compensationValue: type === "default_commission" ? entry.compensationValue : entry.compensationValue ?? 0 }
          : entry,
      ),
    });
  };

  const setValue = (id: string, value: number) => {
    setDraft({
      ...draft,
      professionals: selected.map((entry) => (entry.professionalId === id ? { ...entry, compensationValue: value } : entry)),
    });
  };

  const setTaxMode = (id: string, mode: CommissionTaxMode) => {
    setDraft({
      ...draft,
      professionals: selected.map((entry) =>
        entry.professionalId === id
          ? { ...entry, commissionTaxMode: mode, commissionTaxPercent: mode === "custom" ? entry.commissionTaxPercent ?? 0 : entry.commissionTaxPercent }
          : entry,
      ),
    });
  };

  const setTaxValue = (id: string, value: number) => {
    setDraft({
      ...draft,
      professionals: selected.map((entry) => (entry.professionalId === id ? { ...entry, commissionTaxPercent: value } : entry)),
    });
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-brown-mid">Selecione quais profissionais podem realizar este serviço. Para cada um, escolha a regra de remuneração: comissão padrão (cadastrada no perfil), comissão personalizada em % ou valor fixo em R$.</p>
      {available.map((professional) => {
        const selectedEntry = selected.find((entry) => entry.professionalId === professional.id);
        return (
          <Card key={professional.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(selectedEntry)}
                  onChange={() => toggle(professional.id, professional.defaultCommissionPercent)}
                />
                <span>
                  <strong>{professional.name}</strong>
                  <span className="block text-xs text-brown-mid">{professional.specialty} · padrão {professional.defaultCommissionPercent}%</span>
                </span>
              </label>
              {selectedEntry ? (
                <div className="grid gap-2 md:flex md:items-center">
                  <Select
                    label="Regra"
                    value={selectedEntry.compensationType}
                    onChange={(event) => setRule(professional.id, event.target.value as ServiceCompensationType)}
                  >
                    <option value="default_commission">Comissão padrão do profissional</option>
                    <option value="custom_percent">Percentual personalizado</option>
                    <option value="fixed_value">Valor fixo (R$)</option>
                  </Select>
                  {selectedEntry.compensationType !== "default_commission" ? (
                    <Input
                      label={selectedEntry.compensationType === "custom_percent" ? "% sobre o valor" : "Valor fixo"}
                      type="number"
                      step="0.01"
                      min={0}
                      value={selectedEntry.compensationValue ?? 0}
                      onChange={(event) => setValue(professional.id, Number(event.target.value || 0))}
                    />
                  ) : null}
                  <Select
                    label="Imposto sobre a comissão"
                    value={selectedEntry.commissionTaxMode ?? "none"}
                    onChange={(event) => setTaxMode(professional.id, event.target.value as CommissionTaxMode)}
                  >
                    <option value="none">Nenhum</option>
                    <option value="service">Usar imposto do serviço</option>
                    <option value="custom">Imposto próprio (%)</option>
                  </Select>
                  {selectedEntry.commissionTaxMode === "custom" ? (
                    <Input
                      label="% de imposto"
                      type="number"
                      step="0.01"
                      min={0}
                      value={selectedEntry.commissionTaxPercent ?? 0}
                      onChange={(event) => setTaxValue(professional.id, Number(event.target.value || 0))}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
      {!available.length ? <p className="text-sm text-brown-mid">Cadastre profissionais para habilitar esta aba.</p> : null}
    </div>
  );
}

function RoomEquipmentTab({ draft, setDraft, references }: TabProps) {
  const rooms = references?.rooms ?? [];
  const equipments = references?.equipments ?? [];
  const toggleRoom = (id: string) => {
    const exists = draft.roomIds.includes(id);
    setDraft({ ...draft, roomIds: exists ? draft.roomIds.filter((x) => x !== id) : [...draft.roomIds, id] });
  };
  const toggleEquipment = (id: string) => {
    const exists = draft.equipments.find((entry) => entry.equipmentId === id);
    if (exists) setDraft({ ...draft, equipments: draft.equipments.filter((entry) => entry.equipmentId !== id) });
    else setDraft({ ...draft, equipments: [...draft.equipments, { equipmentId: id, required: true }] });
  };
  const toggleEquipmentRequired = (id: string) => {
    setDraft({
      ...draft,
      equipments: draft.equipments.map((entry) => (entry.equipmentId === id ? { ...entry, required: !entry.required } : entry)),
    });
  };
  return (
    <div className="grid gap-4">
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={draft.requiresRoom} onChange={(event) => setDraft({ ...draft, requiresRoom: event.target.checked })} />
        <span>Este serviço exige sala alocada</span>
      </label>
      {draft.requiresRoom ? (
        <Select label="Sala padrão" value={draft.defaultRoomId ?? ""} onChange={(event) => setDraft({ ...draft, defaultRoomId: event.target.value || null })}>
          <option value="">Selecionar no agendamento</option>
          {rooms.map((room) => <option key={room.id} value={room.id}>{room.label}</option>)}
        </Select>
      ) : null}
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Salas compatíveis</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {rooms.map((room) => (
            <label key={room.id} className="flex items-center gap-3 rounded-lg border border-brown-mid/15 p-3 text-sm">
              <input type="checkbox" checked={draft.roomIds.includes(room.id)} onChange={() => toggleRoom(room.id)} />
              <span>{room.label}</span>
            </label>
          ))}
        </div>
        {!rooms.length ? <p className="text-sm text-brown-mid">Nenhuma sala cadastrada.</p> : null}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Equipamentos necessários</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {equipments.map((equipment) => {
            const entry = draft.equipments.find((item) => item.equipmentId === equipment.id);
            return (
              <div key={equipment.id} className="grid gap-2 rounded-lg border border-brown-mid/15 p-3">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={Boolean(entry)} onChange={() => toggleEquipment(equipment.id)} />
                  <span>{equipment.label}</span>
                </label>
                {entry ? (
                  <label className="ml-7 flex items-center gap-3 text-xs text-brown-mid">
                    <input type="checkbox" checked={entry.required} onChange={() => toggleEquipmentRequired(equipment.id)} />
                    <span>Obrigatório (bloqueia agenda se indisponível)</span>
                  </label>
                ) : null}
              </div>
            );
          })}
          {!equipments.length ? <p className="text-sm text-brown-mid">Nenhum equipamento cadastrado.</p> : null}
        </div>
      </div>
    </div>
  );
}

function TaxesTab({ draft, setDraft }: Pick<TabProps, "draft" | "setDraft">) {
  const addTax = () => setDraft({ ...draft, taxes: [...draft.taxes, { id: `new-${Date.now()}`, name: "", percent: 0 }] });
  const update = (id: string, patch: Partial<ServiceTaxItem>) =>
    setDraft({ ...draft, taxes: draft.taxes.map((tax) => (tax.id === id ? { ...tax, ...patch } : tax)) });
  const remove = (id: string) => setDraft({ ...draft, taxes: draft.taxes.filter((tax) => tax.id !== id) });
  return (
    <div className="grid gap-3">
      <p className="text-sm text-brown-mid">Impostos incidentes sobre o preço do serviço (ex: ISS 5%). Entram no cálculo de lucro líquido no painel de métricas.</p>
      {draft.taxes.map((tax) => (
        <Card key={tax.id}>
          <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <Input label="Nome" value={tax.name} onChange={(event) => update(tax.id, { name: event.target.value })} />
            <Input label="Percentual (%)" type="number" step="0.01" min={0} value={tax.percent} onChange={(event) => update(tax.id, { percent: Number(event.target.value || 0) })} />
            <Button type="button" variant="ghost" onClick={() => remove(tax.id)}><Trash2 className="h-4 w-4" />Remover</Button>
          </div>
        </Card>
      ))}
      <Button type="button" variant="secondary" onClick={addTax}><Plus className="h-4 w-4" />Adicionar imposto</Button>
    </div>
  );
}

function PlansTab({ draft, setDraft, references }: TabProps) {
  const plans = references?.plans ?? [];
  const toggle = (id: string) => {
    const exists = draft.plans.find((plan) => plan.planId === id);
    if (exists) setDraft({ ...draft, plans: draft.plans.filter((plan) => plan.planId !== id) });
    else setDraft({ ...draft, plans: [...draft.plans, { planId: id, coverageRule: "", customPrice: null, showPrice: true }] });
  };
  const update = (id: string, patch: Partial<ServicePlanLink>) =>
    setDraft({ ...draft, plans: draft.plans.map((plan) => (plan.planId === id ? { ...plan, ...patch } : plan)) });
  return (
    <div className="grid gap-3">
      <p className="text-sm text-brown-mid">Para cada convênio coberto, defina a regra de cobertura e, opcionalmente, um preço customizado e se ele aparece para o paciente na vitrine.</p>
      {plans.map((plan) => {
        const entry = draft.plans.find((item) => item.planId === plan.id);
        return (
          <Card key={plan.id}>
            <label className="flex items-center gap-3 text-sm font-bold">
              <input type="checkbox" checked={Boolean(entry)} onChange={() => toggle(plan.id)} />
              <span>{plan.label}</span>
            </label>
            {entry ? (
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px_auto]">
                <Input label="Regra de cobertura" value={entry.coverageRule} onChange={(event) => update(plan.id, { coverageRule: event.target.value })} />
                <Input
                  label="Preço customizado (R$)"
                  type="number"
                  step="0.01"
                  min={0}
                  value={entry.customPrice ?? ""}
                  onChange={(event) => update(plan.id, { customPrice: event.target.value === "" ? null : Number(event.target.value) })}
                />
                <label className="flex items-end gap-2 text-xs text-brown-mid">
                  <input type="checkbox" checked={entry.showPrice} onChange={(event) => update(plan.id, { showPrice: event.target.checked })} />
                  <span>Mostrar preço ao paciente</span>
                </label>
              </div>
            ) : null}
          </Card>
        );
      })}
      {!plans.length ? <p className="text-sm text-brown-mid">Nenhum convênio cadastrado.</p> : null}
    </div>
  );
}

function ShowcaseTab({ draft, setDraft }: Pick<TabProps, "draft" | "setDraft">) {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-brown-mid">Controla o que aparece para o paciente na vitrine pública e no fluxo de agendamento.</p>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} />Serviço ativo</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.onlineBooking} onChange={(event) => setDraft({ ...draft, onlineBooking: event.target.checked })} />Disponível para agendamento online</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.showPrice} onChange={(event) => setDraft({ ...draft, showPrice: event.target.checked })} />Mostrar preço na listagem pública</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.showDuration} onChange={(event) => setDraft({ ...draft, showDuration: event.target.checked })} />Mostrar duração na listagem pública</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} />Destacar na página inicial</label>
    </div>
  );
}

function CategoryMultiselect({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string[]; onChange: (next: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((entry) => entry !== id) : [...value, id]);
  const summary = useMemo(() => options.filter((option) => value.includes(option.id)).map((option) => option.label).join(", "), [options, value]);
  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium text-brown-dark">{label}</span>
      <p className="text-xs text-brown-mid">{summary || "Nenhuma categoria selecionada."}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 rounded-lg border border-brown-mid/15 p-2">
            <input type="checkbox" checked={value.includes(option.id)} onChange={() => toggle(option.id)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
