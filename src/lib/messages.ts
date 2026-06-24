export interface SystemMessage {
  title: string;
  message: string;
  actionLabel: string | null;
}

export const SystemMessages: Record<string, SystemMessage> = {
  RateLimit: {
    title: "You’ve reached the current limit",
    message: "To keep TieBreaker fast and reliable for everyone, we’ve paused new analyses for a little while. Please try again shortly.",
    actionLabel: "Try Again Later"
  },
  AuthWall: {
    title: "Continue with an account",
    message: "You’ve used the free decision limit for this session. Sign in to keep comparing options and save your decision history across devices.",
    actionLabel: "Sign In"
  },
  EmptyInputs: {
    title: "A few details are missing",
    message: "Add both options before starting your comparison so TieBreaker has something real to evaluate.",
    actionLabel: "Go Back"
  },
  MissingContext: {
    title: "Add a little more context",
    message: "A few more details about your priorities or constraints will help TieBreaker produce a sharper verdict.",
    actionLabel: "Add Context"
  },
  NetworkFailure: {
    title: "We couldn’t complete that request",
    message: "Something interrupted the connection before your analysis finished. Please try again in a moment.",
    actionLabel: "Try Again"
  },
  AIParsingFailure: {
    title: "This analysis didn’t come through cleanly",
    message: "TieBreaker wasn’t able to finalize this comparison properly. Please run it again and we’ll generate a fresh result.",
    actionLabel: "Run Again"
  },
  InternalServerFailure: {
    title: "Something went wrong on our side",
    message: "We hit an unexpected issue while preparing your result. Please try again in a moment.",
    actionLabel: "Try Again"
  },
  SaveToHistoryFailure: {
    title: "Your result couldn’t be saved",
    message: "Your comparison was generated, but we couldn’t add it to your history just yet. You can still review it now and try saving again later.",
    actionLabel: "Retry Save"
  },
  HistoryEmpty: {
    title: "No decisions here yet",
    message: "Your saved comparisons will appear here once you start using TieBreaker with an account.",
    actionLabel: "Start a Comparison"
  },
  NoSearchGrounding: {
    title: "Live sources weren’t available for this one",
    message: "TieBreaker couldn’t pull enough current information for a grounded comparison right now. You can still try again or continue without live grounding.",
    actionLabel: "Continue Anyway"
  },
  SessionExpired: {
    title: "Your session has expired",
    message: "For security, your session has ended. Sign in again to continue where you left off.",
    actionLabel: "Sign In Again"
  },
  DuplicateCached: {
    title: "We already prepared this one",
    message: "This comparison has already been generated recently, so we loaded the existing result to save time.",
    actionLabel: null
  }
};
