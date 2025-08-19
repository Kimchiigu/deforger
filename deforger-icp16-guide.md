# DeForger: Project Guide for NEXTGEN AGENTS HACKATHON

This document outlines the vision, features, user flow, and technical architecture for "DeForger," a decentralized talent marketplace.

---

## 1. Project Vision & Unique Value Proposition (UVP)

* **Vision:** To create a trustless, autonomous platform where entrepreneurs and skilled professionals can form teams and collaborate on innovative projects seamlessly.
* **Unique Value Proposition:** DeForger leverages autonomous AI agents (Fetch.ai) for proactive, 24/7 talent discovery, while using a decentralized backend (ICP) to ensure transparent, secure, and permanent records for all user profiles, team agreements, and project communications. It's an active, intelligent matchmaking and collaboration network.

---

## 2. Core Features

1.  **Decentralized Identity & Profiles:** Secure, on-chain user profiles detailing skills, roles, and experience.
2.  **Project & Team Creation:** Founders can create detailed project listings, outlining their vision and required roles.
3.  **Autonomous Agent Deployment:** "One-click" deployment of `TalentAgent` and `ProjectAgent` to the Agentverse for automated matchmaking.
4.  **Automated Matchmaking:** Agents autonomously search, discover, and initiate contact with potential matches.
5.  **User-Initiated Applications:** Talent can manually browse and apply to projects they find interesting. Project owners can review and manage these applications.
6.  **On-Chain Agreement Recording:** All successful matches, whether from agents or manual applications, are recorded immutably on the ICP canister.
7.  **Integrated Team Chat:** A real-time, on-chain chat system for each project, allowing seamless communication between team members.
8.  **Rich Frontend Explorer & Dashboard:** A complete web interface to browse, manage profiles, oversee agent activity, handle applications, and communicate with teams.

---

## 3. Business Process & User Flow

### Flow A: Automated Agent-Driven Matchmaking

1.  Alex (Talent) and Maria (Founder) deploy their respective agents.
2.  The agents discover each other on the Agentverse.
3.  After a successful protocol exchange, one agent calls `recordAgentMatch` on the canister.
4.  Alex is automatically added to the project's team roster.

### Flow B: Manual User-Initiated Application

1.  **Discovery:** Alex browses the `/projects` page and finds Maria's project appealing.
2.  **Application:** Alex clicks the "Apply to Join" button, fills out a short message, and submits. This calls the `applyToProject` canister method.
3.  **Notification & Review:** Maria sees a new notification in her dashboard's "Project Management" section. She can view Alex's profile and application message.
4.  **Decision:** Maria clicks "Accept." This calls the `reviewApplication` method on the canister.
5.  **On-Chain Update:** The canister validates the request, adds Alex to the project's `team` array, and marks the application as accepted. Alex is now an official team member.

### Flow C: Team Communication

1.  **Access:** Now a team member, Alex navigates to the project's page, which now has a "Team Chat" tab.
2.  **Communication:** Alex types a message ("Excited to be here! What's the first priority?") and sends it. This calls the `sendMessage` canister method.
3.  **Real-time Update:** The frontend, which is polling the `getProjectMessages` method, updates the chat window for all team members to see Alex's message.

---

## 4. Technical Architecture

### 4.1. Frontend (Component-Based Architecture)

#### Core Pages & Routes:

* **`/` (Home Page):** `Navbar`, `HeroSection`, `FeaturesGrid`, `HowItWorks`, `Footer`.
* **`/projects` (Project Explorer):** `Navbar`, `SearchAndFilterBar`, `ProjectGrid` (`ProjectCard` components), `Pagination`, `Footer`.
* **`/projects/:id` (Project Detail Page):**
    * **Components:** `Navbar`, `ProjectHeader`, `ProjectDescription`, `OpenRolesPanel`, `TeamMembersGrid`, `ApplyButton` (visible if not a member), `ProjectTabs` (`Description`, `Team Chat`), `Footer`.
    * The `Team Chat` tab will contain the `ChatWindow` component, visible only to team members.
* **`/talent` (Talent Explorer):** `Navbar`, `SearchAndFilterBar`, `TalentGrid` (`ProfileCard` components), `Pagination`, `Footer`.
* **`/dashboard` (User Dashboard - *Requires Auth*):**
    * **Components:** `Navbar`, `DashboardSidebar`, `AgentStatusPanel`, `MyProjectsPanel`, `MyTeamsPanel`, `ProfileEditor`, `ChatInterface`, `Footer`.
    * **`MyProjectsPanel` (for Founders):** Lists projects the user owns. Each project entry has an `ApplicationsViewer` to see and act on pending applications (`ApplicationCard` components).
    * **`ChatInterface`**: A centralized view of all team chats for projects the user has joined.

#### Reusable Components:

* **`ApplyButton`**: Triggers a `Modal` with a text area for an application message.
* **`ApplicationCard`**: Displays an applicant's profile summary and message, with "Accept" and "Decline" buttons.
* **`ChatWindow`**: The main chat interface, containing `MessageList` and `MessageInput`.
* **`MessageList`**: Renders a list of `Message` components.
* **`MessageInput`**: A text input field and send button for submitting new chat messages.

### 4.2. Backend Canister (Motoko)

#### Data Schema Definition

**1. `UserProfile`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Principal` | The user's unique Internet Identity principal. |
| `name` | `Text` | The user's full name or chosen alias. |
| `role` | `Text` | The user's primary professional title. |
| `skills` | `[Text]` | An array of the user's professional skills. |
| `portfolioUrl`| `Text` | A URL to an external portfolio, GitHub, etc. |

**2. `Project`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Nat` | Unique project identifier. |
| `owner` | `Principal`| Principal of the project creator. |
| `name` | `Text` | Project name. |
| `vision` | `Text` | Project description. |
| `team` | `[Principal]`| List of official team members. |
| `openRoles`| `[RoleRequirement]` | Open positions. |
| `applications`| `[Application]` | List of pending and past applications. |

**3. `RoleRequirement`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `roleName` | `Text` | The title of the open position. |
| `requiredSkills`| `[Text]` | An array of specific skills needed for this role. |

**4. `AgentMatch`** (Formerly `Match`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `matchId` | `Nat` | Unique match identifier. |
| `projectId` | `Nat` | Project involved in the match. |
| `userId` | `Principal`| User matched to the project. |
| `roleFilled`| `Text` | Role the user filled. |
| `timestamp` | `Time.Time`| Timestamp of the match. |

**5. `Application`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Nat` | Unique application identifier. |
| `applicant` | `Principal` | The principal of the user applying. |
| `projectId` | `Nat` | The ID of the project being applied to. |
| `message` | `Text` | The cover letter or message from the applicant. |
| `status` | `ApplicationStatus` | The current status: `#pending`, `#accepted`, or `#rejected`. |

**6. `ApplicationStatus` (Variant Type)**
`public type ApplicationStatus = { #pending; #accepted; #rejected; };`

**7. `ChatMessage`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Nat` | Unique message identifier. |
| `projectId` | `Nat` | The project chat this message belongs to. |
| `sender` | `Principal` | The principal of the message author. |
| `content` | `Text` | The text content of the message. |
| `timestamp` | `Time.Time` | Timestamp of when the message was sent. |

#### Public Methods (Actor)

```motoko
actor DeForger {
  // --- STATE (omitted for brevity) ---
  // Includes HashMaps for users, projects, agentMatches, applications, messages, and counters.

  // --- PROFILE & PROJECT METHODS ---
  public shared func updateUserProfile(name: Text, role: Text, skills: [Text], portfolioUrl: Text): async Bool;
  public shared func createProject(name: Text, vision: Text, openRoles: [RoleRequirement]): async Nat;

  // --- AGENT-DRIVEN MATCHING METHOD ---
  public shared func recordAgentMatch(projectId: Nat, userId: Principal, roleFilled: Text): async Bool;

  // --- USER-INITIATED APPLICATION METHODS ---
  public shared func applyToProject(projectId: Nat, message: Text): async Bool;
  public shared func reviewApplication(applicationId: Nat, accept: Bool): async Bool;

  // --- TEAM CHAT METHODS ---
  public shared func sendMessage(projectId: Nat, content: Text): async Bool;

  // --- READ-ONLY METHODS ---
  public query func getUserProfile(userId: Principal): async ?UserProfile;
  public query func getProject(projectId: Nat): async ?Project;
  public query func getAllProjects(): async [Project];
  public query func getProjectMessages(projectId: Nat): async [ChatMessage];
  public query func getAllAgentMatches(): async [AgentMatch];
}
```

### 4.3. AI Agents (Fetch.ai uAgent)
- TalentAgent: Represents a user, tasked with finding projects that need their skills. Logic remains focused on discovery and calling recordAgentMatch.

- ProjectAgent: Represents a project, tasked with finding talent to fill open roles. Logic remains focused on discovery and calling recordAgentMatch.

- Communication Protocol: A simple JSON-based messaging format for agents to exchange information (e.g., query_project_details, propose_match).