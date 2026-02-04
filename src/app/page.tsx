import { Button, Card, CardBody, CardFooter, CardHeader, Input, Heading, Text, THEME_CONSTANTS } from '@/index';

export default function Page() {
  const { themed } = THEME_CONSTANTS;
  
  return (
    <div className={THEME_CONSTANTS.spacing.section}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 -m-6 mb-8 p-8 md:p-12 rounded-2xl text-white shadow-lg">
        <div className={THEME_CONSTANTS.layout.maxContentWidth}>
          <h1 className={`${THEME_CONSTANTS.typography.h1} mb-4 animate-fade-in`}>
            Welcome to Your App
          </h1>
          <p className="text-xl text-white/90 mb-6 animate-fade-in">
            Build amazing experiences with our modern component library and
            responsive layout system.
          </p>
          <div className={`flex flex-wrap ${THEME_CONSTANTS.spacing.inline} animate-fade-in`}>
            <Button size="lg">
              Get Started
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Users", value: "10,234", icon: "👥", trend: "+12%" },
          { label: "Revenue", value: "$45.2K", icon: "💰", trend: "+8%" },
          { label: "Projects", value: "156", icon: "📊", trend: "+23%" },
          { label: "Tasks Done", value: "89%", icon: "✅", trend: "+5%" },
        ].map((stat, i) => (
          <Card key={i} hover>
            <CardBody className="flex items-center gap-4">
              <div className="text-4xl">{stat.icon}</div>
              <div className="flex-1">
                <Text size="sm" variant="secondary" weight="medium">
                  {stat.label}
                </Text>
                <Heading level={3} className="text-2xl">
                  {stat.value}
                </Heading>
                <Text size="xs" variant="success" weight="semibold">
                  {stat.trend}
                </Text>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <Heading level={2} className="mb-6">
          Key Features
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Responsive Design",
              description: "Fully responsive layout that works on all devices",
              icon: "📱",
            },
            {
              title: "Modern UI",
              description: "Beautiful components with smooth animations",
              icon: "🎨",
            },
            {
              title: "Fast Performance",
              description: "Optimized for speed and efficiency",
              icon: "⚡",
            },
            {
              title: "Easy to Use",
              description: "Intuitive interface and simple navigation",
              icon: "🎯",
            },
            {
              title: "Secure",
              description: "Built with security best practices",
              icon: "🔒",
            },
            {
              title: "Customizable",
              description: "Flexible theming and configuration options",
              icon: "⚙️",
            },
          ].map((feature, i) => (
            <Card key={i} hover>
              <CardHeader>
                <div className="text-3xl mb-2">{feature.icon}</div>
                <Heading level={4}>
                  {feature.title}
                </Heading>
              </CardHeader>
              <CardBody>
                <Text size="sm" variant="secondary">
                  {feature.description}
                </Text>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section>
        <Card className={`${themed.bgTertiary} border ${themed.border}`}>
          <CardBody className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <Heading level={2} className="mb-2">
                Stay Updated
              </Heading>
              <Text variant="secondary" className="mb-6">
                Subscribe to our newsletter for the latest updates and features.
              </Text>
              <form className={`flex flex-col sm:flex-row ${THEME_CONSTANTS.spacing.inline} max-w-md mx-auto`}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
                <Button type="submit" className="sm:w-auto">
                  Subscribe
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading level={2}>
            Recent Activity
          </Heading>
          <Button variant="ghost" size="sm">
            View All
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
        <Card>
          <CardBody className={`divide-y ${themed.borderLight}`}>
            {[
              {
                user: "John Doe",
                action: "created a new project",
                time: "2 hours ago",
              },
              {
                user: "Jane Smith",
                action: "completed 5 tasks",
                time: "4 hours ago",
              },
              {
                user: "Mike Johnson",
                action: "uploaded 3 files",
                time: "6 hours ago",
              },
            ].map((activity, i) => (
              <div key={i} className={`py-4 first:pt-0 last:pb-0 flex items-center gap-4`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-semibold`}>
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <Text size="sm">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </Text>
                  <Text size="xs" variant="muted">{activity.time}</Text>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
