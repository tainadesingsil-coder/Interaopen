import { NextResponse } from "next/server";
import { isFacebookSignatureValid, normalizeFacebookLeadPayload } from "@/lib/hookflow/facebook";
import { processIncomingLead } from "@/lib/hookflow/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const token = searchParams.get("hub.verify_token");

  if (!verifyToken) {
    return NextResponse.json(
      { error: "FACEBOOK_VERIFY_TOKEN não foi configurado no ambiente." },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Falha na validação do webhook do Facebook." },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: "Payload vazio." }, { status: 400 });
    }

    const signatureHeader = request.headers.get("x-hub-signature-256");
    const signatureValid = isFacebookSignatureValid(rawBody, signatureHeader);
    if (!signatureValid) {
      return NextResponse.json({ error: "Assinatura inválida do webhook." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as unknown;
    const lead = await normalizeFacebookLeadPayload(payload);

    if (!lead) {
      return NextResponse.json(
        {
          error:
            "Lead não pôde ser extraído. Verifique se o payload contém e-mail ou leadgen_id válido.",
        },
        { status: 422 }
      );
    }

    const processedLead = await processIncomingLead(lead);

    return NextResponse.json({
      success: true,
      lead: {
        id: processedLead.id,
        email: processedLead.email,
        status: processedLead.status,
        approachStrategy: processedLead.approach_strategy,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno no processamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
