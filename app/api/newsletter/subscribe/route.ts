// app/api/newsletter/subscribe/route.ts
import { NextResponse } from "next/server";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
const MAILCHIMP_API_SERVER = process.env.MAILCHIMP_API_SERVER;

async function addSubscriberToMailchimp(email: string) {
  try {
    const data = {
      email_address: email,
      status: "subscribed", // or 'pending' if you want double opt-in
      tags: ["website_signup"],
      merge_fields: {
        // You can add additional fields here like:
        // FNAME: firstName,
        // LNAME: lastName,
      },
    };

    const response = await fetch(
      `https://${MAILCHIMP_API_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `anystring:${MAILCHIMP_API_KEY}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      if (responseData.title === "Member Exists") {
        return { error: "You're already subscribed!" };
      }
      throw new Error(responseData.detail || "Failed to subscribe");
    }

    return { success: true };
  } catch (error) {
    console.error("Mailchimp error:", error);
    return { error: "Failed to subscribe" };
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    const result = await addSubscriberToMailchimp(email);

    if (result.error) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Thanks for subscribing! Check your email for updates.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { message: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
