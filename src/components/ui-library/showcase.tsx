import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ComponentShowcase() {
  return (
    <div className="container mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading gradient-text">UI Component Library</h1>
        <p className="text-muted-foreground">Explore our glassmorphic and neumorphic design system</p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glassmorphic-tabs">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-8">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles with neumorphic effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="neumorphic-button px-4 py-2">Neumorphic</button>
                <button className="neumorphic-button-primary px-4 py-2">Neumorphic Primary</button>
                <button className="neumorphic-button-outline px-4 py-2">Neumorphic Outline</button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glassmorphic-card soft-glow">
              <CardHeader>
                <CardTitle>Glassmorphic Card</CardTitle>
                <CardDescription>With soft glow effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card features a glassmorphic design with backdrop blur and a subtle glow on hover.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card border-glow-blue">
              <CardHeader>
                <CardTitle>Blue Glow Border</CardTitle>
                <CardDescription>Colorful border effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hover to see the animated border glow effect.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card border-glow-purple">
              <CardHeader>
                <CardTitle>Purple Glow Border</CardTitle>
                <CardDescription>Another color variant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Multiple color options available for different contexts.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-8">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields with the design system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Enter your name" />
              </div>
              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-8">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
