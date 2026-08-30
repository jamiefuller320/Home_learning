/**
 * @deprecated Use pack-release.ts — kept for import compatibility.
 */
export {
  assessPackRelease as assessPackCompleteness,
  assessAllPackReleases as assessAllPacks,
  draftTopics,
  groupSweepByLearning,
  planGlobalRevisionSweep,
  summarizePackReleases as summarizeCompleteness,
  type GlobalRevisionSweep,
  type PackReleaseStatus as PackCompleteness,
} from "@/lib/pack-release";
