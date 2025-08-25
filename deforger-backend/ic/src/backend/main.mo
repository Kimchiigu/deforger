import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
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
  // Custom hashing functions
  private func natHash(n : Nat) : Nat32 {
    Nat32.fromNat(n);
  };

  // State
  private var userIdCounter : Nat = 0;
  private var userCounter : Nat = 0;
  private var users : HashMap.HashMap<Text, Types.UserProfile> = HashMap.HashMap<Text, Types.UserProfile>(0, Text.equal, Text.hash); // Keyed by userId
  private var usernames : HashMap.HashMap<Text, Text> = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash); // username -> userId
  private var sessions : HashMap.HashMap<Text, Types.Session> = HashMap.HashMap<Text, Types.Session>(0, Text.equal, Text.hash);
  private var projectCounter : Nat = 0;
  private var projects : HashMap.HashMap<Nat, Types.Project> = HashMap.HashMap<Nat, Types.Project>(0, Nat.equal, natHash);
  private var agentMatchCounter : Nat = 0;
  private var agentMatches : Buffer.Buffer<Types.AgentMatch> = Buffer.Buffer<Types.AgentMatch>(0);
  private var applicationCounter : Nat = 0;
  private var messageCounter : Nat = 0;
  private var messages : HashMap.HashMap<Nat, Buffer.Buffer<Types.ChatMessage>> = HashMap.HashMap<Nat, Buffer.Buffer<Types.ChatMessage>>(0, Nat.equal, natHash);

  // Helper functions
  private func validateToken(token : Text) : ?Text {
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

  private func blobToHex(blob : Blob) : Text {
    var hexText = "";
    for (byte in blob.vals()) {
      hexText #= Hex.encodeByte(byte);
    };
    return hexText;
  };

  // Public methods
  public shared func register(username : Text, password : Text, name : Text, role : Text, skills : [Text], portfolioUrl : Text) : async Bool {
    if (usernames.get(username) != null) { return false };
    userIdCounter += 1;
    let id = "user-" # Nat.toText(userIdCounter);
    let salt = Text.encodeUtf8(username);
    let passBlob = Text.encodeUtf8(password);
    let saltedPassword = Blob.fromArray(Array.append(Blob.toArray(salt), Blob.toArray(passBlob)));
    let hashBlob = Sha256.fromBlob(#sha256, saltedPassword);
    let hash = blobToHex(hashBlob);
    let profile : Types.UserProfile = {
      id = id;
      username = username;
      passwordHash = hash;
      name = name;
      role = role;
      skills = skills;
      portfolioUrl = portfolioUrl;
    };
    users.put(id, profile);
    usernames.put(username, id);
    true;
  };

  public shared func login(username : Text, password : Text) : async ?Types.LoginResponse {
    switch (usernames.get(username)) {
      case (null) { null };
      case (?id) {
        switch (users.get(id)) {
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
              ?{ userId = profile.id; token = token };
            };
          };
        };
      };
    };
  };

  public shared func logout(token: Text): async Bool {
    if (sessions.get(token) != null) {
        sessions.delete(token);
        return true;
    } else {
        return false;
    };
  };

  public shared func changePassword(token : Text, newPassword : Text) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?userId) {
        let ?profile = users.get(userId) else return false;
        let username = profile.username;
        let salt = Text.encodeUtf8(username);
        let passBlob = Text.encodeUtf8(newPassword);
        let saltedPassword = Blob.fromArray(Array.append(Blob.toArray(salt), Blob.toArray(passBlob)));
        let newHashBlob = Sha256.fromBlob(#sha256, saltedPassword);
        let newHash = blobToHex(newHashBlob);
        let updated = { profile with passwordHash = newHash };
        users.put(userId, updated);
        true;
      };
    };
  };

  public shared func updateUserProfile(token : Text, name : Text, role : Text, skills : [Text], portfolioUrl : Text) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?userId) {
        let ?profile = users.get(userId) else return false;
        let updated = {
          profile with name = name;
          role = role;
          skills = skills;
          portfolioUrl = portfolioUrl;
        };
        users.put(userId, updated);
        true;
      };
    };
  };

  public shared func createProject(token : Text, name : Text, vision : Text, openRoles : [Types.RoleRequirement]) : async Nat {
    switch (validateToken(token)) {
      case (null) { Debug.trap("Invalid token") };
      case (?owner) {
        projectCounter += 1;
        let id = projectCounter;
        let team = Buffer.Buffer<Text>(1);
        team.add(owner);
        let shareBalances = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
        let project : Types.Project = {
          id;
          owner;
          name;
          vision;
          team;
          openRoles = Buffer.fromArray(openRoles);
          applications = Buffer.Buffer<Types.Application>(0);
          isTokenized = false;
          totalShares = 0;
          availableShares = 0;
          pricePerShare = 0;
          shareBalances;
        };
        projects.put(id, project);
        id;
      };
    };
  };

  public shared func recordAgentMatch(token : Text, projectId : Nat, userId : Text, roleFilled : Text) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?caller) {
        let ?project = projects.get(projectId) else return false;
        if (not Buffer.contains<Text>(project.team, userId, Text.equal)) {
          project.team.add(userId);
        };
        let newOpenRoles = Buffer.Buffer<Types.RoleRequirement>(0);
        for (role in project.openRoles.vals()) {
          if (role.roleName != roleFilled) {
            newOpenRoles.add(role);
          };
        };
        let updatedProject : Types.Project = {
          project with openRoles = newOpenRoles
        };
        projects.put(projectId, updatedProject);
        agentMatchCounter += 1;
        let match_ : Types.AgentMatch = {
          matchId = agentMatchCounter;
          projectId;
          userId;
          roleFilled;
          timestamp = Time.now();
        };
        agentMatches.add(match_);
        true;
      };
    };
  };

  public shared func applyToProject(token : Text, projectId : Nat, message : Text) : async Bool {
    Debug.print("Validating token: " # token);
    switch (validateToken(token)) {
      case (null) {
        Debug.print("Token validation failed");
        false;
      };
      case (?applicant) {
        Debug.print("Applicant: " # applicant);
        let ?project = projects.get(projectId) else {
          Debug.print("Project not found for ID: " # Nat.toText(projectId));
          return false;
        };
        Debug.print("Project found, checking team membership");
        if (Buffer.contains<Text>(project.team, applicant, Text.equal)) {
          Debug.print("Applicant already in team");
          return false;
        };
        applicationCounter += 1;
        let app : Types.Application = {
          id = applicationCounter;
          applicant = applicant;
          projectId;
          message;
          status = "pending";
        };
        project.applications.add(app);
        Debug.print("Application added successfully");
        true;
      };
    };
  };

  public shared func reviewApplication(token : Text, applicationId : Nat, accept : Bool) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?caller) {
        var found = false;
        var index : ?Nat = null;
        var appFound : ?Types.Application = null;
        label search for (project in projects.vals()) {
          for (i in Iter.range(0, project.applications.size() - 1)) {
            let app = project.applications.get(i);
            if (app.id == applicationId) {
              if (project.owner != caller) { return false };
              found := true;
              index := ?i;
              appFound := ?app;
              break search;
            };
          };
        };
        if (not found) { return false };
        let ?app = appFound else return false;
        let ?proj = projects.get(app.projectId) else return false;
        let ?idx = index else return false; // Added safe unwrap to fix warning
        let status = if (accept) "accepted" else "rejected";
        let updatedApp = { app with status = status };
        ignore do ? { proj.applications.put(idx, updatedApp) };
        if (accept) {
          proj.team.add(app.applicant);
        };
        true;
      };
    };
  };

  public shared func sendMessage(token : Text, projectId : Nat, content : Text) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?sender) {
        let ?project = projects.get(projectId) else return false;
        if (not Buffer.contains<Text>(project.team, sender, Text.equal)) {
          return false;
        };
        messageCounter += 1;
        let msg : Types.ChatMessage = {
          id = messageCounter;
          projectId;
          sender = sender;
          content;
          timestamp = Time.now();
        };
        switch (messages.get(projectId)) {
          case (null) {
            let b = Buffer.Buffer<Types.ChatMessage>(1);
            b.add(msg);
            messages.put(projectId, b);
          };
          case (?b) {
            b.add(msg);
          };
        };
        true;
      };
    };
  };

  public shared func tokenizeProject(token : Text, projectId : Nat, totalShares : Nat, pricePerShare : Nat) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?caller) {
        let ?project = projects.get(projectId) else return false;
        if (project.owner != caller or project.isTokenized) { return false };
        let updated = {
          project with
          isTokenized = true;
          totalShares = totalShares;
          availableShares = totalShares;
          pricePerShare = pricePerShare;
        };
        projects.put(projectId, updated);
        true;
      };
    };
  };

  public shared func buyShares(token : Text, projectId : Nat, numShares : Nat) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?buyer) {
        let ?project = projects.get(projectId) else return false;
        if (not project.isTokenized or numShares > project.availableShares) {
          return false;
        };
        let current = Option.get(project.shareBalances.get(buyer), 0);
        project.shareBalances.put(buyer, current + numShares);
        let updated = {
          project with availableShares = project.availableShares - numShares
        };
        projects.put(projectId, updated);
        true;
      };
    };
  };

  public shared func withdrawProjectFunds(token : Text, projectId : Nat) : async Bool {
    switch (validateToken(token)) {
      case (null) { false };
      case (?caller) {
        let ?project = projects.get(projectId) else return false;
        if (project.owner != caller) { return false };
        true;
      };
    };
  };

  // Internal non-async query functions
  private func projectToPublic(p : Types.Project) : Types.PublicProject {
      let shareBalancesText = Buffer.Buffer<(Text, Nat)>(p.shareBalances.size());
      for ((key, shares) in p.shareBalances.entries()) {
        shareBalancesText.add((key, shares));
      };
      let applicationsText = Buffer.Buffer<Types.Application>(p.applications.size());
      for (app in p.applications.vals()) {
        applicationsText.add({
          id = app.id;
          applicant = app.applicant;
          projectId = app.projectId;
          message = app.message;
          status = app.status;
        });
      };
      {
        id = p.id;
        owner = p.owner;
        name = p.name;
        vision = p.vision;
        team = Buffer.toArray(p.team);
        openRoles = Buffer.toArray(p.openRoles);
        applications = Buffer.toArray(applicationsText);
        isTokenized = p.isTokenized;
        totalShares = p.totalShares;
        availableShares = p.availableShares;
        pricePerShare = p.pricePerShare;
        shareBalances = Buffer.toArray(shareBalancesText);
      };
  };
  
  private func getUserProfileInternal(userId : Text) : ?Types.PublicUserProfile {
    let ?profile = users.get(userId) else return null;
    ?{
      id = profile.id;
      username = profile.username;
      name = profile.name;
      role = profile.role;
      skills = profile.skills;
      portfolioUrl = profile.portfolioUrl;
    };
  };

  private func getProjectInternal(projectId : Nat) : ?Types.PublicProject {
    let ?project = projects.get(projectId) else return null;
    ?projectToPublic(project);
  };

  private func getAllProjectsInternal() : [Types.PublicProject] {
    let buf = Buffer.Buffer<Types.PublicProject>(projects.size());
    for (p in projects.vals()) {
      buf.add(projectToPublic(p));
    };
    Buffer.toArray(buf);
  };

  private func getProjectMessagesInternal(projectId : Nat) : [Types.ChatMessage] {
    switch (messages.get(projectId)) {
      case (null) { [] };
      case (?b) {
        let buf = Buffer.Buffer<Types.ChatMessage>(b.size());
        for (msg in b.vals()) {
          buf.add({
            id = msg.id;
            projectId = msg.projectId;
            sender = msg.sender;
            content = msg.content;
            timestamp = msg.timestamp;
          });
        };
        Buffer.toArray(buf);
      };
    };
  };

  private func getAllAgentMatchesInternal() : [Types.AgentMatch] {
    let buf = Buffer.Buffer<Types.AgentMatch>(agentMatches.size());
    for (match in agentMatches.vals()) {
      buf.add({
        matchId = match.matchId;
        projectId = match.projectId;
        userId = match.userId;
        roleFilled = match.roleFilled;
        timestamp = match.timestamp;
      });
    };
    Buffer.toArray(buf);
  };

  private func getProjectShareBalanceInternal(projectId : Nat, userId : Text) : Nat {
    let ?project = projects.get(projectId) else return 0;
    Option.get(project.shareBalances.get(userId), 0);
  };

  private func getMatchingProjectsInternal(userId : Text) : [Types.PublicProject] {
      let ?userProfile = users.get(userId) else return [];
      let userSkills = userProfile.skills;
      let matchingProjects = Buffer.Buffer<Types.PublicProject>(0);

      for (project in projects.vals()) {
          var isMatch = false;
          label projectLoop for (role in project.openRoles.vals()) {
              for (requiredSkill in role.requiredSkills.vals()) {
                  for (userSkill in userSkills.vals()) {
                      if (userSkill == requiredSkill) {
                          isMatch := true;
                          break projectLoop;
                      };
                  };
              };
          };

          if (isMatch) {
              matchingProjects.add(projectToPublic(project));
          };
      };
      Buffer.toArray(matchingProjects);
  };

  // Read-Only Queries
  public query func getUserProfile(userId : Text) : async ?Types.PublicUserProfile {
    getUserProfileInternal(userId);
  };

  public query func getProject(projectId : Nat) : async ?Types.PublicProject {
    getProjectInternal(projectId);
  };

  public query func getAllProjects() : async [Types.PublicProject] {
    getAllProjectsInternal();
  };

  public query func getProjectMessages(projectId : Nat) : async [Types.ChatMessage] {
    getProjectMessagesInternal(projectId);
  };

  public query func getAllAgentMatches() : async [Types.AgentMatch] {
    getAllAgentMatchesInternal();
  };

  public query func getProjectShareBalance(projectId : Nat, userId : Text) : async Nat {
    getProjectShareBalanceInternal(projectId, userId);
  };

  public query func getMatchingProjects(token : Text) : async [Types.PublicProject] {
      switch (validateToken(token)) {
          case (null) { [] };
          case (?userId) {
              getMatchingProjectsInternal(userId);
          };
      };
  };

  // HTTP handling
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

  private func parseQueryParams(url : Text) : HashMap.HashMap<Text, Text> {
    let params = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);
    let parts = Iter.toArray(Text.split(url, #char '?'));
    if (parts.size() < 2) { return params };
    let parsedQuery = parts[1];
    let pairs = Iter.toArray(Text.split(parsedQuery, #char '&'));
    for (pair in pairs.vals()) {
      let kv = Iter.toArray(Text.split(pair, #char '='));
      if (kv.size() == 2) {
        params.put(kv[0], kv[1]);
      };
    };
    params;
  };

  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    let parts = Iter.toArray(Text.split(req.url, #char '?'));
    let normalizedPath = Text.trimEnd(parts[0], #text "/");
    let params = parseQueryParams(req.url);

    switch (req.method) {
      case ("GET") {
        switch (normalizedPath) {
          case ("/get-all-projects") {
            let allProjects = getAllProjectsInternal();
            let blob = to_candid (allProjects);
            let keys = [];
            let result = JSON.toText(blob, keys, null);
            switch (result) {
              case (#ok(jsonText)) {
                makeJsonResponse(200, jsonText);
              };
              case (#err(msg)) {
                makeSerializationErrorResponse();
              };
            };
          };
          case ("/get-project") {
            let ?idText = params.get("id") else return makeJsonResponse(400, "{\"error\": \"Missing id\"}");
            let ?id = Nat.fromText(idText) else return makeJsonResponse(400, "{\"error\": \"Invalid id\"}");
            let projOpt = getProjectInternal(id);
            let blob = to_candid (projOpt);
            let keys = [];
            let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
            makeJsonResponse(200, jsonText);
          };
          case ("/get-user-profile") {
            let ?userIdText = params.get("userId") else return makeJsonResponse(400, "{\"error\": \"Missing userId\"}");
            let userId = userIdText;
            let profileOpt = getUserProfileInternal(userId);
            let blob = to_candid (profileOpt);
            let keys = [];
            let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
            makeJsonResponse(200, jsonText);
          };
          case ("/get-project-messages") {
            let ?idText = params.get("projectId") else return makeJsonResponse(400, "{\"error\": \"Missing projectId\"}");
            let ?id = Nat.fromText(idText) else return makeJsonResponse(400, "{\"error\": \"Invalid projectId\"}");
            let msgs = getProjectMessagesInternal(id);
            let blob = to_candid (msgs);
            let keys = [];
            let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
            makeJsonResponse(200, jsonText);
          };
          case ("/get-all-agent-matches") {
            let matches = getAllAgentMatchesInternal();
            let blob = to_candid (matches);
            let keys = [];
            let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
            makeJsonResponse(200, jsonText);
          };
          case ("/get-project-share-balance") {
            let ?projectIdText = params.get("projectId") else return makeJsonResponse(400, "{\"error\": \"Missing projectId\"}");
            let ?projectId = Nat.fromText(projectIdText) else return makeJsonResponse(400, "{\"error\": \"Invalid projectId\"}");
            let ?userIdText = params.get("userId") else return makeJsonResponse(400, "{\"error\": \"Missing userId\"}");
            let userId = userIdText;
            let bal = getProjectShareBalanceInternal(projectId, userId);
            let jsonText = "{\"balance\": " # Nat.toText(bal) # "}";
            makeJsonResponse(200, jsonText);
          };
          case ("/get-matching-projects") {
              let ?token = params.get("token") else return makeJsonResponse(400, "{\"error\": \"Missing token\"}");
              let projects = switch(validateToken(token)) {
                case(null) { [] };
                case(?userId) { getMatchingProjectsInternal(userId) };
              };
              let blob = to_candid (projects);
              let keys = [];
              let #ok(jsonText) = JSON.toText(blob, keys, null) else return makeSerializationErrorResponse();
              makeJsonResponse(200, jsonText);
          };
          case _ {
            makeJsonResponse(404, "{\"error\": \"Not found\"}");
          };
        };
      };
      case ("POST") {
        {
          status_code = 200;
          headers = [];
          body = Blob.fromArray([]);
          streaming_strategy = null;
          upgrade = ?true;
        };
      };
      case _ {
        makeJsonResponse(404, "{\"error\": \"Not found\"}");
      };
    };
  };

  public shared func http_request_update(req : Types.HttpRequest) : async Types.HttpResponse {
    let parts = Iter.toArray(Text.split(req.url, #char '?'));
    let normalizedUrl = Text.trimEnd(parts[0], #text "/");
    switch (req.method, normalizedUrl) {
      case ("POST", "/login") {
      let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
      let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
      
      type LoginReq = { username : Text; password : Text };
      let loginReqOpt : ?LoginReq = from_candid (blob);
      
      switch (loginReqOpt) {
        case (null) {
          return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
        };
        case (?loginReq) {
          let loginResponseOpt = await login(loginReq.username, loginReq.password);
          let response = switch (loginResponseOpt) {
            case (null) { "{\"error\": \"Invalid credentials\"}" };
            case (?loginResponse) {
              "{\"userId\": \"" # loginResponse.userId # "\", \"token\": \"" # loginResponse.token # "\"}"
            };
          };
          makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/register") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type RegReq = {
          username : Text;
          password : Text;
          name : Text;
          role : Text;
          skills : [Text];
          portfolioUrl : Text;
        };
        let regReqOpt : ?RegReq = from_candid (blob);
        switch (regReqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?regReq) {
            let success = await register(regReq.username, regReq.password, regReq.name, regReq.role, regReq.skills, regReq.portfolioUrl);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Username exists\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/logout") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        
        type LogoutReq = { token: Text };
        let logoutReqOpt: ?LogoutReq = from_candid(blob);

        switch(logoutReqOpt) {
            case (null) {
                return makeJsonResponse(400, "{\"error\": \"Missing token\"}");
            };
            case (?logoutReq) {
                let success = await logout(logoutReq.token);
                let response = if (success) { "{\"success\": true}" } else { "{\"error\": \"Invalid token\"}" };
                makeJsonResponse(200, response);
            };
        };
      };
      case ("POST", "/change-password") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; newPassword : Text };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await changePassword(reqData.token, reqData.newPassword);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/update-user-profile") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = {
          token : Text;
          name : Text;
          role : Text;
          skills : [Text];
          portfolioUrl : Text;
        };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await updateUserProfile(reqData.token, reqData.name, reqData.role, reqData.skills, reqData.portfolioUrl);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/create-project") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = {
          token : Text;
          name : Text;
          vision : Text;
          openRoles : [Types.RoleRequirement];
        };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let id = await createProject(reqData.token, reqData.name, reqData.vision, reqData.openRoles);
            let response = "{\"id\": " # Nat.toText(id) # "}";
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/record-agent-match") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = {
          token : Text;
          projectId : Nat;
          userId : Text;
          roleFilled : Text;
        };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await recordAgentMatch(reqData.token, reqData.projectId, reqData.userId, reqData.roleFilled);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/apply-to-project") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; projectId : Nat; message : Text };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await applyToProject(reqData.token, reqData.projectId, reqData.message);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/review-application") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; applicationId : Nat; accept : Text };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let accept = switch (reqData.accept) {
              case ("true") true;
              case ("false") false;
              case _ return makeJsonResponse(400, "{\"error\": \"Invalid accept value\"}");
            };
            let success = await reviewApplication(reqData.token, reqData.applicationId, accept);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/send-message") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; projectId : Nat; content : Text };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await sendMessage(reqData.token, reqData.projectId, reqData.content);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/tokenize-project") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = {
          token : Text;
          projectId : Nat;
          totalShares : Nat;
          pricePerShare : Nat;
        };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await tokenizeProject(reqData.token, reqData.projectId, reqData.totalShares, reqData.pricePerShare);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/buy-shares") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; projectId : Nat; numShares : Nat };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await buyShares(reqData.token, reqData.projectId, reqData.numShares);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case ("POST", "/withdraw-project-funds") {
        let ?jsonText = Text.decodeUtf8(req.body) else return makeJsonResponse(400, "{\"error\": \"Invalid body\"}");
        let #ok(blob) = JSON.fromText(jsonText, null) else return makeJsonResponse(400, "{\"error\": \"Invalid JSON\"}");
        type Req = { token : Text; projectId : Nat };
        let reqOpt : ?Req = from_candid (blob);
        switch (reqOpt) {
          case (null) {
            return makeJsonResponse(400, "{\"error\": \"Missing fields\"}");
          };
          case (?reqData) {
            let success = await withdrawProjectFunds(reqData.token, reqData.projectId);
            let response = if (success) { "{\"success\": true}" } else {
              "{\"error\": \"Failed\"}";
            };
            makeJsonResponse(200, response);
          };
        };
      };
      case _ {
        makeJsonResponse(404, "{\"error\": \"Not found\"}");
      };
    };
  };
};