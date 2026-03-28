import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let ADMIN_PASSWORD : Text = "colorwin@9999";
  stable var adminPrincipal : ?Principal = null;

  public shared ({ caller }) func claimAdmin(password : Text) : async Bool {
    if (password != ADMIN_PASSWORD) { return false };
    adminPrincipal := ?caller;
    true;
  };

  func isAdminCaller(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?p) { p == caller };
      case (null) { false };
    };
  };

  public type Color = { #red; #green; #violet };
  public type RoundStatus = { #betting; #closed; #resulted };
  public type BetStatus = { #open; #won; #lost; #cancelled };
  public type DepositStatus = { #pending; #approved; #rejected };
  public type WithdrawStatus = { #pending; #paid; #rejected };

  public type Deposit = {
    id : Nat;
    user : Principal;
    amount : Nat;
    utr : Text;
    screenshot : Text;
    status : DepositStatus;
    timestamp : Time.Time;
  };

  module Deposit {
    public func compare(d1 : Deposit, d2 : Deposit) : Order.Order {
      Nat.compare(d1.id, d2.id);
    };
  };

  public type Withdrawal = {
    id : Nat;
    user : Principal;
    amount : Nat;
    upi : Text;
    status : WithdrawStatus;
    timestamp : Time.Time;
  };

  module Withdrawal {
    public func compare(w1 : Withdrawal, w2 : Withdrawal) : Order.Order {
      Nat.compare(w1.id, w2.id);
    };
  };

  public type Bet = {
    id : Nat;
    user : Principal;
    roundId : Nat;
    color : Color;
    amount : Nat;
    status : BetStatus;
    payout : ?Nat;
    timestamp : Time.Time;
  };

  module Bet {
    public func compare(b1 : Bet, b2 : Bet) : Order.Order {
      Nat.compare(b1.id, b2.id);
    };
  };

  public type Round = {
    id : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    result : ?Color;
    status : RoundStatus;
  };

  module Round {
    public func compare(r1 : Round, r2 : Round) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  public type User = {
    id : Principal;
    balance : Nat;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    balance : Nat;
    createdAt : Time.Time;
  };

  let deposits = Map.empty<Nat, Deposit>();
  let withdrawals = Map.empty<Nat, Withdrawal>();
  let rounds = Map.empty<Nat, Round>();
  let users = Map.empty<Principal, User>();
  let bets = Map.empty<Nat, Bet>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextDepositId = 1;
  var nextWithdrawalId = 1;
  var nextRoundId = 1;
  var nextBetId = 1;

  // Auto-round duration in seconds (default 60s)
  stable var autoRoundDuration : Nat = 60;

  public shared ({ caller }) func setAutoRoundDuration(secs : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    autoRoundDuration := secs;
  };

  // Helper: number -> color
  func numToColor(n : Nat) : Color {
    if (n == 0 or n == 5) { #violet }
    else if (n == 1 or n == 3 or n == 7 or n == 9) { #green }
    else { #red };
  };

  // HEARTBEAT: auto-manage rounds
  system func heartbeat() : async () {
    let now = Time.now();
    // Check for expired betting round -> auto-result
    var foundActive = false;
    for ((id, round) in rounds.entries()) {
      if (round.status == #betting) {
        foundActive := true;
        if (now > round.endTime) {
          // Pseudo-random: use round id and time
          let t : Nat = Int.abs(now);
          let resultNum = (t / 1_000_000_000 + id) % 10;
          let color = numToColor(resultNum);
          rounds.add(id, { round with result = ?color; status = #resulted });
          settleBetsForRound(id, color);
          foundActive := false;
        };
      };
    };
    // If no active round, start one automatically
    if (not foundActive) {
      let round : Round = {
        id = nextRoundId;
        startTime = now;
        endTime = now + (autoRoundDuration * 1_000_000_000);
        result = null;
        status = #betting;
      };
      rounds.add(nextRoundId, round);
      nextRoundId += 1;
    };
  };

  // USER MANAGEMENT
  public shared ({ caller }) func registerUser() : async () {
    if (users.containsKey(caller)) { return };
    users.add(caller, { id = caller; balance = 0; createdAt = Time.now() });
    userProfiles.add(caller, { name = ""; balance = 0; createdAt = Time.now() });
  };

  public query ({ caller }) func getUserBalance() : async Nat {
    getUserBalanceInternal(caller);
  };

  func getUserBalanceInternal(user : Principal) : Nat {
    switch (users.get(user)) {
      case (?u) { u.balance };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // DEPOSIT SYSTEM
  public shared ({ caller }) func createDeposit(amount : Nat, utr : Text, screenshot : Text) : async Nat {
    let deposit : Deposit = {
      id = nextDepositId;
      user = caller;
      amount;
      utr;
      screenshot;
      status = #pending;
      timestamp = Time.now();
    };
    deposits.add(nextDepositId, deposit);
    nextDepositId += 1;
    deposit.id;
  };

  public shared ({ caller }) func approveDeposit(depositId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        if (deposit.status != #pending) { Runtime.trap("Not pending") };
        deposits.add(depositId, { deposit with status = #approved });
        let bal = getUserBalanceInternal(deposit.user);
        switch (users.get(deposit.user)) {
          case (?user) { users.add(deposit.user, { user with balance = bal + deposit.amount }) };
          case (null) {};
        };
      };
    };
  };

  public shared ({ caller }) func rejectDeposit(depositId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        if (deposit.status != #pending) { Runtime.trap("Not pending") };
        deposits.add(depositId, { deposit with status = #rejected });
      };
    };
  };

  public query ({ caller }) func getMyDeposits() : async [Deposit] {
    deposits.values().toArray().filter(func(d) { d.user == caller });
  };

  public query ({ caller }) func getAllDeposits() : async [Deposit] {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    deposits.values().toArray();
  };

  // WITHDRAWALS
  public shared ({ caller }) func createWithdrawal(amount : Nat, upi : Text) : async Nat {
    let bal = getUserBalanceInternal(caller);
    if (bal < amount) { Runtime.trap("Insufficient balance") };
    switch (users.get(caller)) {
      case (?user) { users.add(caller, { user with balance = bal - amount }) };
      case (null) {};
    };
    let withdrawal : Withdrawal = {
      id = nextWithdrawalId;
      user = caller;
      amount;
      upi;
      status = #pending;
      timestamp = Time.now();
    };
    withdrawals.add(nextWithdrawalId, withdrawal);
    nextWithdrawalId += 1;
    withdrawal.id;
  };

  public shared ({ caller }) func markWithdrawalPaid(withdrawalId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Not found") };
      case (?w) {
        if (w.status != #pending) { Runtime.trap("Not pending") };
        withdrawals.add(withdrawalId, { w with status = #paid });
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawal(withdrawalId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Not found") };
      case (?w) {
        if (w.status != #pending) { Runtime.trap("Not pending") };
        withdrawals.add(withdrawalId, { w with status = #rejected });
        let bal = getUserBalanceInternal(w.user);
        switch (users.get(w.user)) {
          case (?user) { users.add(w.user, { user with balance = bal + w.amount }) };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getMyWithdrawals() : async [Withdrawal] {
    withdrawals.values().toArray().filter(func(w) { w.user == caller });
  };

  public query ({ caller }) func getAllWithdrawals() : async [Withdrawal] {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    withdrawals.values().toArray();
  };

  // GAME ROUNDS
  public shared ({ caller }) func startNewRound(durationSeconds : Nat) : async Nat {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    let round : Round = {
      id = nextRoundId;
      startTime = Time.now();
      endTime = Time.now() + (durationSeconds * 1_000_000_000);
      result = null;
      status = #betting;
    };
    rounds.add(nextRoundId, round);
    nextRoundId += 1;
    round.id;
  };

  public shared ({ caller }) func placeBet(roundId : Nat, color : Color, amount : Nat) : async () {
    let bal = getUserBalanceInternal(caller);
    if (bal < amount) { Runtime.trap("Insufficient balance") };
    let round = switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round not found") };
      case (?r) { r };
    };
    switch (round.status) {
      case (#betting) {};
      case (_) { Runtime.trap("Betting not allowed") };
    };
    switch (users.get(caller)) {
      case (?user) { users.add(caller, { user with balance = bal - amount }) };
      case (null) {};
    };
    bets.add(nextBetId, {
      id = nextBetId;
      user = caller;
      roundId;
      color;
      amount;
      status = #open;
      payout = null;
      timestamp = Time.now();
    });
    nextBetId += 1;
  };

  public shared ({ caller }) func closeRound(roundId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Not found") };
      case (?round) { rounds.add(roundId, { round with status = #closed }) };
    };
  };

  public shared ({ caller }) func setRoundResult(roundId : Nat, result : Color) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Not found") };
      case (?round) {
        rounds.add(roundId, { round with result = ?result; status = #resulted });
        settleBetsForRound(roundId, result);
      };
    };
  };

  func settleBetsForRound(roundId : Nat, result : Color) {
    for ((betId, bet) in bets.entries()) {
      if (bet.roundId == roundId and bet.status == #open) {
        let (newStatus, payout) = if (bet.color == result) {
          let multiplier = switch (result) { case (#violet) { 3 }; case (_) { 2 } };
          (#won, ?(bet.amount * multiplier));
        } else { (#lost, null) };
        bets.add(betId, { bet with status = newStatus; payout = payout });
        switch (payout) {
          case (?amount) {
            switch (users.get(bet.user)) {
              case (?user) { users.add(bet.user, { user with balance = user.balance + amount }) };
              case (null) {};
            };
          };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getAllRounds() : async [Round] {
    rounds.values().toArray().sort();
  };

  public query ({ caller }) func getActiveRound() : async ?Round {
    rounds.values().toArray().find(func(r) { r.status == #betting });
  };

  public query ({ caller }) func getGameHistory() : async [Round] {
    let allRounds = rounds.values().toArray().sort().reverse();
    let size = allRounds.size();
    if (size <= 50) { allRounds } else {
      let outputList = List.empty<Round>();
      for (i in Nat.range(0, 50)) { outputList.add(allRounds[i]) };
      outputList.toArray();
    };
  };

  public query ({ caller }) func getMyBets() : async [Bet] {
    bets.values().toArray().filter(func(bet) { bet.user == caller }).sort();
  };

  public query ({ caller }) func getAllBets() : async [Bet] {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    bets.values().toArray();
  };

  public shared ({ caller }) func settleBet(betId : Nat, payout : ?Nat, betStatus : BetStatus) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (bets.get(betId)) {
      case (null) { Runtime.trap("Bet not found") };
      case (?bet) {
        bets.add(betId, { bet with payout; status = betStatus });
        switch (payout) {
          case (?amount) {
            switch (users.get(bet.user)) {
              case (?user) { users.add(bet.user, { user with balance = user.balance + amount }) };
              case (null) {};
            };
          };
          case (null) {};
        };
      };
    };
  };
};
