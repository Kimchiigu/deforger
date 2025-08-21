import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";

module {
  // HTTP types
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [HeaderField];
    body : Blob;
    certificate_version : ?Nat16;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [HeaderField];
    body : Blob;
    streaming_strategy : ?Null;
    upgrade : ?Bool;
  };

  // Data types
  public type UserProfile = {
    id : Principal;
    username : Text;
    passwordHash : Text;
    name : Text;
    role : Text;
    skills : [Text];
    portfolioUrl : Text;
  };

  public type PublicUserProfile = {
    id : Text; // Changed to Text for JSON serialization
    username : Text;
    name : Text;
    role : Text;
    skills : [Text];
    portfolioUrl : Text;
  };

  public type Session = {
    userId : Principal;
    expires : Time.Time;
  };

  public type Project = {
    id : Nat;
    owner : Principal;
    name : Text;
    vision : Text;
    team : Buffer.Buffer<Principal>;
    openRoles : Buffer.Buffer<RoleRequirement>;
    applications : Buffer.Buffer<Application>;
    isTokenized : Bool;
    totalShares : Nat;
    availableShares : Nat;
    pricePerShare : Nat;
    shareBalances : HashMap.HashMap<Principal, Nat>;
  };

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
    applicant : Text;
    projectId : Nat;
    message : Text;
    status : Text;
  };

  public type AgentMatch = {
    matchId : Nat;
    projectId : Nat;
    userId : Text; // Changed to Text for JSON serialization
    roleFilled : Text;
    timestamp : Time.Time;
  };

  public type ChatMessage = {
    id : Nat;
    projectId : Nat;
    sender : Text; // Changed to Text for JSON serialization
    content : Text;
    timestamp : Time.Time;
  };

  // Ledger types (ICRC-1 compliant for ICP ledger)
  public type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type TransferArg = {
    amount : Nat;
    fee : ?Nat;
    from_subaccount : ?Blob;
    to : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferResult = {
    #Ok : Nat;
    #Err : {
      #InsufficientFunds : { balance : Nat };
      #BadFee : { expected_fee : Nat };
      #BadBurn : { min_burn_amount : Nat };
      #Duplicate : { duplicate_of : Nat };
      #TemporarilyUnavailable;
      #GenericError : { error_code : Nat; message : Text };
      #CreatedInFuture : { ledger_time : Nat64 };
      #TooOld;
    };
  };
};