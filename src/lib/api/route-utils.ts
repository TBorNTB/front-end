import { NextResponse } from 'next/server';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export async function readJsonOrText(res: Response): Promise<{ json: any | null; text: string | null }> {
  try {
    const json = await res.clone().json();
    return { json, text: null };
  } catch {
    try {
      const text = await res.clone().text();
      return { json: null, text };
    } catch {
      return { json: null, text: null };
    }
  }
}

export function extractMessageFromPayload(payload: { json: any | null; text: string | null }, fallback: string): string {
  const json = payload.json;

  if (json && typeof json === 'object') {
    const message = (json as any).message ?? (json as any).error ?? (json as any).detail ?? (json as any).details;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }

  if (typeof payload.text === 'string' && payload.text.trim()) {
    // If backend returned JSON text but JSON parse failed, try lightweight extraction.
    const trimmed = payload.text.trim();
    try {
      const parsed = JSON.parse(trimmed);
      const message = (parsed as any)?.message ?? (parsed as any)?.error ?? (parsed as any)?.detail;
      if (typeof message === 'string' && message.trim()) return message.trim();
    } catch {
      // ignore
    }

    return trimmed;
  }

  return fallback;
}

export async function nextErrorFromBackendResponse(
  backendResponse: Response,
  fallbackMessage: string
): Promise<NextResponse> {
  const payload = await readJsonOrText(backendResponse);
  const message = extractMessageFromPayload(payload, fallbackMessage);

  // If backend already returns a JSON object with message, pass it through.
  if (payload.json && typeof payload.json === 'object' && payload.json !== null) {
    const jsonObj = payload.json as any;
    if (typeof jsonObj.message === 'string' && jsonObj.message.trim()) {
      return NextResponse.json(jsonObj, { status: backendResponse.status });
    }

    return NextResponse.json(
      {
        ...jsonObj,
        message,
      },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(
    {
      message,
      details: payload.text ?? undefined,
    },
    { status: backendResponse.status }
  );
}

export function nextErrorMessage(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ...(extra ?? {}),
      message,
    },
    { status }
  );
}
