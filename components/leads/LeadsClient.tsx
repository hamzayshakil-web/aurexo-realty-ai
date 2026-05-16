"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Plus, Search, Filter,
  Phone, Mail, MapPin, DollarSign, Calendar, Building2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LeadStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadRow } from "@/types/database";
import type { LeadStatus } from "@/types";

interface Props {
  initialLeads: LeadRow[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatBudget(amount: number) {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `AED ${(amount / 1_000).toFixed(0)}K`;
  return `AED ${amount}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFollowUp(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function LeadsClient({ initialLeads }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialLeads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.toLowerCase().includes(q) ||
        lead.location?.toLowerCase().includes(q) ||
        lead.property_type?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialLeads, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${initialLeads.length} lead${initialLeads.length !== 1 ? "s" : ""} in your pipeline`}
        icon={Users}
      >
        <Link href="/leads/add">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, location…"
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count when filtering */}
      {(search || statusFilter !== "all") && (
        <p className="text-sm text-muted-foreground -mt-2">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Lead Cards */}
      {initialLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Start building your pipeline by adding your first lead."
          actionLabel="Add First Lead"
          onAction={() => router.push("/leads/add")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No leads match your search"
          description="Try a different name, email, or change the status filter."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(""); setStatusFilter("all"); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="h-full hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/60 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold dark:bg-amber-950/50 dark:text-amber-400">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-amber-600 transition-colors">
                          {lead.name}
                        </p>
                        {lead.property_type && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 mt-0.5 capitalize bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          >
                            {lead.property_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <LeadStatusBadge status={lead.status as LeadStatus} />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    {lead.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.location}</span>
                      </div>
                    )}
                    {lead.budget !== null && lead.budget !== undefined && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        {formatBudget(lead.budget)}
                      </div>
                    )}
                    {(lead.email || lead.phone) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {lead.email && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[130px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone.slice(0, 14)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    {lead.follow_up_date ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        Follow-up {formatFollowUp(lead.follow_up_date)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        No follow-up set
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
