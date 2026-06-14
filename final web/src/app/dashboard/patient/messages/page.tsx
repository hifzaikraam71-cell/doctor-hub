"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types";
import { formatDate } from "@/lib/utils";

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUserName(d.user?.fullName || "");
        setUserId(d.user?.userId || "");
      });
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!receiverId || !content) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
    setContent("");
    fetchMessages();
  }

  return (
    <DashboardLayout role="patient" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Messages</h2>

      <Card title="Send Message" className="mb-6">
        <form onSubmit={sendMessage} className="flex flex-wrap gap-3">
          <Input
            placeholder="Doctor User ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-[2]"
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card
            key={msg.id}
            className={msg.sender_id === userId ? "ml-8 bg-primary-50" : "mr-8"}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="mt-1 text-xs text-gray-400">{formatDate(msg.created_at)}</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
