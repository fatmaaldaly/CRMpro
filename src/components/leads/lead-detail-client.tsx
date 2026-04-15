"use client";

import { Profile, Role } from "@/generated/prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetLead } from "@/lib/tanstack/useLeads";
import { formatLeadDate, StatusBadge } from "@/components/leads/reusable";
import { Overview } from "./lead-details/Overview";
import { Timeline } from "./lead-details/Timeline";
import { AddNoteDialog } from "./lead-details/AddNoteDialog";
import LogCallDialog from "./lead-details/LogCallDialog";
import {Reminders}from "./lead-details/Reminders";
import { AI } from "./lead-details/AI";
import Files from "./lead-details/Files";

export function LeadDetailClient({
  id,
  role,
  users
}: {
  id: string;
  role: Role;
  users: Profile[]; 

}) {
  const { data, isLoading, isError } = useGetLead(id);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading lead...</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-sm text-destructive">
        Failed to load this lead.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Title and Status */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{data.name}</h1>
          <StatusBadge status={data.status} />
        </div>
        <div className="gap-2 flex">
          <AddNoteDialog leadId={id} />
          <LogCallDialog leadId={id} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Created on {formatLeadDate(data.createdAt)}
      </p>




      <Tabs defaultValue="overview" className="space-y-0">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview data={data} role={role} users={users} />
        </TabsContent>

        <TabsContent value="timeline">
          <Timeline leadId={id} />
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              <Reminders leadId={id}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
             <AI leadId={id}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              <Files leadId={id}/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
