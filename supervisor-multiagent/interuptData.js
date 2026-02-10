export const interruptData = [ 
  {
    id: "a6b8dd4f926a7184d9ee8c6bf9d9d6af",
    value: {
      actionRequests: [
        {
          name: "send_email",
          args: {
            to: [
              "john.doe@example.com"
            ],
            subject: "Follow-up: Update from last meeting",
            body: "Hi John,\n\nI hope you're doing well. Could you please send a brief update on the action items from our last design meeting? Specifically, I'm looking for current status, any blockers, and estimated completion timelines. If you have any files, links, or notes to share, please include them.\n\nThanks,\n[Your Name]"
          },
          description: "Email approval request. Pending for approval."
        }
      ],
      reviewConfigs: [
        {
          actionName: "send_email",
          allowedDecisions: [
            "approve",
            "edit",
            "reject"
          ]
        }
      ]
    }
  }
]

`
Email approval request. Pending for approval.

To: john.doe@example.com
Subject: Follow-up: Update from last meeting
Body: Hi John,
I hope you're doing well. Could you please send a brief update on the action items from our last design meeting? Specifically, I'm looking for current status, any blockers, and estimated completion timelines. If you have any files, links, or notes to share, please include them.
Thanks,
[Your Name]

Choose the action to take:
- approve: Approve the email to be sent.
- edit: Edit the email and send it again.
- reject: Reject the email and do not send it.


`