/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dashboard from "../dashboard.js";
import type * as lessons from "../lessons.js";
import type * as lessons_new from "../lessons_new.js";
import type * as migrations from "../migrations.js";
import type * as progress from "../progress.js";
import type * as progress_new from "../progress_new.js";
import type * as seed from "../seed.js";
import type * as seedSkillLessons from "../seedSkillLessons.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dashboard: typeof dashboard;
  lessons: typeof lessons;
  lessons_new: typeof lessons_new;
  migrations: typeof migrations;
  progress: typeof progress;
  progress_new: typeof progress_new;
  seed: typeof seed;
  seedSkillLessons: typeof seedSkillLessons;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
