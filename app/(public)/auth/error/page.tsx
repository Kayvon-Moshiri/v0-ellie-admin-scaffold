import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-destructive/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Error Code:</p>
                <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">{params.error}</p>
                {params.error_description && (
                  <>
                    <p className="text-sm font-medium">Description:</p>
                    <p className="text-sm text-muted-foreground">{params.error_description}</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">An unspecified authentication error occurred.</p>
            )}

            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try signing in again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
