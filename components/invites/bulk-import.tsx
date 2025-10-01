"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { processBulkInvites } from "@/app/actions/invites"
import { useToast } from "@/hooks/use-toast"

export function BulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState("")
  const [defaultRole, setDefaultRole] = useState("member")
  const [defaultTier, setDefaultTier] = useState("member")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && uploadedFile.type === "text/csv") {
      setFile(uploadedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCsvData(e.target?.result as string)
      }
      reader.readAsText(uploadedFile)
    } else {
      toast({
        title: "Error",
        description: "Please upload a valid CSV file",
        variant: "destructive",
      })
    }
  }

  const handleProcess = async () => {
    if (!csvData) {
      toast({
        title: "Error",
        description: "Please upload a CSV file or paste CSV data",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processBulkInvites({
        csvData,
        defaultRole,
        defaultTier,
      })
      setResults(result)
      toast({
        title: "Success",
        description: `Processed ${result.success} invites successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk invites",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template =
      "email,phone,role,tier,custom_message\nexample@company.com,+1234567890,member,member,Welcome to our network!\nanother@startup.com,,scout,startup,Thanks for joining as a scout"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "invite-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Download the CSV template to ensure proper formatting
              </p>
              <p className="text-xs text-muted-foreground">
                Required columns: email, phone, role, tier, custom_message
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <Badge variant="secondary">{file.size} bytes</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual CSV Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Or Paste CSV Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="email,phone,role,tier,custom_message&#10;example@company.com,+1234567890,member,member,Welcome!"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={8}
          />
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default-role">Default Role</Label>
            <Select value={defaultRole} onValueChange={setDefaultRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="scout">Scout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-tier">Default Tier</Label>
            <Select value={defaultTier} onValueChange={setDefaultTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-end">
        <Button onClick={handleProcess} disabled={isProcessing || !csvData}>
          <Upload className="h-4 w-4 mr-2" />
          {isProcessing ? "Processing..." : "Process Invites"}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {results.success} Successful
              </Badge>
              {results.errors.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {results.errors.length} Errors
                </Badge>
              )}
            </div>

            {results.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors encountered:</p>
                    <ul className="text-sm space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index} className="text-destructive">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
