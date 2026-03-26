import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'About | Digital Jan Samvad',
  description: 'Learn more about Digital Jan Samvad and our mission.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Introduction */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">About DigitalJanSamvad</h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-left max-w-3xl mx-auto">
          DigitalJanSamvad is a community-driven platform built to connect citizens with local authorities. 
          By reporting issues and voting, residents help prioritize the most pressing problems, making governance faster and more transparent.
        </p>
      </section>

      {/* Mission */}
      <section>
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <span className="text-3xl">🎯</span>
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-foreground/80 leading-relaxed">
              Empowering communities through technology to create lasting positive change in local governance and civic engagement.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section>
        <h2 className="flex items-center gap-3 text-3xl font-bold mb-8">
          <span className="text-3xl">✨</span>
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl shrink-0">
                📊
              </div>
              <CardTitle className="text-xl">Transparent issue tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Monitor progress in real-time from report to resolution.</p>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl shrink-0">
                🗳️
              </div>
              <CardTitle className="text-xl">Community-led prioritization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vote on what matters most to your neighborhood.</p>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-2xl shrink-0">
                ⚡
              </div>
              <CardTitle className="text-xl">Admin dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Efficient management and oversight for local authorities.</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-2xl shrink-0">
                🔔
              </div>
              <CardTitle className="text-xl">Real-time notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Stay updated on issue status automatically via WebSockets.</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl shrink-0">
                🗺️
              </div>
              <CardTitle className="text-xl">Interactive mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Visual location-based reporting overlaid on your city layout.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
