type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
};

type TwitchStream = {
  id: string;
  title: string;
  game_name: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
  tags?: string[];
};

type TwitchClip = {
  id: string;
  title: string;
  url: string;
  view_count: number;
  created_at: string;
  creator_name?: string;
};

type TwitchVod = {
  id: string;
  title: string;
  url: string;
  duration: string;
  created_at: string;
  view_count: number;
};

type TwitchHelixListResponse<T> = {
  data?: T[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export type LiveAnalysisResult = {
  canal: string;
  userId: string;
  stream: {
    title: string;
    game_name: string;
    viewer_count: number;
    started_at: string;
    duration_live: string;
    thumbnail_url: string;
    tags: string[];
    is_live: boolean;
  };
  clips: Array<{
    title: string;
    url: string;
    views: number;
    created_at: string;
    creator_name: string;
  }>;
  vods: Array<{
    title: string;
    url: string;
    duration: string;
    views: number;
    created_at: string;
  }>;
  analysis: string;
  email: {
    subject: string;
    html: string;
    ctaUrl: string;
  };
};

const DEFAULT_CLIENT_ID = "hbgn15ek3xehejux45lo7lh8voylxw";
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

function getServerEnv(name: string): string {
  return String(process.env[name] ?? "").trim();
}

function getTwitchClientId(): string {
  return getServerEnv("TWITCH_CLIENT_ID") || DEFAULT_CLIENT_ID;
}

function getTwitchToken(): string {
  return getServerEnv("TWITCH_ACCESS_TOKEN");
}

function getGeminiKey(): string {
  return getServerEnv("GEMINI_API_KEY");
}

function assertServerCredentials(): void {
  if (!getTwitchToken()) {
    throw new Error("TWITCH_ACCESS_TOKEN não configurado.");
  }
  if (!getGeminiKey()) {
    throw new Error("GEMINI_API_KEY não configurado.");
  }
}

function cleanChannelName(value: string): string {
  return String(value || "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
}

function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toIsoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function formatLiveDuration(startedAt: string): string {
  const started = new Date(startedAt);
  if (Number.isNaN(started.getTime())) return "0h 0m";
  const elapsedMs = Math.max(0, Date.now() - started.getTime());
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function normalizeThumbnailUrl(url: string): string {
  const raw = String(url || "").trim();
  if (!raw) return "";
  return raw.replace("{width}x{height}", "1280x720");
}

async function twitchHelixGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      "Client-Id": getTwitchClientId(),
      Authorization: `Bearer ${getTwitchToken()}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Twitch API erro ${response.status}: ${err}`);
  }
  return (await response.json()) as T;
}

function buildClipsText(clips: LiveAnalysisResult["clips"]): string {
  if (!clips.length) return "Sem clipes nas últimas 6h.";
  return clips
    .map(
      (clip, idx) =>
        `${idx + 1}) ${clip.title} | ${clip.views} views | ${clip.url}`
    )
    .join("\n");
}

function buildVodsText(vods: LiveAnalysisResult["vods"]): string {
  if (!vods.length) return "Sem VODs recentes.";
  return vods
    .map(
      (vod, idx) =>
        `${idx + 1}) ${vod.title} | ${vod.duration} | ${vod.views} views | ${vod.url}`
    )
    .join("\n");
}

function trimToWordLimit(text: string, maxWords: number): string {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function buildGeminiPrompt(canal: string, data: LiveAnalysisResult): string {
  return `Você é um assistente técnico assistindo a live de @${canal} agora junto com o usuário.

Dados reais da live agora:
- Título: ${data.stream.title}
- Jogo/Categoria: ${data.stream.game_name}
- Espectadores: ${data.stream.viewer_count}
- Ao vivo há: ${data.stream.duration_live}
- Thumbnail: ${data.stream.thumbnail_url}
- Clipes das últimas 6h: ${buildClipsText(data.clips)}
- VODs recentes: ${buildVodsText(data.vods)}

Com base nesses dados reais escreva uma análise direta e específica com:
1. O que está acontecendo AGORA nesta live em uma frase direta
2. O conceito técnico principal desta sessão baseado no título e categoria reais
3. Um momento específico para o usuário prestar atenção baseado nos clipes recentes
4. Uma ação prática que o usuário pode fazer nas próximas 2 horas baseada no que está sendo transmitido
5. Uma pergunta cirúrgica para o usuário refletir agora

Máximo 150 palavras. Seja específico, direto e surpreendente. Use os dados reais. Nunca diga "não informado".`;
}

async function generateGeminiAnalysis(prompt: string): Promise<string> {
  const key = getGeminiKey();
  let lastError = "";

  for (const model of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 380,
          },
        }),
      }
    );

    if (!response.ok) {
      lastError = await response.text();
      continue;
    }

    const payload = (await response.json()) as GeminiResponse;
    const text = String(
      payload?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text || "")
        .join("") || ""
    ).trim();
    if (text) return trimToWordLimit(text, 150);
  }

  throw new Error(`Falha ao gerar análise no Gemini: ${lastError}`);
}

function buildFallbackAnalysis(data: LiveAnalysisResult): string {
  const clipFocus = data.clips[0]?.title || "momento de implementação ao vivo";
  const actionTech = data.vods[0]?.title || data.stream.title;
  return trimToWordLimit(
    `Agora a live está em "${data.stream.title}" com foco em ${data.stream.game_name}. O conceito técnico principal aqui é decompor um problema real em passos pequenos com feedback rápido. Preste atenção no trecho "${clipFocus}" para entender como decisões práticas são tomadas em tempo real. Nas próximas 2 horas, replique uma versão mínima do que está sendo demonstrado com escopo fechado e um critério de conclusão. Pergunta cirúrgica: qual decisão técnica tomada agora você justificaria de forma diferente no seu projeto e por quê?`,
    150
  );
}

function buildEmailHtml(canal: string, data: LiveAnalysisResult): string {
  const thumbnail = data.stream.thumbnail_url;
  const ctaUrl = `https://twitch.tv/${canal}`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#050607;font-family:Inter,Segoe UI,Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;background:#050607;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border:1px solid rgba(180,255,0,.22);border-radius:16px;overflow:hidden;background:#0a0d11;">
            ${
              thumbnail
                ? `<tr><td><img src="${escapeHtml(
                    thumbnail
                  )}" alt="Thumbnail da live" style="display:block;width:100%;height:auto;max-height:340px;object-fit:cover;" /></td></tr>`
                : ""
            }
            <tr>
              <td style="padding:18px 24px 0 24px;">
                <div style="display:inline-block;background:rgba(180,255,0,.12);border:1px solid rgba(180,255,0,.26);color:#B4FF00;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:7px 10px;border-radius:999px;">
                  Alerta de live em tempo real
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 0 24px;">
                <h1 style="margin:0 0 8px 0;font-size:26px;line-height:1.2;color:#ffffff;">${escapeHtml(
                  data.stream.title
                )}</h1>
                <p style="margin:0;color:#9ca3af;line-height:1.65;">
                  @${escapeHtml(canal)} • ${escapeHtml(
    data.stream.game_name
  )} • ${data.stream.viewer_count} espectadores • ao vivo há ${escapeHtml(
    data.stream.duration_live
  )}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 8px 24px;">
                <div style="border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);border-radius:12px;padding:18px 16px;">
                  <p style="margin:0;line-height:1.7;color:#d1d5db;">${escapeHtml(
                    data.analysis
                  )}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 26px 24px;">
                <a href="${escapeHtml(
                  ctaUrl
                )}" style="display:inline-block;background:#B4FF00;color:#000;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
                  Assistir agora
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Analisa live da Twitch em tempo real com dados reais.
 * Busca:
 * 1) user_id pelo login
 * 2) stream ativa por user_id
 * 3) clipes últimas 6h
 * 4) VODs recentes
 * Depois gera análise curta e específica via Gemini.
 */
export async function analisarLiveAgora(canal: string): Promise<LiveAnalysisResult> {
  assertServerCredentials();
  const normalizedChannel = cleanChannelName(canal);
  if (!normalizedChannel) {
    throw new Error("Canal da Twitch não informado.");
  }

  // 1) users?login=
  const usersPayload = await twitchHelixGet<TwitchHelixListResponse<TwitchUser>>(
    `/users?login=${encodeURIComponent(normalizedChannel)}`
  );
  const user = usersPayload?.data?.[0];
  if (!user?.id) {
    throw new Error(`Canal @${normalizedChannel} não encontrado.`);
  }

  // 2) streams?user_id=
  const streamsPayload = await twitchHelixGet<TwitchHelixListResponse<TwitchStream>>(
    `/streams?user_id=${encodeURIComponent(user.id)}`
  );
  const stream = streamsPayload?.data?.[0];

  const streamData: LiveAnalysisResult["stream"] = stream
    ? {
        title: stream.title || `Live de @${normalizedChannel}`,
        game_name: stream.game_name || "Twitch",
        viewer_count: Number(stream.viewer_count || 0),
        started_at: stream.started_at || new Date().toISOString(),
        duration_live: formatLiveDuration(stream.started_at || ""),
        thumbnail_url: normalizeThumbnailUrl(stream.thumbnail_url || ""),
        tags: Array.isArray(stream.tags) ? stream.tags.filter(Boolean) : [],
        is_live: true,
      }
    : {
        title: `Live de @${normalizedChannel}`,
        game_name: "Twitch",
        viewer_count: 0,
        started_at: new Date().toISOString(),
        duration_live: "0h 0m",
        thumbnail_url: "",
        tags: [],
        is_live: false,
      };

  // 3) clips últimas 6h
  const clipsPayload = await twitchHelixGet<TwitchHelixListResponse<TwitchClip>>(
    `/clips?broadcaster_id=${encodeURIComponent(
      user.id
    )}&started_at=${encodeURIComponent(toIsoHoursAgo(6))}&first=5`
  );
  const clips = (clipsPayload?.data || []).map((clip) => ({
    title: clip.title || "Clip da live",
    url: clip.url || "",
    views: Number(clip.view_count || 0),
    created_at: clip.created_at || "",
    creator_name: clip.creator_name || "",
  }));

  // 4) vods recentes
  const vodsPayload = await twitchHelixGet<TwitchHelixListResponse<TwitchVod>>(
    `/videos?user_id=${encodeURIComponent(user.id)}&type=archive&first=3`
  );
  const vods = (vodsPayload?.data || []).map((vod) => ({
    title: vod.title || "VOD recente",
    url: vod.url || "",
    duration: vod.duration || "",
    views: Number(vod.view_count || 0),
    created_at: vod.created_at || "",
  }));

  const baseData: LiveAnalysisResult = {
    canal: normalizedChannel,
    userId: user.id,
    stream: streamData,
    clips,
    vods,
    analysis: "",
    email: {
      subject: `🔴 Você está assistindo @${normalizedChannel} agora — veja o que não pode perder`,
      html: "",
      ctaUrl: `https://twitch.tv/${normalizedChannel}`,
    },
  };

  const prompt = buildGeminiPrompt(normalizedChannel, baseData);
  try {
    baseData.analysis = await generateGeminiAnalysis(prompt);
  } catch {
    baseData.analysis = buildFallbackAnalysis(baseData);
  }
  baseData.email.html = buildEmailHtml(normalizedChannel, baseData);

  return baseData;
}
