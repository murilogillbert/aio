import { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Textarea } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { getVagas } from "../../services/api";
import type { Job } from "../../types";
import { useToast } from "../../context/ToastContext";

export function Vagas() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    getVagas().then(setJobs);
  }, []);

  const apply = () => {
    setSelected(null);
    showToast("success", "Candidatura enviada.");
  };

  return (
    <main className="route-fade mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Vagas" description="Candidaturas para vagas abertas ou banco de talentos." />
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.filter((job) => job.status === "aberta").map((job) => (
          <Card key={job.id}>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{job.department}</p>
            <h2 className="mt-2 text-xl font-bold">{job.title}</h2>
            <p className="mt-2 text-sm leading-6 text-brown-mid">{job.description}</p>
            <Button className="mt-4" onClick={() => setSelected(job)}>Candidatar-se</Button>
          </Card>
        ))}
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Banco de talentos</p>
          <h2 className="mt-2 text-xl font-bold">Cadastro sem vaga definida</h2>
          <p className="mt-2 text-sm leading-6 text-brown-mid">Envie seu contato para futuras oportunidades.</p>
          <Button className="mt-4" variant="secondary" onClick={() => setSelected({ id: "", title: "Banco de talentos", department: "Geral", description: "", status: "aberta" })}>Cadastrar</Button>
        </Card>
      </div>
      <Modal open={Boolean(selected)} title={selected?.title ?? ""} onClose={() => setSelected(null)}>
        <div className="grid gap-3">
          <Input label="Nome completo" />
          <Input label="E-mail" type="email" />
          <Textarea label="Mensagem" />
          <Button onClick={apply}>Enviar candidatura</Button>
        </div>
      </Modal>
    </main>
  );
}
