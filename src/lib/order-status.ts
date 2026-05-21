export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  awaiting_shipment: "Aguardando envio",
  label_generated: "Etiqueta gerada",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  failed: "Falhou",
};

export const INBOX_STATUSES = ["pending", "awaiting_shipment", "label_generated"] as const;

export type OrderStatusFilter = "inbox" | "awaiting_shipment" | "label_generated" | "shipped" | "all";
