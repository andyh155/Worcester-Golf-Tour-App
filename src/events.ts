export function getEventCapabilities(status: string) {
  return {
    isPublic: ["Open", "Coming Soon", "Closed", "Completed"].includes(status),
    canRegister: status === "Open",
    showPairings: status === "Closed" || status === "Completed",
    showResults: status === "Completed",
    isCancelled: false,
  };
}