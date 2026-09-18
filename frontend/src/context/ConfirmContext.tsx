import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = (message: string, options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

type PendingConfirm = ConfirmOptions & { message: string; resolve: (value: boolean) => void };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmContextValue>((message, options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ message, ...options, resolve });
    });
  }, []);

  const settle = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-brown-dark/40 p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${pending.danger ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">{pending.title ?? "Confirmar ação"}</h2>
                <p className="mt-1 text-sm text-brown-mid">{pending.description ?? pending.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => settle(false)}>{pending.cancelLabel ?? "Cancelar"}</Button>
              <Button
                variant={pending.danger ? "primary" : "secondary"}
                className={pending.danger ? "!bg-red-700 !border-red-700 hover:!bg-red-800" : ""}
                onClick={() => settle(true)}
              >
                {pending.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  return context;
};
