import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";

module Types {
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [HeaderField];
    body : Blob;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [HeaderField];
    body : Blob;
    streaming_strategy : ?Null;
    upgrade : ?Bool;
  };

  public type LoginResponse = {
    userId : Text;
    token : Text;
  };

  // Internal user profile, includes sensitive password hash.
  public type UserProfile = {
    id : Text;                 // Unique Text ID, e.g., "user-1"
    username : Text;
    passwordHash : Text;
    name : Text;
    role : Text;
    skills : [Text];
    portfolioUrl : Text;
  };

  // Public-facing user profile, excludes sensitive data.
  public type PublicUserProfile = {
    id : Text;
    username : Text;
    name : Text;
    role : Text;
    skills : [Text];
    portfolioUrl : Text;
  };

  // Session record for user authentication.
  public type Session = {
    userId : Text;             // Links session to a Text user ID
    expires : Time.Time;
  };

  // Project data structure.
  public type Project = {
    id : Nat;
    owner : Text;              // Text ID of the project creator
    name : Text;
    vision : Text;
    team : Buffer.Buffer<Text>; // Team members are stored by their Text IDs
    openRoles : Buffer.Buffer<RoleRequirement>;
    applications : Buffer.Buffer<Application>;
    isTokenized : Bool;
    totalShares : Nat;
    availableShares : Nat;
    pricePerShare : Nat;
    shareBalances : HashMap.HashMap<Text, Nat>; // Share balances mapped by Text user ID
  };

  // Public-facing project data.
  public type PublicProject = {
    id : Nat;
    owner : Text;
    name : Text;
    vision : Text;
    team : [Text];
    openRoles : [RoleRequirement];
    applications : [Application];
    isTokenized : Bool;
    totalShares : Nat;
    availableShares : Nat;
    pricePerShare : Nat;
    shareBalances : [(Text, Nat)];
  };

  public type RoleRequirement = {
    roleName : Text;
    requiredSkills : [Text];
  };

  public type Application = {
    id : Nat;
    applicant : Text;          // Applicant identified by Text ID
    projectId : Nat;
    message : Text;
    status : Text;             // e.g., "pending", "accepted", "rejected"
  };

  public type AgentMatch = {
    matchId : Nat;
    projectId : Nat;
    userId : Text;             // Matched user's Text ID
    roleFilled : Text;
    timestamp : Time.Time;
  };

  public type ChatMessage = {
    id : Nat;
    projectId : Nat;
    sender : Text;             // Sender's Text ID
    content : Text;
    timestamp : Time.Time;
  };
};
