import express from "express";
import path from "path";
import { fileURLToPath } from "url";

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import bigInt from "big-integer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists (use /tmp for serverless environments if needed)
const isVercel = process.env.VERCEL === "1";
const uploadsDir = isVercel
  ? "/tmp"
  : process.env.CLOUDGRAM_DATA_DIR || path.join(__dirname, "uploads");

if (!isVercel && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const API_ID = parseInt(process.env.TELEGRAM_API_ID || "30180445", 10);
const API_HASH =
  process.env.TELEGRAM_API_HASH || "7ba589cf9d04a0c549df7fef55dd76dd";

const TELEGRAM_CLIENT_OPTIONS = {
  connectionRetries: 15,
  requestRetries: 10,
  timeout: 180000,
  deviceModel: "CloudGram Drive",
  systemVersion: "Web App",
  appVersion: "1.0",
  langCode: "en",
  systemLangCode: "en",
  proxy: undefined,
  autoReconnect: true,
};
const TELEGRAM_AUTH_CLIENT_OPTIONS = {
  ...TELEGRAM_CLIENT_OPTIONS,
  connectionRetries: 3,
  requestRetries: 3,
  timeout: 30000,
};

const isPasswordNeededError = (error: any) => {
  const text = `${error?.errorMessage || ""} ${error?.message || ""} ${error?.code || ""} ${error?.status || ""}`;
  return text.includes("SESSION_PASSWORD_NEEDED");
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
) => {
  let timeoutId: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

if (API_ID === 0 || !API_HASH) {
  console.warn(
    "WARNING: TELEGRAM_API_ID or TELEGRAM_API_HASH is not set. Telegram integration will not work.",
  );
}

const writeDesktopLog = (fileName: string, message: string) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.appendFileSync(
      path.join(uploadsDir, fileName),
      `[${new Date().toISOString()}] ${message}\n`,
    );
  } catch {}
};

const TELEGRAM_STANDARD_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
const TELEGRAM_PREMIUM_MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024;
const TELEGRAM_PART_SIZE = 512 * 1024;
const TELEGRAM_MAX_SAFE_WORKERS = 16;
const TELEGRAM_STREAM_PREFETCH_PARTS = Math.max(
  2,
  Math.min(Number(process.env.TELEGRAM_STREAM_PREFETCH_PARTS || "10"), 16),
);
const transferProgress: Record<
  string,
  {
    id: string;
    name: string;
    type: "upload" | "download";
    loaded: number;
    total: number;
    stage: string;
    startedAt: number;
    updatedAt: number;
    done?: boolean;
    error?: string;
    cancelled?: boolean;
  }
> = {};
const cancelledTransfers = new Set<string>();

const getUploadWorkers = (fileSize: number) => {
  if (fileSize >= 64 * 1024 * 1024) return TELEGRAM_MAX_SAFE_WORKERS;
  return 10;
};

const updateTransferProgress = (
  id: string | undefined,
  updates: Partial<(typeof transferProgress)[string]>,
) => {
  if (!id) return;
  const now = Date.now();
  const existing = transferProgress[id] || {
    id,
    name: "Transfer",
    type: "upload" as const,
    loaded: 0,
    total: 0,
    stage: "Starting",
    startedAt: now,
    updatedAt: now,
  };
  transferProgress[id] = { ...existing, ...updates, updatedAt: now };
};

const isTransferCancelled = (id: string | undefined) =>
  !!id && cancelledTransfers.has(id);

const isStreamableVideo = (mimeType: string, fileName: string) => {
  const lowerName = fileName.toLowerCase();
  return (
    (mimeType.startsWith("video/") ||
      lowerName.endsWith(".mp4") ||
      lowerName.endsWith(".m4v") ||
      lowerName.endsWith(".mov")) &&
    (mimeType.includes("mp4") ||
      lowerName.endsWith(".mp4") ||
      lowerName.endsWith(".m4v") ||
      lowerName.endsWith(".mov"))
  );
};

const inferMimeType = (mimeType: string, fileName: string) => {
  if (mimeType && mimeType !== "application/octet-stream") return mimeType;
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".mp4") || lowerName.endsWith(".m4v")) return "video/mp4";
  if (lowerName.endsWith(".mov")) return "video/quicktime";
  if (lowerName.endsWith(".webm")) return "video/webm";
  if (lowerName.endsWith(".mkv")) return "video/x-matroska";
  if (lowerName.endsWith(".mp3")) return "audio/mpeg";
  if (lowerName.endsWith(".m4a")) return "audio/mp4";
  if (lowerName.endsWith(".wav")) return "audio/wav";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  return mimeType || "application/octet-stream";
};

const getMaxTelegramUploadSize = (me: any) =>
  me?.premium ? TELEGRAM_PREMIUM_MAX_FILE_SIZE : TELEGRAM_STANDARD_MAX_FILE_SIZE;

const streamTelegramRange = async ({
  client,
  media,
  req,
  res,
  fileSize,
  mimeType,
  contentDisposition,
  sessionString,
  fileId,
  prefetchParts = TELEGRAM_STREAM_PREFETCH_PARTS,
  onError,
}: {
  client: TelegramClient;
  media: Api.TypeMessageMedia;
  req: express.Request;
  res: express.Response;
  fileSize: number;
  mimeType: string;
  contentDisposition: string;
  sessionString: string;
  fileId: string;
  prefetchParts?: number;
  onError: (err: any, sessionString: string) => void;
}) => {
  const rangeHeader = req.headers.range;
  let start = 0;
  let end = fileSize > 0 ? fileSize - 1 : -1;
  let partial = false;

  if (rangeHeader && fileSize > 0) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (match) {
      const [, rawStart, rawEnd] = match;
      if (rawStart === "" && rawEnd !== "") {
        const suffixLength = Number(rawEnd);
        if (!Number.isNaN(suffixLength) && suffixLength > 0) {
          start = Math.max(0, fileSize - suffixLength);
          end = fileSize - 1;
        }
      } else {
        if (rawStart !== "") start = Number(rawStart);
        if (rawEnd !== "") end = Number(rawEnd);
        if (Number.isNaN(start) || start < 0) start = 0;
        if (Number.isNaN(end) || end < start || end >= fileSize) end = fileSize - 1;
      }
      partial = true;
    }
  }

  const contentLength = fileSize > 0 ? end - start + 1 : undefined;
  res.setHeader("Content-Type", mimeType);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Disposition", contentDisposition);
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Cache-Control", "private, max-age=3600");

  if (partial && fileSize > 0) {
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  } else {
    res.status(200);
  }

  if (contentLength !== undefined && contentLength >= 0) {
    res.setHeader("Content-Length", contentLength.toString());
  }

  res.flushHeaders();

  const maxExclusive = fileSize > 0 ? end + 1 : undefined;
  let offset = start;
  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  try {
    const fetchPart = async (partOffset: number, requestedLength: number) => {
      const iter = client.iterDownload({
        file: media,
        offset: bigInt(partOffset),
        requestSize: TELEGRAM_PART_SIZE,
        chunkSize: Math.min(TELEGRAM_PART_SIZE, requestedLength),
        limit: 1,
      });

      for await (const chunk of iter) {
        const bufferChunk = Buffer.from(chunk as Buffer);
        return bufferChunk.length > requestedLength
          ? bufferChunk.subarray(0, requestedLength)
          : bufferChunk;
      }
      return Buffer.alloc(0);
    };

    const scheduled = new Map<number, Promise<{ chunk: Buffer; error?: any }>>();
    let nextOffset = offset;

    const scheduleMore = () => {
      while (
        !closed &&
        scheduled.size < prefetchParts &&
        (maxExclusive === undefined || nextOffset < maxExclusive)
      ) {
        const remaining =
          maxExclusive === undefined ? TELEGRAM_PART_SIZE : maxExclusive - nextOffset;
        const requestLength = Math.min(TELEGRAM_PART_SIZE, remaining);
        if (requestLength <= 0) break;
        const currentOffset = nextOffset;
        scheduled.set(
          currentOffset,
          fetchPart(currentOffset, requestLength)
            .then((chunk) => ({ chunk }))
            .catch((error) => ({ chunk: Buffer.alloc(0), error })),
        );
        nextOffset += requestLength;
      }
    };

    scheduleMore();

    while (scheduled.size > 0) {
      if (closed || res.destroyed) break;
      const nextChunk = scheduled.get(offset);
      if (!nextChunk) break;
      scheduled.delete(offset);
      const { chunk: bufferChunk, error } = await nextChunk;
      if (error) throw error;
      scheduleMore();
      if (!bufferChunk.length) continue;
      const remaining =
        maxExclusive === undefined ? bufferChunk.length : maxExclusive - offset;
      if (remaining <= 0) break;
      const outputChunk =
        bufferChunk.length > remaining ? bufferChunk.subarray(0, remaining) : bufferChunk;
      offset += outputChunk.length;
      if (!res.write(outputChunk)) {
        await new Promise<void>((resolve) => res.once("drain", resolve));
      }
      if (maxExclusive !== undefined && offset >= maxExclusive) break;
    }

    if (!closed && !res.writableEnded) {
      res.end();
    }
  } catch (err: any) {
    console.error(`[Download] Range stream error for ${fileId}:`, err);
    onError(err, sessionString);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Failed to stream file" });
    } else if (!res.writableEnded) {
      res.destroy(err);
    }
  }
};

const toNodeBuffer = (data: Buffer | Uint8Array | string | undefined) => {
  if (!data) return null;
  if (typeof data === "string") {
    if (fs.existsSync(data)) {
      return fs.readFileSync(data);
    }
    return Buffer.from(data);
  }
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
};

export async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tg-drive-secret",
      resave: false,
      saveUninitialized: false, // Changed to false for better privacy/security
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // In-memory client cache to avoid reconnecting on every request
  const clientCache: Record<
    string,
    {
      client: TelegramClient;
      lastUsed: number;
      connectPromise?: Promise<TelegramClient>;
    }
  > = {};

  // Cleanup interval for old clients (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const sid in clientCache) {
      if (now - clientCache[sid].lastUsed > 5 * 60 * 1000) {
        clientCache[sid].client.disconnect().catch(() => {});
        delete clientCache[sid];
      }
    }
  }, 60 * 1000);

  // Helper to get Telegram client for a session
  app.use((req, res, next) => {
    if (req.path.includes('upload')) {
       console.log('UPLOAD REQUEST:', req.method, req.path);
       writeDesktopLog("upload_debug.txt", `REQUEST ${req.method} ${req.path}`);
    }
    next();
  });
  
  const getClient = async (sessionString: string = "") => {
    if (sessionString && clientCache[sessionString]) {
      console.log(`[getClient] Using cached client for session starting with ${sessionString.substring(0, 10)}...`);
      clientCache[sessionString].lastUsed = Date.now();
      if (clientCache[sessionString].connectPromise) {
        console.log(`[getClient] Waiting for existing connection promise...`);
        return await clientCache[sessionString].connectPromise!;
      }
      const cached = clientCache[sessionString].client;
      if (!cached.connected) {
        console.log(`[getClient] Cached client not connected. Connecting...`);
        clientCache[sessionString].connectPromise = cached
          .connect()
          .then(() => {
            console.log(`[getClient] Cached client connected successfully.`);
            return cached;
          })
          .catch(err => {
            console.error(`[getClient] Cached client connection failed:`, err);
            throw err;
          });
        await clientCache[sessionString].connectPromise;
        clientCache[sessionString].connectPromise = undefined;
      }
      return cached;
    }

    console.log(`[getClient] Creating new client... (Session provided: ${!!sessionString})`);
    const client = new TelegramClient(
      new StringSession(sessionString),
      API_ID,
      API_HASH,
      TELEGRAM_CLIENT_OPTIONS,
    );

    if (sessionString) {
      console.log(`[getClient] Connecting new client with session...`);
      const connectPromise = client.connect().then(() => {
        console.log(`[getClient] New client with session connected.`);
        return client;
      });
      clientCache[sessionString] = {
        client,
        lastUsed: Date.now(),
        connectPromise,
      };
      await connectPromise;
      clientCache[sessionString].connectPromise = undefined;
    } else {
      console.log(`[getClient] Connecting new anonymous client...`);
      await client.connect();
      console.log(`[getClient] Anonymous client connected.`);
    }

    return client;
  };

  // Helper to extract session string from request
  const getSessionString = (req: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return req.query.session || "";
  };

  const handleTgError = (err: any, sessionString: string) => {
    if (err.message && err.message.includes("AUTH_KEY_UNREGISTERED")) {
      if (clientCache[sessionString]) {
        clientCache[sessionString].client.disconnect().catch(() => {});
        delete clientCache[sessionString];
      }
      return false; // Not retriable, needs re-authentication
    }
    if (err.message && (err.message.includes("TIMEOUT") || err.message.includes("RPC_CALL_FAIL"))) {
      if (clientCache[sessionString]) {
        clientCache[sessionString].client.disconnect().catch(() => {});
        delete clientCache[sessionString];
      }
      return true; // Retriable
    }
    return false;
  };

  // --- API ROUTES ---
  app.get("/api/tg/transfers", (req, res) => {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const id of Object.keys(transferProgress)) {
      const transfer = transferProgress[id];
      if ((transfer.done || transfer.error) && transfer.updatedAt < cutoff) {
        delete transferProgress[id];
      }
    }
    res.json(Object.values(transferProgress));
  });

  app.post("/api/tg/transfers/:id/cancel", (req, res) => {
    const id = req.params.id;
    cancelledTransfers.add(id);
    updateTransferProgress(id, {
      stage: "Cancelled",
      cancelled: true,
      error: "Cancelled",
    });
    res.json({ ok: true });
  });

  app.get("/api/tg/status", async (req, res) => {
    const sessionString = getSessionString(req);
    writeDesktopLog(
      "upload_debug.txt",
      `status check hasSession=${!!sessionString}`,
    );
    if (!sessionString) return res.json({ loggedIn: false });

    try {
      const client = await getClient(sessionString);
      const me = await client.getMe();

      // Attempt to load settings from saved messages
      const messages = await client.getMessages("me", {
        search: "#CloudGramSettings",
        limit: 3,
      });
      const settingsMsg = messages.find(
        (m) => m.message && m.message.startsWith("#CloudGramSettings"),
      );
      let savedSettings = null;
      if (settingsMsg) {
        try {
          savedSettings = JSON.parse(
            settingsMsg.message.replace("#CloudGramSettings\n", ""),
          );
        } catch (e) {}
      }

      res.json({ loggedIn: true, user: me, settings: savedSettings });
    } catch (error: any) {
      handleTgError(error, sessionString);
      res.json({ loggedIn: false });
    }
    // We don't disconnect anymore because we cache the client
  });

  app.get("/api/tg/ping", async (req, res) => {
    const sessionString = getSessionString(req);
    if (!sessionString) return res.json({ ok: false, reason: "no_session" });

    let client;
    try {
      client = new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, {
        ...TELEGRAM_CLIENT_OPTIONS,
        connectionRetries: 1,
      });
      const timer = setTimeout(() => {
        client?.disconnect();
      }, 5000);

      await client.connect();
      await client.getMe();
      clearTimeout(timer);
      client.disconnect();

      res.json({ ok: true });
    } catch (error: any) {
      if (client) client.disconnect();
      const msg = error.message || String(error);
      if (
        msg.includes("AUTH_KEY_UNREGISTERED") || 
        msg.includes("SESSION_REVOKED") || 
        msg.includes("USER_DEACTIVATED") ||
        error.status === 401 ||
        msg.includes("401") ||
        error.code === 401
      ) {
        return res.json({ ok: false, reason: "session_expired" });
      }
      res.json({ ok: true });
    }
  });

  app.post("/api/tg/send-code", async (req, res) => {
    const { phone } = req.body;
    let client: TelegramClient | undefined;
    try {
      const logFile = path.join(uploadsDir, "auth_debug.txt");
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Attempting send-code for: ${phone}\n`);

      let cleanPhone = phone.replace(/[^+\d]/g, "");
      if (!cleanPhone.startsWith("+")) {
        // Handle common Bangladesh local format (starts with 01 and 11 digits long)
        if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
          cleanPhone = "+88" + cleanPhone;
        } else if (cleanPhone.startsWith("880") && cleanPhone.length === 13) {
          cleanPhone = "+" + cleanPhone;
        } else {
          cleanPhone = "+" + cleanPhone;
        }
      }
      
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Cleaned phone: ${cleanPhone}\n`);
      console.log(`[Telegram Auth] Sending code for phone: ${cleanPhone} (Original: ${phone})`);
      
      client = new TelegramClient(
        new StringSession(""),
        API_ID,
        API_HASH,
        TELEGRAM_AUTH_CLIENT_OPTIONS,
      );
      await withTimeout(
        client.connect(),
        30000,
        "Telegram connection timed out. Please check your internet and try again.",
      );
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Connected auth client\n`);

      const result = await withTimeout(
        client.sendCode(
          { apiId: API_ID, apiHash: API_HASH },
          cleanPhone,
        ),
        45000,
        "Telegram did not respond while sending the OTP. Please try again in a moment.",
      );
      
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Success! phoneCodeHash length: ${result.phoneCodeHash.length}\n`);
      
      const sessionString = client.session.save() as unknown as string;
      res.json({
        success: true,
        phoneCodeHash: result.phoneCodeHash,
        phone: cleanPhone,
        sessionString,
      });
    } catch (error: any) {
      const logFile = path.join(uploadsDir, "auth_debug.txt");
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error: ${error.message || String(error)}\n`);
      console.error(`[Telegram Auth] Error sending code to ${phone}:`, error);
      if (!res.headersSent) res.status(500).json({ 
        error: error.message || String(error),
        code: error.code || 500
      });
    } finally {
      if (client) {
        client.disconnect().catch(() => {});
      }
    }
  });

  app.post("/api/tg/signin", async (req, res) => {
    const {
      code,
      phone,
      phoneCodeHash,
      sessionString: tempSession,
    } = req.body;
    try {
      const normalizedCode = String(code || "").trim().replace(/\s+/g, "");
      const normalizedPhone = String(phone || "").trim();
      const normalizedHash = String(phoneCodeHash || "").trim();
      const normalizedSession = String(tempSession || "").trim();

      if (!normalizedCode || !normalizedPhone || !normalizedHash || !normalizedSession) {
        writeDesktopLog(
          "upload_debug.txt",
          "signin rejected because some Telegram sign-in data is missing",
        );
        return res.status(400).json({ error: "Missing Telegram sign-in data. Please request a new code." });
      }

      const client = await getClient(normalizedSession);
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: normalizedPhone,
          phoneCodeHash: normalizedHash,
          phoneCode: normalizedCode,
        }),
      );
      const sessionString = client.session.save() as unknown as string;
      const me = await client.getMe();
      writeDesktopLog(
        "upload_debug.txt",
        `signin success user=${me?.id || "unknown"}`,
      );
      res.json({ success: true, user: me, sessionString });
    } catch (error: any) {
      writeDesktopLog(
        "upload_debug.txt",
        `signin failure error=${error.message || String(error)}`,
      );
      if (isPasswordNeededError(error)) {
        const normalizedSession = String(tempSession || "").trim();
        return res.status(401).json({
          error: "Please enter your Two-Step Verification password",
          requiresPassword: true,
          sessionString: normalizedSession,
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tg/signin-password", async (req, res) => {
    const {
      password,
      sessionString: tempSession,
      code,
      phone,
      phoneCodeHash,
    } = req.body;
    try {
      const normalizedPassword = String(password || "");
      const normalizedSession = String(tempSession || "").trim();
      const normalizedCode = String(code || "").trim().replace(/\s+/g, "");
      const normalizedPhone = String(phone || "").trim();
      const normalizedHash = String(phoneCodeHash || "").trim();

      if (!normalizedPassword || !normalizedSession) {
        return res.status(400).json({
          error: "Missing Two-Step Verification password. Please try again.",
        });
      }

      const client = await getClient(normalizedSession);
      if (normalizedCode && normalizedPhone && normalizedHash) {
        try {
          await client.invoke(
            new Api.auth.SignIn({
              phoneNumber: normalizedPhone,
              phoneCodeHash: normalizedHash,
              phoneCode: normalizedCode,
            }),
          );
          const sessionString = client.session.save() as unknown as string;
          const me = await client.getMe();
          writeDesktopLog(
            "upload_debug.txt",
            `2fa precheck signin completed without password user=${me?.id || "unknown"}`,
          );
          return res.json({ success: true, user: me, sessionString });
        } catch (error: any) {
          if (!isPasswordNeededError(error)) {
            throw error;
          }
        }
      }

      await client.signInWithPassword(
        { apiId: API_ID, apiHash: API_HASH },
        {
          password: async () => normalizedPassword,
          onError: (err: Error) => {
            writeDesktopLog(
              "upload_debug.txt",
              `2fa password failure error=${err.message || String(err)}`,
            );
            throw err;
          },
        } as any,
      );

      const sessionString = client.session.save() as unknown as string;
      const me = await client.getMe();
      writeDesktopLog(
        "upload_debug.txt",
        `2fa signin success user=${me?.id || "unknown"}`,
      );
      res.json({ success: true, user: me, sessionString });
    } catch (error: any) {
      writeDesktopLog(
        "upload_debug.txt",
        `2fa signin failure error=${error.message || String(error)}`,
      );
      const message = `${error?.errorMessage || error?.message || String(error)}`;
      const friendlyMessage = message.includes("PASSWORD_HASH_INVALID")
        ? "Incorrect Two-Step Verification password"
        : message || "Failed to verify Two-Step Verification password";
      res.status(401).json({ error: friendlyMessage });
    }
  });

  app.post("/api/tg/logout", async (req, res) => {
    const sessionString = getSessionString(req);
    writeDesktopLog(
      "upload_debug.txt",
      `logout request hasSession=${!!sessionString}`,
    );
    if (sessionString) {
      if (clientCache[sessionString]) {
        clientCache[sessionString].client.disconnect().catch(() => {});
        delete clientCache[sessionString];
      }
      (async () => {
        try {
          const client = await getClient(sessionString);
          await Promise.race([
            (client as any).logOut(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("logout timeout")), 5000),
            ),
          ]);
          await client.disconnect().catch(() => {});
        } catch (error: any) {
          writeDesktopLog(
            "upload_debug.txt",
            `logout warning error=${error.message || String(error)}`,
          );
        } finally {
          if (clientCache[sessionString]) {
            clientCache[sessionString].client.disconnect().catch(() => {});
            delete clientCache[sessionString];
          }
        }
      })();
    }
    res.json({ success: true });
  });

  app.get("/api/tg/files", async (req, res) => {
    const sessionString = getSessionString(req);
    writeDesktopLog(
      "upload_debug.txt",
      `files request hasSession=${!!sessionString}`,
    );
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    try {
      let client = await getClient(sessionString);
      let messages;
      let filesRetries = 0;
      while (filesRetries < 5) {
        try {
          // Fetch fewer messages initially to prevent timeouts
          messages = await client.getMessages("me", {
            search: "#CloudGram",
            limit: 300,
          });
          break;
        } catch (err: any) {
          filesRetries++;
          if (handleTgError(err, sessionString) || (err.message && err.message.includes("TIMEOUT"))) {
            console.warn(`[Files] TIMEOUT or connection error (attempt ${filesRetries}), retrying...`);
            if (filesRetries >= 5) throw err;
            client = await getClient(sessionString);
          } else {
            throw err;
          }
        }
      }
      const filteredMessages = messages.filter(
        (m) =>
          m.media &&
          (m.media instanceof Api.MessageMediaDocument || m.media instanceof Api.MessageMediaPhoto) &&
          m.message &&
          m.message.includes("#CloudGram"),
      );

      const validFiles: any[] = [];

      filteredMessages.forEach((m) => {
        let doc: Api.Document | null = null;
        let photo: Api.Photo | null = null;
        let fileName = `file_${m.id}`;
        let size = "0";
        let type = "application/octet-stream";

        if (m.media instanceof Api.MessageMediaDocument && m.media.document instanceof Api.Document) {
          doc = m.media.document;
          const fileNameAttr = doc.attributes?.find(
            (a: any) => a instanceof Api.DocumentAttributeFilename,
          ) as Api.DocumentAttributeFilename | undefined;
          fileName = fileNameAttr ? fileNameAttr.fileName : `file_${m.id}`;
          size = doc.size.toString();
          type = doc.mimeType;
        } else if (m.media instanceof Api.MessageMediaPhoto && m.media.photo instanceof Api.Photo) {
          photo = m.media.photo;
          fileName = `photo_${m.id}.jpg`;
          type = "image/jpeg";
          const largest = photo.sizes[photo.sizes.length - 1];
          if ("size" in largest) size = (largest as any).size.toString();
          else if ("sizes" in largest) {
             const s = (largest as any).sizes;
             size = s[s.length - 1].toString();
          }
        }

        let fileStatus = "active";
        if (m.message.includes("#CloudGramTrash")) fileStatus = "trash";
        if (m.message.includes("#CloudGramSpam")) fileStatus = "spam";

        const msgDateMs = m.date * 1000;

        validFiles.push({
          id: m.id.toString(),
          name: fileName,
          size: size,
          date: new Date(msgDateMs).toISOString(),
          type: type,
          isFolder: false,
          status: fileStatus,
        });
      });

      res.json(validFiles);
    } catch (error: any) {
      if (error.message && error.message.includes("TIMEOUT")) {
        if (clientCache[sessionString])
          clientCache[sessionString].client.disconnect();
      }
      res.status(500).json({ error: error.message || "Failed to fetch files" });
    }
  });

  app.get("/api/tg/vfs", async (req, res) => {
    const sessionString = getSessionString(req);
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    try {
      const client = await getClient(sessionString);
      const messages = await client.getMessages("me", {
        search: "#CloudGramVFS",
        limit: 5,
      });
      const vfsMsg = messages.find(
        (m) => m.message && m.message.startsWith("#CloudGramVFS"),
      );
      let vfs = null;
      if (vfsMsg) {
        try {
          vfs = JSON.parse(vfsMsg.message.replace("#CloudGramVFS\n", ""));
        } catch (e) {}
      }
      res.json({ vfs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tg/vfs", async (req, res) => {
    const sessionString = getSessionString(req);
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    const { vfs } = req.body;
    try {
      const client = await getClient(sessionString);
      const messages = await client.getMessages("me", {
        search: "#CloudGramVFS",
        limit: 5,
      });
      const oldVfsMsgs = messages.filter(
        (m) => m.message && m.message.startsWith("#CloudGramVFS"),
      );

      const vfsString = JSON.stringify(vfs);
      // We divide to 4000 chunks roughly but for now we'll just send strings since it's a prototype
      await client.sendMessage("me", {
        message: `#CloudGramVFS\n${vfsString}`,
      });

      if (oldVfsMsgs.length > 0) {
        await client.deleteMessages(
          "me",
          oldVfsMsgs.map((m) => m.id),
          { revoke: true },
        );
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tg/settings", async (req, res) => {
    const sessionString = getSessionString(req);
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    const { settings } = req.body;
    try {
      const client = await getClient(sessionString);

      const messages = await client.getMessages("me", {
        search: "#CloudGramSettings",
        limit: 5,
      });
      const oldSettingsMsgs = messages.filter(
        (m) => m.message && m.message.startsWith("#CloudGramSettings"),
      );

      await client.sendMessage("me", {
        message: `#CloudGramSettings\n${JSON.stringify(settings)}`,
      });

      // Delete old settings messages
      if (oldSettingsMsgs.length > 0) {
        await client.deleteMessages(
          "me",
          oldSettingsMsgs.map((m) => m.id),
          { revoke: true },
        );
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/tg/files/:id/status", async (req, res) => {
    const sessionString = getSessionString(req);
    const { id } = req.params;
    const { status } = req.body; // 'active', 'trash', 'spam'

    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    try {
      const client = await getClient(sessionString);

      let newMessage = "#CloudGram";
      if (status === "trash") newMessage = "#CloudGram #CloudGramTrash";
      if (status === "spam") newMessage = "#CloudGram #CloudGramSpam";

      await client.editMessage("me", {
        message: parseInt(id),
        text: newMessage,
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/tg/delete/:id", async (req, res) => {
    const sessionString = getSessionString(req);
    const { id } = req.params;
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    try {
      const client = await getClient(sessionString);
      await client.deleteMessages("me", [parseInt(id)], { revoke: true });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const upload = multer({ dest: uploadsDir });

  // Chunked upload to bypass proxy limits
  console.log("Registering upload-chunk route...");
  app.post("/api/tg/upload-chunk", upload.single("chunk"), async (req, res) => {
    req.setTimeout(0);
    res.setTimeout(0);
    
    const sessionString = getSessionString(req);
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    if (!req.file) return res.status(400).json({ error: "No chunk provided" });

    const { uploadId, chunkIndex, totalChunks, fileName, mimeType, fileSize, transferId } = req.body;
    const transferIdString = transferId ? String(transferId) : undefined;
    const declaredFileSize = Number(fileSize || 0);
    if (transferIdString) {
      cancelledTransfers.delete(transferIdString);
      req.on("aborted", () => {
        cancelledTransfers.add(transferIdString);
        updateTransferProgress(transferIdString, {
          stage: "Cancelled",
          cancelled: true,
          error: "Cancelled",
        });
      });
    }
    writeDesktopLog(
      "upload_debug.txt",
      `chunk route uploadId=${uploadId} chunkIndex=${chunkIndex} totalChunks=${totalChunks} fileName=${fileName} hasFile=${!!req.file}`,
    );
    
    if (!uploadId || chunkIndex === undefined || !totalChunks || !fileName) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      updateTransferProgress(transferIdString, {
        stage: "Failed",
        error: "Missing chunk metadata",
      });
      return res.status(400).json({ error: "Missing chunk metadata" });
    }

    const chunkIdx = parseInt(chunkIndex, 10);
    const total = parseInt(totalChunks, 10);
    
    // Safety check for filename
    let originalName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    if (!originalName.includes(".")) {
      if (mimeType && mimeType.includes("video")) originalName += ".mp4";
      else if (mimeType && mimeType.includes("audio")) originalName += ".mp3";
      else if (mimeType && mimeType.includes("image")) originalName += ".jpg";
    }
    const uploadMimeType = inferMimeType(mimeType || "", originalName);

    const assembledFilePath = path.join(uploadsDir, `assembled_${uploadId}_${originalName}`);
    
    try {
      if (isTransferCancelled(transferIdString)) {
        throw new Error("Upload cancelled");
      }
      // Append chunk to the final file
      const chunkData = fs.readFileSync(req.file.path);
      fs.appendFileSync(assembledFilePath, chunkData);
      fs.unlinkSync(req.file.path); // cleanup chunk
      const assembledBytes = fs.statSync(assembledFilePath).size;
      updateTransferProgress(transferIdString, {
        id: transferIdString || "",
        name: fileName,
        type: "upload",
        loaded: declaredFileSize
          ? Math.min(declaredFileSize, assembledBytes)
          : chunkIdx + 1,
        total: declaredFileSize || total,
        stage: chunkIdx === total - 1 ? "Preparing Telegram upload" : "Receiving chunks",
      });
      writeDesktopLog(
        "upload_debug.txt",
        `chunk appended assembledFilePath=${assembledFilePath} chunkBytes=${chunkData.length}`,
      );

      if (chunkIdx === total - 1) {
        // Last chunk, now upload to Telegram
        let client = await getClient(sessionString);
        let sentMsg;
        let uploadRetries = 0;

        res.setHeader("Content-Type", "application/json");
        res.setHeader("X-Accel-Buffering", "no");
        res.status(200);
        const keepAliveInterval = setInterval(() => {
          res.write(" "); 
        }, 15000);

        let successData = null;
        let errorData = null;

        while (uploadRetries < 5) {
          try {
            if (isTransferCancelled(transferIdString)) {
              throw new Error("Upload cancelled");
            }
            console.log(`[Upload] Sending assembled file to TG: ${originalName} (attempt ${uploadRetries + 1})`);
            writeDesktopLog(
              "upload_debug.txt",
              `sending assembled file originalName=${originalName} attempt=${uploadRetries + 1}`,
            );
            const assembledSize = fs.statSync(assembledFilePath).size;
            updateTransferProgress(transferIdString, {
              stage: "Uploading to Telegram",
              loaded: 0,
              total: assembledSize,
              startedAt: Date.now(),
            });
            const sendOptions: any = {
              file: assembledFilePath,
              caption: "#CloudGram",
              forceDocument: true,
              mimeType: uploadMimeType || undefined,
              supportsStreaming: isStreamableVideo(uploadMimeType, originalName),
              workers: Math.max(
                3,
                getUploadWorkers(assembledSize) - uploadRetries,
              ),
              progressCallback: (progress: number) => {
                if (isTransferCancelled(transferIdString)) {
                  throw new Error("Upload cancelled");
                }
                updateTransferProgress(transferIdString, {
                  stage: "Uploading to Telegram",
                  loaded: Math.round(progress * assembledSize),
                  total: assembledSize,
                });
              },
              attributes: [
                new Api.DocumentAttributeFilename({
                  fileName: fileName,
                }),
              ],
            };
            sentMsg = await client.sendFile("me", sendOptions);
            console.log(`[Upload] Success! Message ID: ${sentMsg.id}`);
            writeDesktopLog(
              "upload_debug.txt",
              `assembled upload success messageId=${sentMsg.id}`,
            );
            updateTransferProgress(transferIdString, {
              stage: "Completed",
              loaded: assembledSize,
              total: assembledSize,
              done: true,
            });
            successData = { success: true, fileId: sentMsg.id.toString() };
            break; 
          } catch (err: any) {
            uploadRetries++;
            console.error(`[Upload] attempt ${uploadRetries} failed: ${err.message}`);
            writeDesktopLog(
              "upload_debug.txt",
              `assembled upload failure attempt=${uploadRetries} error=${err.message || String(err)}`,
            );
            updateTransferProgress(transferIdString, {
              stage: err.message === "Upload cancelled" ? "Cancelled" : "Retrying",
              cancelled: err.message === "Upload cancelled" ? true : undefined,
              error: uploadRetries >= 5 || err.message === "Upload cancelled" ? err.message || String(err) : undefined,
            });
            if (err.message === "Upload cancelled") {
              errorData = { error: "Upload cancelled" };
              break;
            }
            if (handleTgError(err, sessionString) || (err.message && err.message.includes("TIMEOUT"))) {
              if (uploadRetries >= 5) {
                 errorData = { error: err.message || "Failed after 5 retries" };
                 break;
              }
              client = await getClient(sessionString);
            } else {
              errorData = { error: err.message };
              break;
            }
          }
        }
        
        clearInterval(keepAliveInterval);
        if (fs.existsSync(assembledFilePath)) fs.unlinkSync(assembledFilePath);
        
        if (errorData) {
           res.write(JSON.stringify(errorData));
           res.end();
        } else if (successData) {
           res.write(JSON.stringify(successData));
           res.end();
        } else {
           res.write(JSON.stringify({ error: "Unknown upload error" }));
           res.end();
        }
      } else {
        // Not the last chunk, just acknowledge receipt
        res.json({ success: true, message: `Chunk ${chunkIdx + 1}/${total} received` });
      }
    } catch (e: any) {
      writeDesktopLog(
        "upload_debug.txt",
        `chunk route fatal error=${e.message || String(e)}`,
      );
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(assembledFilePath)) fs.unlinkSync(assembledFilePath);
      updateTransferProgress(transferIdString, {
        stage: e.message === "Upload cancelled" ? "Cancelled" : "Failed",
        cancelled: e.message === "Upload cancelled" ? true : undefined,
        error: e.message,
      });
      
      if (!res.headersSent) {
        res.status(500).json({ error: e.message });
      } else {
         res.write(JSON.stringify({ error: e.message }));
         res.end();
      }
    }
  });

  // Updated Upload for Vercel
  app.post("/api/tg/upload", upload.single("file"), async (req, res) => {
    req.setTimeout(0);
    res.setTimeout(0);
    const sessionString = getSessionString(req);
    if (!sessionString) return res.status(401).json({ error: "Not logged in" });
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const transferId = req.body.transferId
      ? String(req.body.transferId)
      : undefined;
    if (transferId) {
      cancelledTransfers.delete(transferId);
      req.on("aborted", () => {
        cancelledTransfers.add(transferId);
        updateTransferProgress(transferId, {
          stage: "Cancelled",
          cancelled: true,
          error: "Cancelled",
        });
      });
    }
    writeDesktopLog(
      "upload_debug.txt",
      `single upload route file=${req.file.originalname} size=${req.file.size} mime=${req.file.mimetype}`,
    );
    updateTransferProgress(transferId, {
      id: transferId || "",
      name: req.file.originalname,
      type: "upload",
      loaded: 0,
      total: req.file.size,
      stage: "Preparing",
    });

    let tempFilePath = req.file.path;
    try {
      let client = await getClient(sessionString);
      const me = await client.getMe();
      const maxUploadSize = getMaxTelegramUploadSize(me);

      if (req.file.size > maxUploadSize) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        updateTransferProgress(transferId, {
          error: "File is larger than this Telegram account can upload.",
          stage: "Failed",
        });
        // Large-file virtual splitting would need message manifests, part ordering,
        // download reassembly, and preview rules. We keep the official Telegram
        // per-file ceiling here so existing previews/downloads stay reliable.
        return res.status(413).json({
          error: me?.premium
            ? "This Telegram account can upload files up to 4 GB per file."
            : "This Telegram account can upload files up to 2 GB per file. Larger virtual-file splitting is not enabled because it would complicate previews and downloads.",
        });
      }

      // Rename file to include original extension so gramjs infers mime correctly
      let originalName = req.file.originalname.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_",
      );
      if (!originalName.includes(".")) {
        if (req.file.mimetype.includes("video")) originalName += ".mp4";
        else if (req.file.mimetype.includes("audio")) originalName += ".mp3";
        else if (req.file.mimetype.includes("image")) originalName += ".jpg";
      }
      const uploadMimeType = inferMimeType(req.file.mimetype, originalName);

      const randomSuffix = Math.round(Math.random() * 1e9).toString();
      const finalTempPath = path.join(
        uploadsDir,
        Date.now() + "_" + randomSuffix + "_" + originalName,
      );
      
      try {
        fs.renameSync(req.file.path, finalTempPath);
        tempFilePath = finalTempPath;
        console.log(`[Upload] File moved to ${tempFilePath} (${req.file.size} bytes)`);
        writeDesktopLog(
          "upload_debug.txt",
          `single upload temp file moved path=${tempFilePath}`,
        );
      } catch (renameErr) {
        console.warn(`[Upload] renameSync failed, using original path:`, renameErr);
        writeDesktopLog(
          "upload_debug.txt",
          `single upload temp rename failed error=${renameErr}`,
        );
        tempFilePath = req.file.path;
      }

      let sentMsg;
      let uploadRetries = 0;

      // Keep the connection alive by periodically writing whitespaces
      res.setHeader("Content-Type", "application/json");
      res.setHeader("X-Accel-Buffering", "no");
      res.status(200);
      const keepAliveInterval = setInterval(() => {
        res.write(" "); // write whitespace
      }, 15000);

      let successData = null;
      let errorData = null;

      while (uploadRetries < 5) {
        try {
          if (isTransferCancelled(transferId)) {
            throw new Error("Upload cancelled");
          }
          console.log(`[Upload] Sending file to Telegram: ${originalName} (attempt ${uploadRetries + 1})`);
          writeDesktopLog(
            "upload_debug.txt",
            `single upload sending originalName=${originalName} attempt=${uploadRetries + 1}`,
          );
          updateTransferProgress(transferId, {
            stage: "Uploading to Telegram",
            loaded: 0,
            total: req.file.size,
            startedAt: Date.now(),
          });
          const sendOptions: any = {
            file: tempFilePath,
            caption: "#CloudGram",
            forceDocument: true,
            fileSize: req.file.size,
            mimeType: uploadMimeType || undefined,
            workers: Math.max(3, getUploadWorkers(req.file.size) - uploadRetries),
            supportsStreaming: isStreamableVideo(
              uploadMimeType,
              originalName,
            ),
            progressCallback: (progress: number) => {
              if (isTransferCancelled(transferId)) {
                throw new Error("Upload cancelled");
              }
              const loaded = Math.round(progress * req.file.size);
              updateTransferProgress(transferId, {
                stage: "Uploading to Telegram",
                loaded,
                total: req.file.size,
              });
            },
            attributes: [
              new Api.DocumentAttributeFilename({
                fileName: req.file.originalname,
              }),
            ],
          };
          sentMsg = await client.sendFile("me", sendOptions);
          console.log(`[Upload] Success! Message ID: ${sentMsg.id}`);
          writeDesktopLog(
            "upload_debug.txt",
            `single upload success messageId=${sentMsg.id}`,
          );
          updateTransferProgress(transferId, {
            stage: "Completed",
            loaded: req.file.size,
            total: req.file.size,
            done: true,
          });
          successData = { success: true, fileId: sentMsg.id.toString() };
          break; // success
        } catch (err: any) {
          uploadRetries++;
          console.error(`[Upload] attempt ${uploadRetries} failed: ${err.message}`);
          writeDesktopLog(
            "upload_debug.txt",
            `single upload failure attempt=${uploadRetries} error=${err.message || String(err)}`,
          );
          updateTransferProgress(transferId, {
            stage: "Retrying",
            cancelled: err.message === "Upload cancelled" ? true : undefined,
            error: uploadRetries >= 5 || err.message === "Upload cancelled" ? err.message || String(err) : undefined,
          });
          if (err.message === "Upload cancelled") {
            errorData = { error: "Upload cancelled" };
            break;
          }
          if (handleTgError(err, sessionString) || (err.message && err.message.includes("TIMEOUT"))) {
            if (uploadRetries >= 5) {
               errorData = { error: err.message || "Failed after 5 retries" };
               break;
            }
            console.log("Connection issues, recreating client and retrying upload...");
            client = await getClient(sessionString);
          } else {
            errorData = { error: err.message };
            break;
          }
        }
      }
      
      clearInterval(keepAliveInterval);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      
      if (errorData) {
         res.write(JSON.stringify(errorData));
         res.end();
      } else if (successData) {
         res.write(JSON.stringify(successData));
         res.end();
      } else {
         res.write(JSON.stringify({ error: "Unknown upload error" }));
         res.end();
      }
    } catch (error: any) {
      writeDesktopLog(
        "upload_debug.txt",
        `single upload fatal error=${error.message || String(error)}`,
      );
      updateTransferProgress(transferId, {
        stage: "Failed",
        error: error.message || String(error),
      });
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
         res.write(JSON.stringify({ error: error.message }));
         res.end();
      }
    }
  });

  app.get("/api/tg/download/:id", async (req, res) => {
    let sessionString = getSessionString(req);
    if (!sessionString && req.query.session)
      sessionString = String(req.query.session);

    const { id } = req.params;
    if (!sessionString) {
      writeDesktopLog(
        "upload_debug.txt",
        `download denied id=${id} because session missing`,
      );
      return res.status(401).json({ error: "Not logged in" });
    }

    req.setTimeout(0);
    res.setTimeout(0);

    try {
      console.log(`[Download] Requested ID: ${id}`);
      writeDesktopLog(
        "upload_debug.txt",
        `download request id=${id} thumb=${req.query.thumb === "1"} inline=${req.query.inline === "true"}`,
      );
      let client = await getClient(sessionString);
      const messageId = parseInt(id, 10);
      
      console.log(`[Download] Fetching message ${messageId}...`);
      let messages;
      let getMessageRetries = 0;
      while (getMessageRetries < 5) {
        try {
          messages = await client.getMessages("me", { ids: [messageId] });
          break;
        } catch (err: any) {
          getMessageRetries++;
          if (handleTgError(err, sessionString) || (err.message && err.message.includes("TIMEOUT"))) {
            console.warn(`[Download] TIMEOUT getting message (attempt ${getMessageRetries}), retrying...`);
            if (getMessageRetries >= 5) throw err;
            client = await getClient(sessionString);
          } else {
            throw err;
          }
        }
      }

      if (!messages || messages.length === 0) {
        console.warn(`[Download] Message ${messageId} not found`);
        return res.status(404).json({ error: "Message not found" });
      }
      if (!messages[0].media) {
        console.warn(`[Download] Message ${messageId} has no media`);
        return res.status(404).json({ error: "Message has no media" });
      }

      const media = messages[0].media;
      let fileName = "file";
      let fileSize = 0;
      let mimeType = "application/octet-stream";

      if (media instanceof Api.MessageMediaDocument && media.document) {
        const doc = media.document as Api.Document;
        const fileNameAttr = doc.attributes?.find(
          (a: any) => a instanceof Api.DocumentAttributeFilename,
        ) as Api.DocumentAttributeFilename | undefined;
        fileName = fileNameAttr?.fileName || "file";
        fileSize = Number(doc.size);
        mimeType = doc.mimeType || "application/octet-stream";

        if (!fileName.includes(".")) {
          if (mimeType.includes("video")) fileName += ".mp4";
          else if (mimeType.includes("audio")) fileName += ".mp3";
          else if (mimeType.includes("image/jpeg")) fileName += ".jpg";
          else if (mimeType.includes("image/png")) fileName += ".png";
          else if (mimeType.includes("application/pdf")) fileName += ".pdf";
        }
        mimeType = inferMimeType(mimeType, fileName);
      } else if (media instanceof Api.MessageMediaPhoto && media.photo) {
        fileName = "photo.jpg";
        mimeType = "image/jpeg";
        const photo = media.photo as Api.Photo;
        const largest =
          photo.sizes.find((s: any) => s instanceof Api.PhotoSizeProgressive) ||
          photo.sizes[photo.sizes.length - 1];
        
        if (largest) {
          if ((largest as any).size) {
            fileSize = (largest as any).size;
          } else if ((largest as any).sizes) {
            const sizesArr = (largest as any).sizes;
            fileSize = sizesArr && sizesArr.length ? sizesArr[sizesArr.length - 1] : 0;
          }
        }
      }

      const isInline = req.query.inline === "true";
      const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>\s]/g, "_");
      const encodedFileName = encodeURIComponent(fileName);
      const contentDisposition = `${isInline ? "inline" : "attachment"}; filename="${sanitizedFileName}"; filename*=UTF-8''${encodedFileName}`;

      const isThumb = req.query.thumb === "1";
      if (isThumb) {
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");

        if (isImage) {
          try {
            const imageData = await client.downloadMedia(messages[0], {
              thumb: media instanceof Api.MessageMediaPhoto ? -1 : undefined,
            });
            const imageBuffer = toNodeBuffer(imageData as Buffer | Uint8Array | string | undefined);
            if (!imageBuffer || imageBuffer.length === 0) {
              return res.status(404).json({ error: "No image thumbnail found" });
            }
            res.setHeader("Content-Type", mimeType);
            res.setHeader("Content-Length", imageBuffer.length.toString());
            res.status(200);
            res.end(imageBuffer);
            return;
          } catch (err) {
            console.error("[Download] failed to fetch image thumbnail", err);
            if (!res.headersSent) res.status(500).json({ error: "Failed to download thumb" });
            return;
          }
        } else if (isVideo) {
          if (media instanceof Api.MessageMediaDocument && media.document) {
            const doc = media.document as Api.Document;
            const thumbs = doc.thumbs;

            if (thumbs && thumbs.length > 0) {
              const smallestThumb = thumbs[0];

              try {
                const thumbData = await client.downloadMedia(messages[0], { thumb: smallestThumb });
                const thumbBuffer = toNodeBuffer(thumbData as Buffer | Uint8Array | string | undefined);
                if (thumbBuffer && thumbBuffer.length > 0) {
                  res.setHeader("Content-Type", "image/jpeg");
                  res.setHeader("Content-Length", thumbBuffer.length.toString());
                  res.status(200);
                  res.end(thumbBuffer);
                  return;
                }
              } catch (err) {
                console.error("[Download] error fetching video thumbnail", err);
              }
            }
          }
          if (!res.headersSent) res.status(404).json({ error: "No video thumbnail found" });
          return;
        }
      }

      try {
        const canRangeStream = fileSize > 0;

        if (canRangeStream) {
          await streamTelegramRange({
            client,
            media,
            req,
            res,
            fileSize,
            mimeType,
            contentDisposition,
            sessionString,
            fileId: id,
            onError: handleTgError,
          });
          return;
        }

        const downloadedData = await client.downloadMedia(messages[0]);
        const downloadBuffer = toNodeBuffer(
          downloadedData as Buffer | Uint8Array | string | undefined,
        );

        if (!downloadBuffer || downloadBuffer.length === 0) {
          return res
            .status(404)
            .json({ error: "Failed to download file contents" });
        }

        res.setHeader("Content-Type", mimeType);
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Disposition", contentDisposition);
        res.setHeader("Content-Length", downloadBuffer.length.toString());
        res.setHeader("X-Accel-Buffering", "no");
        res.status(200);
        res.end(downloadBuffer);
      } catch (err: any) {
        console.error(`[Download] Stream error for ${id}:`, err);
        handleTgError(err, sessionString);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message || "Failed to download file" });
        } else if (!res.writableEnded) {
          res.destroy(new Error("Stream error: " + err.message));
        }
      }
    } catch (error: any) {
      console.error(`[Download] Top level error for ${id}:`, error);
      handleTgError(error, sessionString);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.CLOUDGRAM_DIST_DIR || path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

// Start local server if not on Vercel
if (process.env.NODE_ENV !== "production") {
  createServer().then((app) => {
    const LOCAL_PORT = 3000;
    app.listen(LOCAL_PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${LOCAL_PORT}`);
    });
  });
}

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};
