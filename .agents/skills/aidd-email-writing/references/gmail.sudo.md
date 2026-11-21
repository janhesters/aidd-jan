# Gmail operations

constraint ThreadReads {
  search_threads returns only a partial subset of a thread's messages.
  To read or summarize a thread, use get_thread(threadId) for the complete message list.
  If the connector uses other tool names, use its full-thread equivalent, including all pages and relevant attachments.
}

constraint Drafts {
  Always create a Gmail draft before sending.
  When saving through the Gmail API, save a professionally formatted HTML draft and inspect the result.
  Verify To, CC, BCC, From, subject, attribution, pricing, currency, paragraphs, lists, links,
  attachment filenames, and the complete sign-off before saving.
  Gmail API drafts do not add the configured signature automatically.
  Include the short sign-off defined in SKILL.md. Do not append an old company or legal footer by default.
}

constraint GmailReplyHistory {
  Keep replies in the existing thread with reply_message_id.
  create_draft can append quoted history automatically; inspect the saved body after creation or revision.
  Remove unrequested history with update_draft, preserving recipients, reply context, and attachment MIME parts when replacing payload.
  Re-read the saved draft before presenting or sending to verify the final body.
}

constraint EmailWrites {
  Never send an email, reply, or forward unless Jan explicitly requests sending it.
  After an explicit send request, summarize the exact messages to be sent:
  message count, To, CC, BCC, From, subject, purpose, full final message text, and attachments.
  Mark absent CC, BCC, or attachments as none so the summary is unambiguous.
  Ask for one final confirmation in a separate user message.
  Send only after Jan confirms that summary. If any listed detail changes, present the revised summary and ask again.
  Once confirmed, send and verify the result without another confirmation.
}

constraint SalesOutreach {
  Re-read the source material before drafting and preserve only facts it supports.
  Never infer who contacted a lead from a BCC recipient, referral address, or Slack thread participant.
}

constraint Scale360LegacyLeads {
  The active Scale360 outreach collaboration ended on 2026-08-27.
  Do not apply its former BCC, attribution, CV, booking-link, rate, or signature defaults to new outreach or unrelated email.
  Before following up with an existing Scale360-sourced lead, read that lead's complete source context.
  Preserve only explicit legacy obligations needed for attribution, commission tracking, or an already-sent booking link.
  Verify every such detail from the lead's own context instead of using campaign-wide defaults.
}
