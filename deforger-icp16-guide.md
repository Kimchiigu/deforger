# DeForger: Decentralized Talent Marketplace for NEXTGEN AGENTS HACKATHON

DeForger is a decentralized platform leveraging Fetch.ai autonomous agents and Internet Computer (ICP) for seamless talent discovery, team collaboration, project investment through tokenized Real World Assets (RWAs), and a custom account system for user authentication.

## Project Vision & Unique Value Proposition

**Vision**: To create a trustless, autonomous platform where entrepreneurs and skilled professionals can form teams, collaborate on innovative projects, and invest in opportunities seamlessly.

**Unique Value Proposition**: DeForger combines Fetch.ai's AI agents for proactive, 24/7 talent matchmaking with ICP's decentralized backend for transparent, secure, and immutable records of profiles, agreements, communications, tokenized shares, and user accounts. It’s an intelligent, active network for collaboration, investment, and user management.

## Core Features

1. **Custom Account System**: Users register with a username and password, securely stored as hashed credentials on the ICP canister, linked to their `UserProfile`.
2. **Decentralized Identity & Profiles**: Secure, on-chain user profiles detailing skills, roles, and experience, tied to authenticated accounts.
3. **Project & Team Creation**: Founders create detailed project listings with vision and required roles.
4. **Autonomous Agent Deployment**: One-click deployment of `TalentAgent` and `ProjectAgent` to the Agentverse for automated matchmaking.
5. **Automated Matchmaking**: Agents autonomously search and initiate contact with potential matches.
6. **User-Initiated Applications**: Talent can browse and apply to projects; founders review and manage applications.
7. **On-Chain Agreement Recording**: Matches (agent-driven or manual) are immutably recorded on ICP.
8. **Integrated Team Chat**: Real-time, on-chain chat system for project team communication.
9. **Rich Frontend Explorer & Dashboard**: Web interface for browsing, managing profiles, overseeing agents, handling applications, communicating, and managing accounts.
10. **Project Tokenization & RWA Share Sales**: Founders tokenize projects as digital shares, enabling users to invest via ICP payments.

## Business Process & User Flow

### Flow A: Account Creation & Authentication
1. **Registration**: Alex visits `/register`, enters a username, password, and profile details (name, role, skills, portfolio URL), calling `register`.
2. **Login**: Alex visits `/login`, enters credentials, calling `login`. On success, a session token is returned and stored in the browser.
3. **Profile Access**: Authenticated users access their dashboard, where they can update profiles or change passwords via `changePassword`.

### Flow B: Automated Agent-Driven Matchmaking
1. Alex (Talent) and Maria (Founder), after logging in, deploy their `TalentAgent` and `ProjectAgent`.
2. Agents discover each other on the Agentverse.
3. After protocol exchange, an agent calls `recordAgentMatch` (authenticated via session token or principal).
4. Alex is added to the project’s team roster.

### Flow C: Manual User-Initiated Application
1. **Discovery**: Alex browses `/projects` and finds Maria’s project.
2. **Application**: Alex clicks "Apply to Join," submits a message, calling `applyToProject` (authenticated).
3. **Notification & Review**: Maria sees the application in her dashboard’s "Project Management" section.
4. **Decision**: Maria accepts, calling `reviewApplication` (authenticated).
5. **On-Chain Update**: The canister adds Alex to the team and marks the application as accepted.

### Flow D: Team Communication
1. **Access**: Alex, now a team member, accesses the project’s "Team Chat" tab.
2. **Communication**: Alex sends a message via `sendMessage` (authenticated).
3. **Real-time Update**: The frontend polls `getProjectMessages` to update the chat for all team members.

### Flow E: Project Tokenization & Investing (RWA Share Sales)
1. **Tokenization**: Maria clicks "Tokenize Project" in the dashboard, sets share supply and price, calling `tokenizeProject` (authenticated).
2. **Discovery**: Alex sees tokenized project details (supply, price) on `/projects` or project page.
3. **Purchase**: Alex clicks "Buy Shares," transfers ICP to the project’s subaccount, and calls `buyShares` (authenticated).
4. **On-Chain Update**: The canister verifies payment, updates Alex’s share balance, and reduces available shares.
5. **Withdrawal**: Maria withdraws accumulated ICP via `withdrawProjectFunds` (authenticated).

**Note**: Payments use ICP ledger transfers to project subaccounts. Shares are managed as simple balances per project (not full ICRC-1 for prototype simplicity). All canister interactions require authentication via session token or principal.

## Technical Architecture

### Frontend (Component-Based Architecture)

#### Core Pages & Routes
- **`/`: Home Page** (`Navbar`, `HeroSection`, `FeaturesGrid`, `HowItWorks`, `Footer`)
- **`/login`: Login Page** (`Navbar`, `LoginForm`, `Footer`)
- **`/register`: Registration Page** (`Navbar`, `RegisterForm`, `Footer`)
- **`/projects`: Project Explorer** (`Navbar`, `SearchAndFilterBar`, `ProjectGrid` with `ProjectCard` showing tokenization status, `Pagination`, `Footer`)
- **`/projects/:id`: Project Detail Page**
  - Components: `Navbar`, `ProjectHeader`, `ProjectDescription`, `OpenRolesPanel`, `TeamMembersGrid`, `ApplyButton` (if not a member), `ProjectTabs` (`Description`, `Team Chat`, `Invest`), `TokenInfoPanel` (share details), `BuySharesButton`, `Footer`
  - `Team Chat` tab: `ChatWindow` (visible to team members)
  - `Invest` tab: Share purchase interface and shareholder list
- **`/talent`: Talent Explorer** (`Navbar`, `SearchAndFilterBar`, `TalentGrid` with `ProfileCard`, `Pagination`, `Footer`)
- **`/dashboard`: User Dashboard (Requires Auth)**
  - Components: `Navbar`, `DashboardSidebar`, `AgentStatusPanel`, `MyProjectsPanel`, `MyTeamsPanel`, `ProfileEditor`, `ChatInterface`, `MyInvestmentsPanel` (lists invested projects), `AccountManagementPanel` (change password), `Footer`
  - `MyProjectsPanel` (Founders): Lists owned projects, with `ApplicationsViewer` (`ApplicationCard`) and `TokenManagementSection` for tokenization and fund withdrawal
  - `ChatInterface`: Centralized view of all team chats
  - `AccountManagementPanel`: Interface for updating password or account settings

#### Reusable Components
- `LoginForm`: Username and password inputs, submits to `login`.
- `RegisterForm`: Username, password, and profile fields, submits to `register`.
- `ApplyButton`: Opens `Modal` for application message.
- `ApplicationCard`: Shows applicant profile and message, with "Accept"/"Decline" buttons.
- `ChatWindow`: Contains `MessageList` and `MessageInput`.
- `MessageList`: Renders `Message` components.
- `MessageInput`: Text input and send button for chat.
- `BuySharesModal`: Handles share purchase flow (ICP transfer + canister call).
- `TokenInfo`: Displays share supply, price, and balances.
- `AccountManagementPanel`: Form for changing password or updating account details.

**Frontend Notes**: Session tokens are stored in browser session storage and included in canister calls for authentication. All routes requiring auth (e.g., `/dashboard`) check for valid tokens.

### Backend Canister (Motoko)

#### Data Schema
1. **UserProfile**
   - `id: Principal` (canister-derived or wallet-provided principal)
   - `username: Text` (unique username for login)
   - `passwordHash: Text` (SHA-256 hashed password)
   - `name: Text` (full name/alias)
   - `role: Text` (professional title)
   - `skills: [Text]` (professional skills)
   - `portfolioUrl: Text` (external portfolio link)

2. **Session**
   - `userId: Principal` (linked user)
   - `token: Text` (random session token, e.g., UUID)
   - `expires: Time.Time` (expiration timestamp, e.g., 24 hours from creation)

3. **Project**
   - `id: Nat` (unique identifier)
   - `owner: Principal` (creator)
   - `name: Text` (project name)
   - `vision: Text` (description)
   - `team: [Principal]` (team members)
   - `openRoles: [RoleRequirement]` (open positions)
   - `applications: [Application]` (pending/past applications)
   - `isTokenized: Bool` (tokenization status)
   - `totalShares: Nat` (total share supply)
   - `availableShares: Nat` (remaining shares)
   - `pricePerShare: Nat` (price in ICP e8s)
   - `shareBalances: [(Principal, Nat)]` (shareholder balances)

4. **RoleRequirement**
   - `roleName: Text` (position title)
   - `requiredSkills: [Text]` (needed skills)

5. **AgentMatch**
   - `matchId: Nat` (unique identifier)
   - `projectId: Nat` (project)
   - `userId: Principal` (matched user)
   - `roleFilled: Text` (role)
   - `timestamp: Time.Time` (match time)

6. **Application**
   - `id: Nat` (unique identifier)
   - `applicant: Principal` (applicant)
   - `projectId: Nat` (project)
   - `message: Text` (cover letter)
   - `status: ApplicationStatus` (`#pending`, `#accepted`, `#rejected`)

7. **ApplicationStatus (Variant)**
   ```motoko
   public type ApplicationStatus = { #pending; #accepted; #rejected; };
   ```

8. **ChatMessage**
   - `id: Nat` (unique identifier)
   - `projectId: Nat` (project chat)
   - `sender: Principal` (message author)
   - `content: Text` (message text)
   - `timestamp: Time.Time` (sent time)

**Account System Notes**: 
- Passwords are hashed using SHA-256 (Motoko’s `Hash` module). For production, add salting.
- Sessions are stored in a HashMap, validated per request, and expire after 24 hours.
- `UserProfile` links usernames to principals for authentication.

**RWA Note**: Shares are managed as balances within `Project`. For production, use per-project ICRC-1 token canisters. Payments use ICP ledger; subaccounts are derived from project IDs.

#### Public Methods (Actor)
```motoko
actor DeForger {
  // State: HashMaps for users, sessions, projects, agentMatches, applications, messages, counters; ICP ledger integration

  // Account Management
  public shared func register(username: Text, password: Text, name: Text, role: Text, skills: [Text], portfolioUrl: Text): async Bool; // Creates account, hashes password, links to UserProfile
  public shared func login(username: Text, password: Text): async ?Text; // Returns session token if credentials valid
  public shared func changePassword(token: Text, newPassword: Text): async Bool; // Updates password for authenticated user

  // Profile & Project Methods
  public shared ({caller}) func updateUserProfile(token: Text, name: Text, role: Text, skills: [Text], portfolioUrl: Text): async Bool; // Requires valid token
  public shared ({caller}) func createProject(token: Text, name: Text, vision: Text, openRoles: [RoleRequirement]): async Nat; // Requires valid token

  // Agent-Driven Matching
  public shared ({caller}) func recordAgentMatch(token: Text, projectId: Nat, userId: Principal, roleFilled: Text): async Bool; // Requires valid token

  // User-Initiated Applications
  public shared ({caller}) func applyToProject(token: Text, projectId: Nat, message: Text): async Bool; // Requires valid token
  public shared ({caller}) func reviewApplication(token: Text, applicationId: Nat, accept: Bool): async Bool; // Requires valid token

  // Team Chat
  public shared ({caller}) func sendMessage(token: Text, projectId: Nat, content: Text): async Bool; // Requires valid token

  // RWA Tokenization & Share Sales
  public shared ({caller}) func tokenizeProject(token: Text, projectId: Nat, totalShares: Nat, pricePerShare: Nat): async Bool; // Owner-only; initializes shares
  public shared ({caller}) func buyShares(token: Text, projectId: Nat, numShares: Nat): async Bool; // Verifies ICP transfer, allocates shares
  public shared ({caller}) func withdrawProjectFunds(token: Text, projectId: Nat): async Bool; // Owner-only; transfers ICP to owner

  // Read-Only Queries
  public query func getUserProfile(userId: Principal): async ?UserProfile;
  public query func getProject(projectId: Nat): async ?Project;
  public query func getAllProjects(): async [Project];
  public query func getProjectMessages(projectId: Nat): async [ChatMessage];
  public query func getAllAgentMatches(): async [AgentMatch];
  public query func getProjectShareBalance(projectId: Nat, userId: Principal): async Nat;
}
```

**RWA Technical Notes**:
- **ICP Ledger Integration**: Import Candid interface for balance queries and transfers.
- **Subaccounts**: Derive per-project subaccounts using project ID.
- **buyShares**: Verifies ICP transfer to subaccount (price * numShares), updates balances, reduces available shares.
- **withdrawProjectFunds**: Transfers ICP from subaccount to owner’s principal.
- **Simplification**: Uses balance system for shares; production should use ICRC-1/2 standards.

**Authentication Notes**:
- All shared methods (except `register`, `login`) require a valid session `token` passed in the call, verified against the `Sessions` HashMap.
- `caller` principal is checked for ownership-sensitive actions (e.g., `withdrawProjectFunds`).
- For simplicity, principals can be canister-generated (e.g., based on username hash) or linked to a user’s wallet.

### AI Agents (Fetch.ai uAgent)
- **TalentAgent**: Finds projects matching user skills, calls `recordAgentMatch` with authenticated token.
- **ProjectAgent**: Finds talent for open roles, calls `recordAgentMatch` with authenticated token.
- **Communication Protocol**: JSON-based messaging (e.g., `query_project_details`, `propose_match`), includes session token for canister calls.
- **Future Extension**: Add `InvestorAgent` for discovering tokenized projects and proposing investments.

## Getting Started
1. **Deploy Canister**: Deploy the Motoko canister on ICP with ledger integration.
2. **Deploy Agents**: Use Fetch.ai Agentverse to deploy `TalentAgent` and `ProjectAgent`.
3. **Frontend Setup**: Host the React-based frontend (with Tailwind CSS), connect to canister and Agentverse, and implement session token handling.
4. **Test Flows**: Test account creation, login, matchmaking, applications, chat, share purchases, and fund withdrawals via the frontend.

## Future Enhancements
- Full ICRC-1/2 token implementation for project shares.
- Enhanced agent logic for investment discovery.
- Advanced security: Salting for password hashing, JWT-like session tokens, and robust payment verification.
- Support for wallet-based principal generation for broader compatibility.