/**
 * Task Rules Types and Enums
 * Extracted for better module resolution
 */

// Task status enum matching contract
export enum TaskStatus {
  Available = 0,
  Claimed = 1,
  InProgress = 2,
  Submitted = 3,
  Completed = 4,
  Cancelled = 5
}

// Re-export the contract getter function
export { getTaskRulesContract } from './task-rules'