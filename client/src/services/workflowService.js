export const enforceWorkflow = (doc, participant) => {

  if (doc.status === "Rejected")
    throw new Error("Document already rejected");

  if (doc.status === "Completed")
    throw new Error("Document already completed");

  if (participant.status !== "Pending")
    throw new Error("Action already completed");

  if (doc.workflowMode === "Sequential") {
    const nextPending = doc.participants
      .filter(p => p.status === "Pending")
      .sort((a, b) => a.order - b.order)[0];

    if (!nextPending || nextPending.email !== participant.email)
      throw new Error("You are not allowed to act yet");
  }

  if (participant.role === "Validator") {
    const allSigned = doc.participants
      .filter(p => p.role !== "Validator")
      .every(p => p.status === "Signed");

    if (!allSigned)
      throw new Error("All signers must sign first");
  }
};