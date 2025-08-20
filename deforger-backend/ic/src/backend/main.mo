import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Sha256 "mo:sha2/Sha256";
import JSON "mo:serde/JSON";
import Hex "mo:hex";
import Types "./Types";

actor DeForger {
  // Custom hashing functions to resolve dependency conflicts
  // The HashMap requires a function that returns a `Hash` type, which is an alias for `Nat32`.
  private func customPrincipalHash(p : Principal) : Nat32 {
    let blob = Principal.toBlob(p);
    var hash : Nat = 0;
    for (byte in blob.vals()) {
      // Explicitly convert Nat8 to Nat for the arithmetic operation.
      hash := (hash * 31 + Nat8.toNat(byte)) % 1_000_000_007;
    };
    // Use Nat32.fromNat() for the conversion.
    return Nat32.fromNat(hash);
  };

  private func customNatHash(n : Nat) : Nat32 {
    // Use Nat32.fromNat() for the conversion.
    return Nat32.fromNat(n);
  };

  // State
  private var userCounter : Nat = 0;
  private var users : HashMap.HashMap<Text, Types.UserProfile> = HashMap.HashMap<Text, Types.UserProfile>(0, Text.equal, Text.hash);
  private var idToUsername : HashMap.HashMap<Principal, Text> = HashMap.HashMap<Principal, Text>(0, Principal.equal, customPrincipalHash);
  private var sessions : HashMap.HashMap<Text, Types.Session> = HashMap.HashMap<Text, Types.Session>(0, Text.equal, Text.hash);
  private var projectCounter : Nat = 0;
  private var projects : HashMap.HashMap<Nat, Types.Project> = HashMap.HashMap<Nat, Types.Project>(0, Nat.equal, customNatHash);
  private var agentMatchCounter : Nat = 0;
  private var agentMatches : Buffer.Buffer<Types.AgentMatch> = Buffer.Buffer<Types.AgentMatch>(0);
  private var applicationCounter : Nat = 0;
  private var messageCounter : Nat = 0;
  private var messages : HashMap.HashMap<Nat, Buffer.Buffer<Types.ChatMessage>> = HashMap.HashMap<Nat, Buffer.Buffer<Types.ChatMessage>>(0, Nat.equal, customNatHash);

  // Ledger
  private let LEDGER_CANISTER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); // Mainnet ICP ledger
  private let ledger = actor (Principal.toText(LEDGER_CANISTER_ID)) : actor {
    icrc1_balance_of : query Types.Account -> async Nat;
    icrc1_transfer : Types.TransferArg -> async Types.TransferResult;
  };
  private let canisterId = Principal.fromText("aaaaa-aa"); // REPLACE WITH ACTUAL CANISTER PRINCIPAL AFTER DEPLOYMENT

  // Helper functions
  private func validateToken(token : Text) : ?Principal {
    switch (sessions.get(token)) {
      case (null) { null };
      case (?sess) {
        if (Time.now() > sess.expires) {
          sessions.delete(token);
          null;
        } else {
          ?sess.userId;
        };
      };
    };
  };

  private func projectSubaccount(id : Nat) : Blob {
    let bytes = Array.init<Nat8>(32, 0);
    var temp = id;
    var i = 31;
    while (temp > 0 and i >= 0) {
      bytes[i] := Nat8.fromNat(temp % 256);
      temp /= 256;
      i -= 1;
    };
    Blob.fromArrayMut(bytes);
  };

  // Helper to encode a Blob to a hex Text
  private func blobToHex(blob : Blob) : Text {
    var hexText = "";
    for (byte in blob.vals()) {
      hexText #= Hex.encodeByte(byte);
    };
    return hexText;
  };

  // Public methods (direct calls)
  public shared func register(username : Text, password : Text, name : Text, role : Text, skills : [Text], portfolioUrl : Text) : async Bool {
    if (users.get(username) != null) { return false };
    let salt = Text.encodeUtf8(username); // Simple salting
    let passBlob = Text.encodeUtf8(password);
    let saltedPassword = Blob.fromArray(Array.append(Blob.toArray(salt), Blob.toArray(passBlob)));
    let hashBlob = Sha256.fromBlob(#sha256, saltedPassword);
    let hash = blobToHex(hashBlob);
    let userId = Principal.fromText(username);
    let profile : Types.UserProfile = {
      id = userId;
      username = username;
      passwordHash = hash;
      name = name;
      role = role;
      skills = skills;
      portfolioUrl = portfolioUrl;
    };
    users.put(username, profile);
    idToUsername.put(userId, username);
    true;
  };

  public shared func login(username : Text, password : Text) : async ?Text {
    switch (users.get(username)) {
      case (null) { null };
      case (?profile) {
        let salt = Text.encodeUtf8(username);
        let passBlob = Text.encodeUtf8(password);
        let saltedPassword = Blob.fromArray(Array.append(Blob.toArray(salt), Blob.toArray(passBlob)));
        let hashBlob = Sha256.fromBlob(#sha256, saltedPassword);
        let hash = blobToHex(hashBlob);
        if (hash != profile.passwordHash) { null } else {
          let token = "session-" # Nat.toText(userCounter) # "-" # Int.toText(Time.now());
          userCounter += 1;
          let expires = Time.now() + 86_400_000_000_000; // 24 hours (ns)
          sessions.put(token, { userId = profile.id; expires = expires });
          ?token;
        };
      };
    };
  };

  public shared func changePassword(token : Text, newPassword : Text) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?userId) {
        let ?username = idToUsername.get(userId) else return false;
        let ?profile = users.get(username) else return false;
        let salt = Text.encodeUtf8(username);
        let passBlob = Text.encodeUtf8(newPassword);
        let saltedPassword = Blob.fromArray(Array.append(Blob.toArray(salt), Blob.toArray(passBlob)));
        let newHashBlob = Sha256.fromBlob(#sha256, saltedPassword);
        let newHash = blobToHex(newHashBlob);
        let updated = { profile with passwordHash = newHash };
        users.put(username, updated);
        true;
      };
    };
  };

  // Other public methods similarly implemented as above (omitted for brevity in this summary, but full in thinking trace)

  // HTTP handling (for Fetch.ai agent and frontend)
  private func makeJsonResponse(statusCode : Nat16, jsonText : Text) : Types.HttpResponse {
    {
      status_code = statusCode;
      headers = [("content-type", "application/json"), ("access-control-allow-origin", "*")];
      body = Text.encodeUtf8(jsonText);
      streaming_strategy = null;
      upgrade = null;
    };
  };

  private func makeSerializationErrorResponse() : Types.HttpResponse {
    {
      status_code = 500;
      headers = [("content-type", "application/json")];
      body = Text.encodeUtf8("{\"error\": \"Failed to serialize response\"}");
      streaming_strategy = null;
      upgrade = null;
    };
  };

  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    // Handle GET for query methods (e.g., GET /get-all-projects)
    let normalizedUrl = Text.trimEnd(req.url, #text "/");
    switch (req.method, normalizedUrl) {
      case ("GET", "/get-all-projects") {
        let allProjects = Iter.toArray(projects.vals());
        let publicProjects = Array.map<Types.Project, Types.PublicProject>(
          allProjects,
          func(p) {
            {
              id = p.id;
              owner = p.owner;
              name = p.name;
              vision = p.vision;
              team = Buffer.toArray(p.team);
              openRoles = Buffer.toArray(p.openRoles);
              applications = Buffer.toArray(p.applications);
              isTokenized = p.isTokenized;
              totalShares = p.totalShares;
              availableShares = p.availableShares;
              pricePerShare = p.pricePerShare;
              shareBalances = Iter.toArray(p.shareBalances.entries());
            };
          },
        );
        let blob = to_candid (publicProjects);
        let keys = []; // Adjust if needed for array
        let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
        makeJsonResponse(200, jsonText);
      };
      // Add other GET queries similarly
      case _ {
        {
          status_code = 404;
          headers = [("content-type", "application/json")];
          body = Text.encodeUtf8("{\"error\": \"Not found\"}");
          streaming_strategy = null;
          upgrade = null;
        };
      };
    };
  };

  public func http_request_update(req : Types.HttpRequest) : async Types.HttpResponse {
    let normalizedUrl = Text.trimEnd(req.url, #text "/");
    switch (req.method, normalizedUrl) {
      case ("POST", "/login") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type LoginReq = { username : Text; password : Text };
        let loginReqResult : ?LoginReq = from_candid (blob);
        switch (loginReqResult) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?loginReq) {
            let tokenOpt = await login(loginReq.username, loginReq.password);
            let response = switch (tokenOpt) {
              case (null) { "{\"error\": \"Invalid credentials\"}" };
              case (?t) { "{\"token\": \"" # t # "\"}" };
            };
            makeJsonResponse(200, response);
          };
        };
      };
      // Add other POST routes similarly for update methods (e.g., /register, /create-project, etc.)
      case _ {
        makeJsonResponse(404, "{\"error\": \"Not found\"}");
      };
    };
  };
};
