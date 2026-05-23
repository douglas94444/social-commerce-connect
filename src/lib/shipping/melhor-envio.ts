import type { WarehouseAddress } from "@/lib/onboarding";

const ME_BASE = process.env.MELHOR_ENVIO_BASE ?? "https://melhorenvio.com.br/api/v2";

export type MeQuote = {
  id: number;
  name: string;
  company: { name: string };
  price: string;
  delivery_time: number;
};

function getToken() {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) throw new Error("MELHOR_ENVIO_TOKEN não configurado.");
  return token;
}

function formatPostal(code: string) {
  return code.replace(/\D/g, "");
}

export async function calculateMelhorEnvioQuotes(opts: {
  from: WarehouseAddress;
  to: Record<string, string>;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  insuranceValue: number;
}): Promise<MeQuote[]> {
  const token = getToken();
  const body = {
    from: {
      postal_code: formatPostal(opts.from.postal_code ?? ""),
    },
    to: {
      postal_code: formatPostal(opts.to.postal_code ?? ""),
    },
    products: [
      {
        id: "1",
        width: opts.widthCm,
        height: opts.heightCm,
        length: opts.lengthCm,
        weight: opts.weightKg,
        insurance_value: opts.insuranceValue,
        quantity: 1,
      },
    ],
  };

  const res = await fetch(`${ME_BASE}/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? json?.error ?? "Falha ao cotar frete no Melhor Envio");
  }
  return (json as MeQuote[]) ?? [];
}

export async function purchaseMelhorEnvioLabel(opts: {
  serviceId: number;
  from: WarehouseAddress;
  to: Record<string, string>;
  customerName: string;
  customerPhone?: string;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  insuranceValue: number;
}): Promise<{ labelUrl: string; orderId: string }> {
  const token = getToken();

  const toPhone = opts.customerPhone?.replace(/\D/g, "") || "11999999999";
  const fromPhone = opts.from.phone?.replace(/\D/g, "") || "11999999999";

  const shipment = {
    service: opts.serviceId,
    from: {
      name: opts.from.name,
      phone: fromPhone,
      email: "contato@fulfillly.app",
      document: "",
      company_document: "",
      state_register: "",
      address: opts.from.street,
      complement: opts.from.complement ?? "",
      number: opts.from.number,
      district: opts.from.district,
      city: opts.from.city,
      state_abbr: opts.from.state,
      country_id: "BR",
      postal_code: formatPostal(opts.from.postal_code ?? ""),
    },
    to: {
      name: opts.customerName,
      phone: toPhone,
      email: "cliente@email.com",
      document: "",
      company_document: "",
      state_register: "",
      address: opts.to.street ?? "",
      complement: opts.to.complement ?? "",
      number: opts.to.number ?? "",
      district: opts.to.district ?? "",
      city: opts.to.city ?? "",
      state_abbr: opts.to.state ?? "",
      country_id: "BR",
      postal_code: formatPostal(opts.to.postal_code ?? ""),
    },
    products: [
      {
        name: "Produto",
        quantity: 1,
        unitary_value: opts.insuranceValue,
      },
    ],
    volumes: [
      {
        height: opts.heightCm,
        width: opts.widthCm,
        length: opts.lengthCm,
        weight: opts.weightKg,
      },
    ],
    options: {
      insurance_value: opts.insuranceValue,
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: true,
    },
  };

  const cartRes = await fetch(`${ME_BASE}/me/cart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(shipment),
  });
  const cartJson = await cartRes.json();
  if (!cartRes.ok) {
    throw new Error(cartJson?.message ?? "Falha ao adicionar envio ao carrinho Melhor Envio");
  }

  const orderId = cartJson?.id ?? cartJson?.purchase?.id;
  if (!orderId) throw new Error("Resposta do carrinho Melhor Envio sem ID");

  const checkoutRes = await fetch(`${ME_BASE}/me/shipment/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ orders: [orderId] }),
  });
  if (!checkoutRes.ok) {
    const err = await checkoutRes.json();
    throw new Error(err?.message ?? "Falha no checkout Melhor Envio");
  }

  const genRes = await fetch(`${ME_BASE}/me/shipment/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ orders: [orderId] }),
  });
  const genJson = await genRes.json();
  if (!genRes.ok) {
    throw new Error(genJson?.message ?? "Falha ao gerar etiqueta Melhor Envio");
  }

  const printRes = await fetch(`${ME_BASE}/me/shipment/print`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ mode: "public", orders: [orderId] }),
  });
  const printJson = await printRes.json();
  if (!printRes.ok) {
    throw new Error(printJson?.message ?? "Falha ao obter URL da etiqueta");
  }

  const labelUrl =
    printJson?.url ??
    printJson?.[orderId]?.url ??
    (Array.isArray(printJson) ? printJson[0]?.url : null);
  if (!labelUrl) throw new Error("URL da etiqueta não retornada pelo Melhor Envio");

  return { labelUrl: String(labelUrl), orderId: String(orderId) };
}
