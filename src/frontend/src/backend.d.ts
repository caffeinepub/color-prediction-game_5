import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Withdrawal {
    id: bigint;
    upi: string;
    status: WithdrawStatus;
    user: Principal;
    timestamp: Time;
    amount: bigint;
}
export type Time = bigint;
export interface Bet {
    id: bigint;
    status: BetStatus;
    color: Color;
    user: Principal;
    roundId: bigint;
    timestamp: Time;
    amount: bigint;
    payout?: bigint;
}
export interface Round {
    id: bigint;
    startTime: Time;
    status: RoundStatus;
    result?: Color;
    endTime: Time;
}
export interface Deposit {
    id: bigint;
    utr: string;
    status: DepositStatus;
    user: Principal;
    timestamp: Time;
    amount: bigint;
    screenshot: string;
}
export interface UserProfile {
    balance: bigint;
    name: string;
    createdAt: Time;
}
export enum BetStatus {
    won = "won",
    cancelled = "cancelled",
    lost = "lost",
    open = "open"
}
export enum Color {
    red = "red",
    green = "green",
    violet = "violet"
}
export enum DepositStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum RoundStatus {
    closed = "closed",
    betting = "betting",
    resulted = "resulted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawStatus {
    pending = "pending",
    paid = "paid",
    rejected = "rejected"
}
export interface backendInterface {
    approveDeposit(depositId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    closeRound(roundId: bigint): Promise<void>;
    createDeposit(amount: bigint, utr: string, screenshot: string): Promise<bigint>;
    createWithdrawal(amount: bigint, upi: string): Promise<bigint>;
    getActiveRound(): Promise<Round | null>;
    getAllBets(): Promise<Array<Bet>>;
    getAllDeposits(): Promise<Array<Deposit>>;
    getAllRounds(): Promise<Array<Round>>;
    getAllWithdrawals(): Promise<Array<Withdrawal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGameHistory(): Promise<Array<Round>>;
    getMyBets(): Promise<Array<Bet>>;
    getMyDeposits(): Promise<Array<Deposit>>;
    getMyWithdrawals(): Promise<Array<Withdrawal>>;
    getUserBalance(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markWithdrawalPaid(withdrawalId: bigint): Promise<void>;
    placeBet(roundId: bigint, color: Color, amount: bigint): Promise<void>;
    registerUser(): Promise<void>;
    rejectDeposit(depositId: bigint): Promise<void>;
    rejectWithdrawal(withdrawalId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRoundResult(roundId: bigint, result: Color): Promise<void>;
    settleBet(betId: bigint, payout: bigint | null, betStatus: BetStatus): Promise<void>;
    claimAdmin(password: string): Promise<boolean>;
    startNewRound(durationSeconds: bigint): Promise<bigint>;
}
