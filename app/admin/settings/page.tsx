'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Digital Jan Samvad',
    allowAnonymousReports: false,
    platformDescription: 'Civic issue reporting platform',
    maxUploadSize: '10',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveIssues: false,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your platform settings</p>
      </div>

      {/* Notification */}
      {saved && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-200 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* General Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">General Settings</h2>
          <CardDescription>Configure your platform information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Platform Name</Label>
            <Input
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              placeholder="Platform name"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Platform Description</Label>
            <Textarea
              value={settings.platformDescription}
              onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
              placeholder="Platform description"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Max Upload Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
              placeholder="10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">Features</h2>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label className="text-sm font-medium text-foreground">Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">Show maintenance page to visitors</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })} />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label className="text-sm font-medium text-foreground">Email Notifications</Label>
              <p className="text-xs text-muted-foreground mt-1">Send email notifications to users</p>
            </div>
            <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label className="text-sm font-medium text-foreground">Auto-Approve Issues</Label>
              <p className="text-xs text-muted-foreground mt-1">Automatically approve new issue reports</p>
            </div>
            <Switch checked={settings.autoApproveIssues} onCheckedChange={(checked) => setSettings({ ...settings, autoApproveIssues: checked })} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-destructive/50">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">Danger Zone</h2>
          <CardDescription>Irreversible actions - proceed with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 w-full">
            Reset All Data
          </Button>
          <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 w-full">
            Delete Platform
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}
