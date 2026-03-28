import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ADMIN PASSWORD SYSTEM (no Caffeine token needed)
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

  // TYPE DEFINITIONS

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

  module User {
    public func compare(u1 : User, u2 : User) : Order.Order {
      Principal.compare(u1.id, u2.id);
    };
  };

  public type UserProfile = {
    name : Text;
    balance : Nat;
    createdAt : Time.Time;
  };

  // STORAGE
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

  // USER MANAGEMENT

  public shared ({ caller }) func registerUser() : async () {
    if (users.containsKey(caller)) { return };

    let user : User = {
      id = caller;
      balance = 0;
      createdAt = Time.now();
    };

    users.add(caller, user);

    let profile : UserProfile = {
      name = "";
      balance = 0;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);
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
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can approve deposits")
    };
    switch (deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        if (deposit.status != #pending) { Runtime.trap("Deposit is not pending") };
        deposits.add(depositId, { deposit with status = #approved });
        let currentBal = getUserBalanceInternal(deposit.user);
        switch (users.get(deposit.user)) {
          case (?user) { users.add(deposit.user, { user with balance = currentBal + deposit.amount }) };
          case (null) {};
        };
      };
    };
  };

  public shared ({ caller }) func rejectDeposit(depositId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can reject deposits")
    };
    switch (deposits.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?deposit) {
        if (deposit.status != #pending) { Runtime.trap("Deposit is not pending") };
        deposits.add(depositId, { deposit with status = #rejected });
      };
    };
  };

  public query ({ caller }) func getMyDeposits() : async [Deposit] {
    deposits.values().toArray().filter(func(d) { d.user == caller });
  };

  public query ({ caller }) func getAllDeposits() : async [Deposit] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can query all deposits")
    };
    deposits.values().toArray();
  };

  // WITHDRAWALS

  public shared ({ caller }) func createWithdrawal(amount : Nat, upi : Text) : async Nat {
    let currentBalance = getUserBalanceInternal(caller);
    if (currentBalance < amount) { Runtime.trap("Insufficient balance for withdrawal") };
    switch (users.get(caller)) {
      case (?user) { users.add(caller, { user with balance = currentBalance - amount }) };
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
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can mark withdrawals as paid")
    };
    switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?withdrawal) {
        if (withdrawal.status != #pending) { Runtime.trap("Withdrawal is not pending") };
        withdrawals.add(withdrawalId, { withdrawal with status = #paid });
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawal(withdrawalId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can reject withdrawals")
    };
    switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?withdrawal) {
        if (withdrawal.status != #pending) { Runtime.trap("Withdrawal is not pending") };
        withdrawals.add(withdrawalId, { withdrawal with status = #rejected });
        let currentBal = getUserBalanceInternal(withdrawal.user);
        switch (users.get(withdrawal.user)) {
          case (?user) { users.add(withdrawal.user, { user with balance = currentBal + withdrawal.amount }) };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getMyWithdrawals() : async [Withdrawal] {
    withdrawals.values().toArray().filter(func(w) { w.user == caller });
  };

  public query ({ caller }) func getAllWithdrawals() : async [Withdrawal] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can query all withdrawals")
    };
    withdrawals.values().toArray();
  };

  // GAME ROUNDS

  public shared ({ caller }) func startNewRound(durationSeconds : Nat) : async Nat {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can start new rounds")
    };
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
    let currentBalance = getUserBalanceInternal(caller);
    if (currentBalance < amount) { Runtime.trap("Insufficient balance to place bet") };

    let round = switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round not found") };
      case (?r) { r };
    };

    switch (round.status) {
      case (#betting) {};
      case (_) { Runtime.trap("Betting is not allowed on this round") };
    };

    switch (users.get(caller)) {
      case (?user) { users.add(caller, { user with balance = currentBalance - amount }) };
      case (null) {};
    };

    let bet : Bet = {
      id = nextBetId;
      user = caller;
      roundId;
      color;
      amount;
      status = #open;
      payout = null;
      timestamp = Time.now();
    };

    bets.add(nextBetId, bet);
    nextBetId += 1;
  };

  public shared ({ caller }) func closeRound(roundId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can close rounds")
    };
    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round not found") };
      case (?round) {
        rounds.add(roundId, { round with status = #closed });
      };
    };
  };

  public shared ({ caller }) func setRoundResult(roundId : Nat, result : Color) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can set round results")
    };
    switch (rounds.get(roundId)) {
      case (null) { Runtime.trap("Round not found") };
      case (?round) {
        rounds.add(roundId, {
          round with
          result = ?result;
          status = #resulted;
        });
        settleBetsForRound(roundId, result);
      };
    };
  };

  func settleBetsForRound(roundId : Nat, result : Color) {
    for ((betId, bet) in bets.entries()) {
      if (bet.roundId == roundId and bet.status == #open) {
        let (newStatus, payout) = if (bet.color == result) {
          let multiplier = switch (result) {
            case (#violet) { 3 };
            case (_) { 2 };
          };
          (#won, ?(bet.amount * multiplier));
        } else {
          (#lost, null);
        };

        let updatedBet = {
          bet with
          status = newStatus;
          payout = payout;
        };
        bets.add(betId, updatedBet);

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
    if (size <= 50) {
      allRounds;
    } else {
      let outputList = List.empty<Round>();
      for (i in Nat.range(0, 50)) {
        outputList.add(allRounds[i]);
      };
      outputList.toArray();
    };
  };

  public shared ({ caller }) func settleBet(betId : Nat, payout : ?Nat, betStatus : BetStatus) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can settle bets")
    };
    switch (bets.get(betId)) {
      case (null) { Runtime.trap("Bet not found") };
      case (?bet) {
        let newBet : Bet = {
          bet with
          payout;
          status = betStatus;
        };
        bets.add(betId, newBet);

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

  public query ({ caller }) func getMyBets() : async [Bet] {
    bets.values().toArray().filter(func(bet) { bet.user == caller }).sort();
  };

  public query ({ caller }) func getAllBets() : async [Bet] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admin can query all bets")
    };
    bets.values().toArray();
  };
};
