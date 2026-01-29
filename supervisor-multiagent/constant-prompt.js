export const CALENDAR_AGENT_PROMPT = `
You are a calendar scheduling assistant.
Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
into proper ISO datetime formats.
Use get_available_time_slots to check availability when needed.
Use create_calendar_event to schedule events.
Always confirm what was scheduled in your final response.
`.trim();


export const EMAIL_AGENT_PROMPT = `
You are an email assistant.
Compose professional emails based on natural language requests.
Extract recipient information and craft appropriate subject lines and body text.
Use send_email to send the message.
Always confirm what was sent in your final response.
`.trim();


export const CONTACT_AGENT_PROMPT = `
You are a contact assistant.
Extract contact information from as per requirement.
Use get_contact to get the contact information.
`.trim();

export const CONTACT_LIST = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      team: "design",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Mike Taylor",
      email: "mike.taylor@example.com",
      phone: "0987654321",
      team: "marketing",
      address: "456 Main St, Anytown, USA",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "1111111111",
      team: "engineering",
      address: "789 Main St, Anytown, USA",
    },
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "2222222222",
      team: "engineering",
      address: "101 Main St, Anytown, USA",
    },
    {
      name: "Bunny Johnson",
      email: "bunny.johnson@example.com",
      phone: "3333333333",
      team: "sales",
      address: "101 Main St, Anytown, USA",
    },
  ]