import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select } from "./ui";
import { useToast } from "../context/ToastContext";
import { checkoutCard, checkoutPix, getPaymentStatus, listSavedCards } from "../services/api";
import type { CardInput, SavedCard } from "../services/api";

const emptyCard: CardInput = {
  holderName: "",
  number: "",
  expiryMonth: "",
  expiryYear: "",
  ccv: "",
  cpfCnpj: "",
  postalCode: "",
  addressNumber: "",
  phone: "",
};

export function PaymentCheckout({ appointmentId, onPaid }: { appointmentId: string; onPaid: () => void }) {
  const { showToast } = useToast();
  const [method, setMethod] = useState<"PIX" | "CARTAO">("PIX");
  const [pix, setPix] = useState<{ encodedImage: string; payload: string } | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedCardId, setSavedCardId] = useState("");
  const [card, setCard] = useState<CardInput>(emptyCard);
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listSavedCards().then(setSavedCards).catch(() => setSavedCards([]));
  }, []);

  useEffect(() => {
    if (!pix) return undefined;
    const interval = setInterval(async () => {
      const result = await getPaymentStatus(appointmentId);
      if (result.status === "CONFIRMED") {
        clearInterval(interval);
        showToast("success", "Pagamento confirmado!");
        onPaid();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pix, appointmentId, onPaid, showToast]);

  const generatePix = async () => {
    setLoading(true);
    try {
      const result = await checkoutPix(appointmentId);
      if (result.pix) setPix(result.pix);
    } catch {
      showToast("error", "Não foi possível gerar o Pix. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const payWithCard = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await checkoutCard(appointmentId, savedCardId ? { savedCardId } : { card, saveCard });
      if (result.status === "CONFIRMED") {
        showToast("success", "Pagamento confirmado!");
        onPaid();
      } else {
        showToast("success", "Pagamento em processamento.");
        onPaid();
      }
    } catch {
      showToast("error", "Pagamento recusado. Verifique os dados do cartão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-4 flex gap-2">
        <Button type="button" variant={method === "PIX" ? "primary" : "secondary"} onClick={() => setMethod("PIX")}>Pix</Button>
        <Button type="button" variant={method === "CARTAO" ? "primary" : "secondary"} onClick={() => setMethod("CARTAO")}>Cartão</Button>
      </div>

      {method === "PIX" ? (
        <div className="grid gap-3">
          {!pix ? (
            <Button loading={loading} onClick={generatePix}>Gerar QR Code Pix</Button>
          ) : (
            <div className="grid gap-3 text-center">
              <img src={`data:image/png;base64,${pix.encodedImage}`} alt="QR Code Pix" className="mx-auto h-48 w-48" />
              <p className="text-xs text-brown-mid">Escaneie o QR Code ou copie o código abaixo. Confirmação automática em instantes.</p>
              <textarea readOnly className="rounded-lg border border-brown-mid/25 bg-bg-secondary p-2 text-xs" value={pix.payload} rows={3} />
              <Button type="button" variant="secondary" onClick={() => void navigator.clipboard.writeText(pix.payload)}>Copiar código</Button>
            </div>
          )}
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={payWithCard}>
          {savedCards.length > 0 ? (
            <Select label="Cartão salvo" value={savedCardId} onChange={(event) => setSavedCardId(event.target.value)}>
              <option value="">Usar novo cartão</option>
              {savedCards.map((saved) => <option key={saved.id} value={saved.id}>•••• {saved.last4} ({saved.expiryMonth}/{saved.expiryYear})</option>)}
            </Select>
          ) : null}
          {!savedCardId ? (
            <>
              <Input label="Nome no cartão" value={card.holderName} onChange={(event) => setCard({ ...card, holderName: event.target.value })} required />
              <Input label="Número do cartão" value={card.number} onChange={(event) => setCard({ ...card, number: event.target.value })} required />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Mês" placeholder="MM" value={card.expiryMonth} onChange={(event) => setCard({ ...card, expiryMonth: event.target.value })} required />
                <Input label="Ano" placeholder="AAAA" value={card.expiryYear} onChange={(event) => setCard({ ...card, expiryYear: event.target.value })} required />
                <Input label="CVV" value={card.ccv} onChange={(event) => setCard({ ...card, ccv: event.target.value })} required />
              </div>
              <Input label="CPF do titular" value={card.cpfCnpj} onChange={(event) => setCard({ ...card, cpfCnpj: event.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="CEP" value={card.postalCode} onChange={(event) => setCard({ ...card, postalCode: event.target.value })} required />
                <Input label="Número do endereço" value={card.addressNumber} onChange={(event) => setCard({ ...card, addressNumber: event.target.value })} required />
              </div>
              <Input label="Telefone" value={card.phone} onChange={(event) => setCard({ ...card, phone: event.target.value })} required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={saveCard} onChange={(event) => setSaveCard(event.target.checked)} />
                Salvar cartão para as próximas sessões
              </label>
            </>
          ) : null}
          <Button loading={loading}>Pagar agora</Button>
        </form>
      )}
    </Card>
  );
}
