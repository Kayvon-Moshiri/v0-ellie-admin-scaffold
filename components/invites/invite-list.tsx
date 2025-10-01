"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Mail, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getInvites, resendInvite, deleteInvite } from "@/app/actions/invites"
import { useToast } from "@/hooks/use-toast"

interface Invite {
  id: string
  email?: string
  phone?: string
  role: string
  tier: string
  status: "draft" | "sent" | "accepted" | "expired"
  sent_via: string[]
  created_at: string
}

export function InviteList() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadInvites()
  }, [])

  useEffect(() => {
    let filtered = invites

    if (searchTerm) {
      filtered = filtered.filter(
        (invite) =>
          invite.email?.toLowerCase().includes(searchTerm.toLowerCase()) || invite.phone?.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invite) => invite.status === statusFilter)
    }

    setFilteredInvites(filtered)
  }, [invites, searchTerm, statusFilter])

  const loadInvites = async () => {
    try {
      const data = await getInvites()
      setInvites(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async (inviteId: string) => {
    try {
      await resendInvite(inviteId)
      toast({
        title: "Success",
        description: "Invite resent successfully",
      })
      loadInvites()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invite",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId)
      toast({
        title: "Success",
        description: "Invite deleted successfully",
      })
      loadInvites()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invite",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />
      case "sent":
        return <Mail className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "expired":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "sent":
        return "default"
      case "accepted":
        return "default"
      case "expired":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading invites...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invites ({filteredInvites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Via</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div className="space-y-1">
                      {invite.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{invite.email}</span>
                        </div>
                      )}
                      {invite.phone && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{invite.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invite.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invite.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invite.status) as any} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(invite.status)}
                      {invite.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {invite.sent_via.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(invite.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invite.status === "sent" && (
                          <DropdownMenuItem onClick={() => handleResend(invite.id)}>Resend</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(invite.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
