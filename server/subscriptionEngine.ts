/**
 * Server-side Subscription & Entitlement Engine for iGrades
 * Enforces authoritative access control for subjects, past questions, video lessons, PDFs, and quiz modes.
 */

export type PlanTier = "basic" | "standard" | "premium";

export interface StudentSubscriptionRecord {
  id: string;
  subscription?: string;
  subscription_status?: string;
}

export class SubscriptionEngine {
  // Normalize plan and expiration
  public normalizePlan(rawPlan?: string | null, rawStatus?: string | null): {
    plan: PlanTier;
    effectivePlan: PlanTier;
    isActive: boolean;
    isExpired: boolean;
  } {
    const statusLower = (rawStatus || "").trim().toLowerCase();
    const isExpired = statusLower === "expired" || statusLower === "canceled" || statusLower === "past_due";

    let detectedPlan: PlanTier = "basic";
    if (rawPlan) {
      const p = rawPlan.trim().toLowerCase();
      if (p.includes("premium")) {
        detectedPlan = "premium";
      } else if (p.includes("standard")) {
        detectedPlan = "standard";
      } else {
        detectedPlan = "basic";
      }
    }

    const isActive = !isExpired && (statusLower === "active" || detectedPlan === "basic" || !statusLower);
    const effectivePlan: PlanTier = isActive ? detectedPlan : "basic";

    return {
      plan: detectedPlan,
      effectivePlan,
      isActive,
      isExpired,
    };
  }

  // Authoritatively evaluate feature access
  public evaluateAccess(
    effectivePlan: PlanTier,
    feature:
      | "subject"
      | "past_question"
      | "video"
      | "pdf"
      | "quiz"
      | "timed_quiz"
      | "exam_simulation"
      | "jamb_simulation"
      | "analytics"
      | "recommendations"
      | "spark_daily"
      | "spark_socratic"
      | "spark_personalized"
      | "ai_proctoring"
      | "proctored_mock"
      | "parent_child_limit"
      | "parent_dashboard_section"
      | "parent_reports"
      | "parent_intelligence"
      | "igg_points",
    params: {
      index?: number;
      year?: string;
      mode?: string;
      subjectCount?: number;
      todayCount?: number;
      monthCount?: number;
      childCount?: number;
      section?: "basic_metrics" | "recent_activity" | "subject_performance" | "progress_trends" | "advanced_intelligence";
      reportType?: "basic_summary" | "weekly_report" | "advanced_detailed_report";
      level?: "basic_visibility" | "useful_insights" | "advanced_intelligence";
      viewType?: "basic" | "detailed_breakdown" | "deep_analytics";
      type?: "basic_guidance" | "personalized_paths" | "advanced_intelligence";
    } = {}
  ): { allowed: boolean; requiredPlan: PlanTier; reason?: string } {
    switch (feature) {
      case "subject": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const index = params.index ?? 0;
        if (index < 4) return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "Basic tier includes 4 starter curriculum subjects. Standard plan is required for full curriculum access.",
        };
      }

      case "past_question": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const year = params.year || "";
        if (year === "2024" || year === "2023") return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: `Past Questions from ${year} require a Standard or Premium subscription. Basic includes 2023–2024 starter archives.`,
        };
      }

      case "video": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const index = params.index ?? 0;
        if (index < 2) return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "Basic tier includes 2 starter video lessons per topic. Upgrade to Standard for unlimited video catalog access.",
        };
      }

      case "pdf": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const index = params.index ?? 0;
        if (index < 2) return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "Basic tier includes introductory curriculum notes. Upgrade to Standard for full revision packs and formula sheets.",
        };
      }

      case "quiz": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const mode = (params.mode || "quick test").toLowerCase();
        if (mode === "examination") {
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Full-length Examination simulation mode requires a Standard or Premium subscription.",
          };
        }
        if ((params.subjectCount || 1) > 1) {
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Multi-subject combined quiz testing requires a Standard or Premium subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      case "timed_quiz": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        const count = params.todayCount ?? 0;
        if (count < 3) return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "You have reached the daily limit of 3 timed quizzes on the Basic plan. Upgrade to Standard (₦15,000) for generous timed practice.",
        };
      }

      case "exam_simulation": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "Full Examination simulation mode is not available on Basic. Upgrade to Standard (₦15,000) to unlock full examination simulations.",
        };
      }

      case "jamb_simulation": {
        if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
        return {
          allowed: false,
          requiredPlan: "standard",
          reason: "JAMB UTME 4-Subject Mock Simulation is an examination-grade simulation available on Standard and Premium plans.",
        };
      }

      case "analytics": {
        const view = params.viewType || "detailed_breakdown";
        if (view === "basic") return { allowed: true, requiredPlan: "basic" };
        if (view === "detailed_breakdown") {
          if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Detailed performance breakdown and topic strengths/weaknesses require a Standard or Premium subscription.",
          };
        }
        if (view === "deep_analytics") {
          if (effectivePlan === "premium") return { allowed: true, requiredPlan: "basic" };
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Deep longitudinal performance analytics and advanced diagnostic insights require a Premium (₦25,000) subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      case "recommendations": {
        const recType = params.type || "personalized_paths";
        if (recType === "basic_guidance") return { allowed: true, requiredPlan: "basic" };
        if (recType === "personalized_paths") {
          if (effectivePlan === "premium" || effectivePlan === "standard") return { allowed: true, requiredPlan: "basic" };
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Personalized study recommendations and tailored revision paths require a Standard or Premium subscription.",
          };
        }
        if (recType === "advanced_intelligence") {
          if (effectivePlan === "premium") return { allowed: true, requiredPlan: "basic" };
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Advanced personalized learning intelligence with Spark AI tutoring integration requires a Premium (₦25,000) subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      // ── FEATURE AREA 1: SPARK DAILY USAGE ──
      case "spark_daily": {
        const count = params.todayCount ?? 0;
        if (effectivePlan === "basic") {
          if (count < 5) return { allowed: true, requiredPlan: "basic" };
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "You have completed your 5 daily Spark AI interactions on the Basic plan. Upgrade to Standard (₦15,000) for 30 daily interactions, or Premium for generous fair-use access.",
          };
        }
        if (effectivePlan === "standard") {
          if (count < 30) return { allowed: true, requiredPlan: "standard" };
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "You have reached your 30 daily Spark AI interactions on the Standard plan. Upgrade to Premium (₦25,000) for highest/generous daily usage subject to fair-use limits.",
          };
        }
        // Premium: generous fair-use limit (e.g. 150 interactions/day)
        if (count < 150) return { allowed: true, requiredPlan: "premium" };
        return {
          allowed: false,
          requiredPlan: "premium",
          reason: "You have reached today's generous fair-use limit (150 interactions) for Spark AI tutoring. Your access resets tomorrow.",
        };
      }

      // ── FEATURE AREA 2: SPARK SOCRATIC GUIDANCE ──
      case "spark_socratic": {
        if (effectivePlan === "basic") {
          return {
            allowed: true,
            requiredPlan: "basic",
            reason: "Basic plan includes limited Socratic guidance with introductory guiding questions and hints.",
          };
        }
        if (effectivePlan === "standard") {
          return {
            allowed: true,
            requiredPlan: "standard",
            reason: "Standard plan includes generous multi-level adaptive Socratic tutoring, concept breakdowns, and worked guidance.",
          };
        }
        return {
          allowed: true,
          requiredPlan: "premium",
          reason: "Premium plan includes advanced cognitive scaffolding, deep step-by-step derivations, and full Socratic resolution.",
        };
      }

      // ── FEATURE AREA 3: SPARK PERSONALIZED LEARNING SUPPORT ──
      case "spark_personalized": {
        if (effectivePlan === "basic") {
          return {
            allowed: true,
            requiredPlan: "basic",
            reason: "Basic plan includes foundational curriculum guidance. Upgrade to Standard for personalized guidance and misconception support.",
          };
        }
        if (effectivePlan === "standard") {
          return {
            allowed: true,
            requiredPlan: "standard",
            reason: "Standard plan provides personalized guidance, weak-topic focus, and misconception diagnosis.",
          };
        }
        return {
          allowed: true,
          requiredPlan: "premium",
          reason: "Premium plan provides advanced personalized tutoring, longitudinal diagnostic feedback, and targeted misconception remediation.",
        };
      }

      // ── FEATURE AREA 4: AI PROCTORING ──
      case "ai_proctoring": {
        if (effectivePlan === "basic") {
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "AI Proctoring (automated webcam vision, microphone, and screen integrity monitoring) is not available on the Basic plan. Upgrade to Standard or Premium to take proctored examinations.",
          };
        }
        if (effectivePlan === "standard") {
          return {
            allowed: true,
            requiredPlan: "standard",
            reason: "Standard plan provides limited AI Proctoring access for proctored mock examinations.",
          };
        }
        return {
          allowed: true,
          requiredPlan: "premium",
          reason: "Premium plan provides full, unrestricted AI Proctoring access for all examination simulations.",
        };
      }

      // ── FEATURE AREA 5: PROCTORED MOCK EXAMS ──
      case "proctored_mock": {
        if (effectivePlan === "basic") {
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Proctored Mock Exams are not available on the Basic plan. Upgrade to Standard (₦15,000) for proctored mock exams, or Premium for generous fair-use access.",
          };
        }
        if (effectivePlan === "standard") {
          const count = params.monthCount ?? 0;
          if (count < 3) return { allowed: true, requiredPlan: "standard" };
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "You have completed all 3 proctored mock exams included in your Standard plan for this billing cycle. Upgrade to Premium (₦25,000) for generous/fair-use proctored mock exam access.",
          };
        }
        // Premium: generous fair-use access (e.g. up to 25 proctored mocks/month)
        const count = params.monthCount ?? 0;
        if (count < 25) return { allowed: true, requiredPlan: "premium" };
        return {
          allowed: false,
          requiredPlan: "premium",
          reason: "You have reached this billing cycle's generous fair-use limit of 25 proctored mock exams on Premium.",
        };
      }

      // ── PARENT PORTAL FEATURE 1 & 4: MULTIPLE CHILDREN LIMITS ──
      case "parent_child_limit": {
        const count = params.childCount ?? 0;
        const maxAllowed = effectivePlan === "premium" ? 5 : effectivePlan === "standard" ? 3 : 1;
        if (count < maxAllowed) {
          return { allowed: true, requiredPlan: "basic" };
        }
        if (effectivePlan === "basic") {
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Basic parent account includes 1 child connection. Upgrade to Standard (up to 3 children) or Premium (up to 5 children).",
          };
        }
        if (effectivePlan === "standard") {
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Standard parent account allows up to 3 children. Upgrade to Premium for up to 5 children.",
          };
        }
        return {
          allowed: false,
          requiredPlan: "premium",
          reason: "You have reached the maximum family limit of 5 children on Premium.",
        };
      }

      // ── PARENT PORTAL FEATURE 2: PROGRESS DASHBOARD ──
      case "parent_dashboard_section": {
        const section = params.section || "basic_metrics";
        if (section === "basic_metrics" || section === "recent_activity") {
          return { allowed: true, requiredPlan: "basic" };
        }
        if (section === "subject_performance" || section === "progress_trends") {
          if (effectivePlan === "standard" || effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Subject performance and progress trends require a Standard or Premium parent subscription.",
          };
        }
        if (section === "advanced_intelligence") {
          if (effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Advanced learning intelligence and cognitive diagnostics require a Premium parent subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      // ── PARENT PORTAL FEATURE 3: REPORTS ──
      case "parent_reports": {
        const reportType = params.reportType || "basic_summary";
        if (reportType === "basic_summary") {
          return { allowed: true, requiredPlan: "basic" };
        }
        if (reportType === "weekly_report") {
          if (effectivePlan === "standard" || effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Weekly learning progress reporting requires a Standard or Premium subscription.",
          };
        }
        if (reportType === "advanced_detailed_report") {
          if (effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Advanced detailed diagnostic reporting and printable executive digests require a Premium subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      // ── PARENT PORTAL FEATURE 5: LEARNING INTELLIGENCE ──
      case "parent_intelligence": {
        const level = params.level || "basic_visibility";
        if (level === "basic_visibility") {
          return { allowed: true, requiredPlan: "basic" };
        }
        if (level === "useful_insights") {
          if (effectivePlan === "standard" || effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "standard",
            reason: "Useful progress insights, action radar, and tailored recommendations require a Standard or Premium subscription.",
          };
        }
        if (level === "advanced_intelligence") {
          if (effectivePlan === "premium") {
            return { allowed: true, requiredPlan: "basic" };
          }
          return {
            allowed: false,
            requiredPlan: "premium",
            reason: "Advanced learning intelligence, exam readiness predictions, and deep diagnostics require a Premium subscription.",
          };
        }
        return { allowed: true, requiredPlan: "basic" };
      }

      // ── iGG POINTS (NEVER PAYWALLED, AVAILABLE ACROSS ALL PLANS) ──
      case "igg_points": {
        return {
          allowed: true,
          requiredPlan: "basic",
          reason: "iGG Points, earning, viewing, streaks, and store credit conversion are available on all plans.",
        };
      }

      default:
        return { allowed: true, requiredPlan: "basic" };
    }
  }
}

export const subscriptionEngine = new SubscriptionEngine();
