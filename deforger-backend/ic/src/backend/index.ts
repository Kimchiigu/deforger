import express, { Request } from "express";
import crypto from "crypto";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";

// Ledger Candid interface (based on ICP ledger standard)
const LedgerService = IDL.Service({
  account_balance: IDL.Func([IDL.Record({ account: IDL.Vec(IDL.Nat8) })], [IDL.Record({ e8s: IDL.Nat64 })], ["query"]),
  transfer: IDL.Func(
    [
      IDL.Record({
        to: IDL.Vec(IDL.Nat8),
        fee: IDL.Record({ e8s: IDL.Nat64 }),
        amount: IDL.Record({ e8s: IDL.Nat64 }),
        memo: IDL.Nat64,
        from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        created_at_time: IDL.Opt(IDL.Record({ timestamp_nanos: IDL.Nat64 })),
      }),
    ],
    [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
    [],
  ),
});

// Ledger setup
const LEDGER_CANISTER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
const DFX_NETWORK = process.env.DFX_NETWORK || "local";
const HOST = DFX_NETWORK === "local" ? "http://127.0.0.1:4943" : "https://ic0.app";
console.log("DFX_NETWORK:", DFX_NETWORK, "HOST:", HOST); // Debug
const agent = new HttpAgent({ host: HOST });

if (DFX_NETWORK === "local") {
  agent.fetchRootKey().catch((err) => {
    console.error("Failed to fetch root key for local replica:", err);
    throw err;
  });
}

const ledger = Actor.createActor(() => LedgerService, { agent, canisterId: LEDGER_CANISTER_ID });

// Simulated stable storage (since ic.stableStore is unavailable)
let stableStorage: string | null = null;

const app = express();
app.use(express.json());

// State (mutable for stable storage)
let users: Map<string, UserProfile> = new Map();
let usernames: Map<string, string> = new Map();
let sessions: Map<string, Session> = new Map();
let projects: Map<bigint, Project> = new Map();
let agentMatches: Map<bigint, AgentMatch> = new Map();
let nextProjectId: bigint = 0n;
let nextMatchId: bigint = 0n;
let nextApplicationId: bigint = 0n;
let nextMessageId: bigint = 0n;
let lastProjectBalances: Map<bigint, bigint> = new Map();

// Data Types
interface UserProfile {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
  skills: string[];
  portfolioUrl: string;
  walletPrincipal?: string; // Optional for withdrawal
}

interface Session {
  userId: string;
  token: string;
  expires: number;
}

interface Project {
  id: bigint;
  owner: string;
  name: string;
  vision: string;
  team: string[];
  openRoles: RoleRequirement[];
  applications: Application[];
  messages: ChatMessage[];
  isTokenized: boolean;
  totalShares: bigint;
  availableShares: bigint;
  pricePerShare: bigint;
  shareBalances: Map<string, bigint>;
}

interface RoleRequirement {
  roleName: string;
  requiredSkills: string[];
}

interface AgentMatch {
  matchId: bigint;
  projectId: bigint;
  userId: string;
  roleFilled: string;
  timestamp: number;
}

interface Application {
  id: bigint;
  applicant: string;
  projectId: bigint;
  message: string;
  status: "pending" | "accepted" | "rejected";
}

interface ChatMessage {
  id: bigint;
  projectId: bigint;
  sender: string;
  content: string;
  timestamp: number;
}

// Type definitions for ledger calls
interface AccountBalanceResult {
  e8s: bigint;
}

interface TransferResult {
  Ok?: bigint;
  Err?: string;
}

// Helpers
function hashPassword(password: string): string {
  if (!password) throw new Error("Password is required");
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getUserIdFromToken(token: string): string | null {
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    return null;
  }
  return session.userId;
}

function crc32(data: Uint8Array): Uint8Array {
  let crc = 0xffffffff;
  for (let byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  crc ^= 0xffffffff;
  const buffer = new Uint8Array(4);
  buffer[0] = (crc >> 24) & 0xff;
  buffer[1] = (crc >> 16) & 0xff;
  buffer[2] = (crc >> 8) & 0xff;
  buffer[3] = crc & 0xff;
  return buffer;
}

function getAccountIdentifier(principal: Principal, subaccount: Uint8Array = new Uint8Array(32)): Uint8Array {
  const sha224 = crypto.createHash("sha224");
  sha224.update(Buffer.from([0x0a, ..."account-id".split("").map((c) => c.charCodeAt(0))]));
  sha224.update(principal.toUint8Array());
  sha224.update(subaccount);
  const hash = sha224.digest();
  const crc = crc32(hash);
  return new Uint8Array([...crc, ...hash]);
}

function projectSubaccount(projectId: bigint): Uint8Array {
  const subaccount = new Uint8Array(32);
  let i = 31;
  while (projectId > 0n && i >= 0) {
    subaccount[i] = Number(projectId % 256n);
    projectId /= 256n;
    i--;
  }
  return subaccount;
}

// Get canister ID (use environment variable since ic.id() is unavailable)
function getCanisterId(): Principal {
  const canisterId = process.env.CANISTER_ID;
  if (!canisterId) {
    throw new Error("CANISTER_ID environment variable not set");
  }
  return Principal.fromText(canisterId);
}

// Endpoints
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to DeForger Canister API" });
});

app.post("/register", (req: Request, res) => {
  const { username, password, name, role, skills, portfolioUrl, walletPrincipal } = req.body;
  if (!username || !password || !name || !role || !skills) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (usernames.has(username)) {
    return res.status(400).json(false);
  }
  const passwordHash = hashPassword(password);
  const userId = crypto.randomBytes(16).toString("hex");
  const profile: UserProfile = {
    id: userId,
    username,
    passwordHash,
    name,
    role,
    skills,
    portfolioUrl,
  };
  if (walletPrincipal) profile.walletPrincipal = walletPrincipal;
  users.set(userId, profile);
  usernames.set(username, userId);
  res.json(true);
});

app.post("/login", (req: Request, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const userId = usernames.get(username);
  if (!userId) return res.status(400).json(null);
  const profile = users.get(userId);
  if (!profile || profile.passwordHash !== hashPassword(password)) return res.status(400).json(null);
  const token = generateToken();
  const expires = Date.now() + 24 * 3600 * 1000;
  sessions.set(token, { userId, token, expires });
  res.json(token);
});

app.post("/changePassword", (req: Request, res) => {
  const { token, newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "New password required" });
  const userId = getUserIdFromToken(token);
  if (!userId) return res.status(401).json(false);
  const profile = users.get(userId);
  if (!profile) return res.status(404).json(false);
  profile.passwordHash = hashPassword(newPassword);
  res.json(true);
});

app.post("/updateUserProfile", (req: Request, res) => {
  const { token, name, role, skills, portfolioUrl } = req.body;
  const userId = getUserIdFromToken(token);
  if (!userId) return res.status(401).json(false);
  const profile = users.get(userId);
  if (!profile) return res.status(404).json(false);
  if (name) profile.name = name;
  if (role) profile.role = role;
  if (skills) profile.skills = skills;
  if (portfolioUrl) profile.portfolioUrl = portfolioUrl;
  res.json(true);
});

app.post("/createProject", (req: Request, res) => {
  const { token, name, vision, openRoles } = req.body;
  if (!name || !vision || !openRoles) return res.status(400).json({ error: "Missing required fields" });
  const userId = getUserIdFromToken(token);
  if (!userId) return res.status(401).json(null);
  const projectId = nextProjectId++;
  const project: Project = {
    id: projectId,
    owner: userId,
    name,
    vision,
    team: [userId],
    openRoles,
    applications: [],
    messages: [],
    isTokenized: false,
    totalShares: 0n,
    availableShares: 0n,
    pricePerShare: 0n,
    shareBalances: new Map(),
  };
  projects.set(projectId, project);
  lastProjectBalances.set(projectId, 0n);
  res.json(projectId.toString());
});

app.post("/recordAgentMatch", (req: Request, res) => {
  const { token, projectId, userId: matchedUserId, roleFilled } = req.body;
  if (!projectId || !matchedUserId || !roleFilled) return res.status(400).json({ error: "Missing required fields" });
  const callerId = getUserIdFromToken(token);
  if (!callerId) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project) return res.status(404).json(false);
  project.team.push(matchedUserId);
  project.openRoles = project.openRoles.filter((r) => r.roleName !== roleFilled);
  const matchId = nextMatchId++;
  agentMatches.set(matchId, {
    matchId,
    projectId: pid,
    userId: matchedUserId,
    roleFilled,
    timestamp: Date.now(),
  });
  res.json(true);
});

app.post("/applyToProject", (req: Request, res) => {
  const { token, projectId, message } = req.body;
  if (!projectId || !message) return res.status(400).json({ error: "Missing required fields" });
  const applicant = getUserIdFromToken(token);
  if (!applicant) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project) return res.status(404).json(false);
  const appId = nextApplicationId++;
  project.applications.push({
    id: appId,
    applicant,
    projectId: pid,
    message,
    status: "pending",
  });
  res.json(true);
});

app.post("/reviewApplication", (req: Request, res) => {
  const { token, applicationId, accept } = req.body;
  if (!applicationId || accept === undefined) return res.status(400).json({ error: "Missing required fields" });
  const caller = getUserIdFromToken(token);
  if (!caller) return res.status(401).json(false);
  const appId = BigInt(applicationId);
  let found = false;
  for (const project of projects.values()) {
    const appIndex = project.applications.findIndex((a) => a.id === appId);
    if (appIndex !== -1 && project.owner === caller) {
      found = true;
      const app = project.applications[appIndex];
      app.status = accept ? "accepted" : "rejected";
      if (accept) project.team.push(app.applicant);
      break;
    }
  }
  if (!found) return res.status(403).json(false);
  res.json(true);
});

app.post("/sendMessage", (req: Request, res) => {
  const { token, projectId, content } = req.body;
  if (!projectId || !content) return res.status(400).json({ error: "Missing required fields" });
  const sender = getUserIdFromToken(token);
  if (!sender) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project || !project.team.includes(sender)) return res.status(403).json(false);
  const msgId = nextMessageId++;
  project.messages.push({
    id: msgId,
    projectId: pid,
    sender,
    content,
    timestamp: Date.now(),
  });
  res.json(true);
});

app.post("/tokenizeProject", (req: Request, res) => {
  const { token, projectId, totalShares, pricePerShare } = req.body;
  if (!projectId || !totalShares || !pricePerShare) return res.status(400).json({ error: "Missing required fields" });
  const caller = getUserIdFromToken(token);
  if (!caller) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project || project.owner !== caller || project.isTokenized) return res.status(403).json(false);
  project.isTokenized = true;
  project.totalShares = BigInt(totalShares);
  project.availableShares = BigInt(totalShares);
  project.pricePerShare = BigInt(pricePerShare);
  res.json(true);
});

app.post("/buyShares", async (req: Request, res) => {
  const { token, projectId, numShares } = req.body;
  if (!projectId || !numShares) return res.status(400).json({ error: "Missing required fields" });
  const buyer = getUserIdFromToken(token);
  if (!buyer) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project || !project.isTokenized) return res.status(400).json(false);
  const shares = BigInt(numShares);
  if (shares > project.availableShares) return res.status(400).json(false);
  const cost = shares * project.pricePerShare;
  const accountId = getAccountIdentifier(getCanisterId(), projectSubaccount(pid));
  const result = (await ledger.call("account_balance", { account: accountId })) as [AccountBalanceResult];
  const currentBalance = result[0].e8s;
  const last = lastProjectBalances.get(pid) || 0n;
  if (currentBalance < last + cost) return res.status(400).json({ error: "Insufficient funds" });
  lastProjectBalances.set(pid, currentBalance);
  const buyerShares = project.shareBalances.get(buyer) || 0n;
  project.shareBalances.set(buyer, buyerShares + shares);
  project.availableShares -= shares;
  res.json(true);
});

app.post("/withdrawProjectFunds", async (req: Request, res) => {
  const { token, projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: "Project ID required" });
  const caller = getUserIdFromToken(token);
  if (!caller) return res.status(401).json(false);
  const pid = BigInt(projectId);
  const project = projects.get(pid);
  if (!project || project.owner !== caller) return res.status(403).json(false);
  const profile = users.get(caller);
  if (!profile || !profile.walletPrincipal) return res.status(400).json({ error: "Wallet principal required" });
  const subaccount = projectSubaccount(pid);
  const accountId = getAccountIdentifier(getCanisterId(), subaccount);
  const balanceResult = (await ledger.call("account_balance", { account: accountId })) as [AccountBalanceResult];
  const balance = balanceResult[0].e8s;
  const fee = 10000n;
  const amount = balance - fee;
  if (amount <= 0n) return res.status(400).json({ error: "Insufficient balance" });
  const toPrincipal = Principal.fromText(profile.walletPrincipal);
  const toAccount = getAccountIdentifier(toPrincipal);
  const result = (await ledger.call("transfer", {
    to: toAccount,
    fee: { e8s: fee },
    amount: { e8s: amount },
    memo: 0n,
    from_subaccount: [Array.from(subaccount)],
    created_at_time: [{ timestamp_nanos: BigInt(Date.now() * 1_000_000) }],
  })) as [TransferResult];
  if (result[0].Err) return res.status(500).json({ error: `Transfer failed: ${result[0].Err}` });
  lastProjectBalances.set(pid, 0n);
  res.json(true);
});

// Query Endpoints (no auth)
app.post("/getUserProfile", (req: Request, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID required" });
  res.json(users.get(userId) || null);
});

app.post("/getProject", (req: Request, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: "Project ID required" });
  const project = projects.get(BigInt(projectId));
  if (project) {
    res.json({
      ...project,
      shareBalances: Array.from(project.shareBalances),
    });
  } else {
    res.json(null);
  }
});

app.get("/getAllProjects", (_req, res) => {
  const allProjects = Array.from(projects.values()).map((p) => ({
    ...p,
    shareBalances: Array.from(p.shareBalances),
  }));
  res.json(allProjects);
});

app.post("/getProjectMessages", (req: Request, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: "Project ID required" });
  const project = projects.get(BigInt(projectId));
  res.json(project ? project.messages : []);
});

app.get("/getAllAgentMatches", (_req, res) => {
  res.json(Array.from(agentMatches.values()));
});

app.post("/getProjectShareBalance", (req: Request, res) => {
  const { projectId, userId } = req.body;
  if (!projectId || !userId) return res.status(400).json({ error: "Project ID and user ID required" });
  const project = projects.get(BigInt(projectId));
  const balance = project ? project.shareBalances.get(userId) || 0n : 0n;
  res.json(balance.toString());
});

// Stable Storage Hooks
export function _azlePreUpgrade() {
  const state = {
    users: Array.from(users.entries()),
    usernames: Array.from(usernames.entries()),
    sessions: Array.from(sessions.entries()),
    projects: Array.from(projects.entries()).map(([id, p]) => [id, {
      ...p,
      shareBalances: Array.from(p.shareBalances.entries()),
    }]),
    agentMatches: Array.from(agentMatches.entries()),
    nextProjectId,
    nextMatchId,
    nextApplicationId,
    nextMessageId,
    lastProjectBalances: Array.from(lastProjectBalances.entries()),
  };
  stableStorage = JSON.stringify(state);
}

export function _azlePostUpgrade() {
  if (!stableStorage) return;
  const parsed = JSON.parse(stableStorage);
  users = new Map(parsed.users);
  usernames = new Map(parsed.usernames);
  sessions = new Map(parsed.sessions);
  projects = new Map(parsed.projects.map(([id, p]: [string, any]) => [BigInt(id), {
    ...p,
    shareBalances: new Map(p.shareBalances),
  }]));
  agentMatches = new Map(parsed.agentMatches.map(([id, m]: [string, AgentMatch]) => [BigInt(id), m]));
  nextProjectId = BigInt(parsed.nextProjectId);
  nextMatchId = BigInt(parsed.nextMatchId);
  nextApplicationId = BigInt(parsed.nextApplicationId);
  nextMessageId = BigInt(parsed.nextMessageId);
  lastProjectBalances = new Map(parsed.lastProjectBalances.map(([id, b]: [string, string]) => [BigInt(id), BigInt(b)]));
}

app.listen();