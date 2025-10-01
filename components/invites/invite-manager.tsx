"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteComposer } from "./invite-composer"
import { InviteList } from "./invite-list"
import { BulkImport } from "./bulk-import"
import { TemplateEditor } from "./template-editor"
import { Plus, Upload, Settings, List } from "lucide-react"

export function InviteManager() {
  const [activeTab, setActiveTab] = useState("compose")

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Invite Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-6">
            <InviteComposer />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <InviteList />
          </TabsContent>

          <TabsContent value="bulk" className="mt-6">
            <BulkImport />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplateEditor />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
