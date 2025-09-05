"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Zap, 
  Brain, 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Moon,
  Sun,
  Menu,
  X,
  Bot,
  Cpu,
  Database,
  Sparkles as AISparkles,
  Play,
  Award,
  TrendingUp,
  Shield,
  Globe,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Send,
  Phone
} from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FreeBanner } from "@/components/ui/free-banner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Animation variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0
  }
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export function SocialFlowLandingPage() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Enterprise form state
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    contactType: ''
  })
  const [isSubmittingEnterprise, setIsSubmittingEnterprise] = useState(false)
  
  // Parallax effects - disabled for better UX
  // const heroY = useTransform(scrollY, [0, 500], [0, 150])
  // const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Back to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Enterprise form handlers
  const handleEnterpriseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEnterpriseForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEnterpriseSelectChange = (value: string) => {
    setEnterpriseForm(prev => ({ ...prev, contactType: value }))
  }

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEnterprise(true)

    // Create WhatsApp message for enterprise inquiry
    const whatsappMessage = `🏢 *SocialFlow Enterprise Inquiry*\n\n` +
      `*Name:* ${enterpriseForm.name}\n` +
      `*Email:* ${enterpriseForm.email}\n` +
      `*Company:* ${enterpriseForm.company}\n` +
      `*Contact Type:* ${enterpriseForm.contactType}\n\n` +
      `*Message:*\n${enterpriseForm.message}\n\n` +
      `---\nEnterprise inquiry from SocialFlow Landing Page`

    const whatsappNumber = "201023516495"
    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    // Simulate processing and open WhatsApp
    setTimeout(() => {
      setIsSubmittingEnterprise(false)
      window.open(whatsappUrl, '_blank')
      
      // Reset form
      setEnterpriseForm({
        name: '',
        email: '',
        company: '',
        message: '',
        contactType: ''
      })
      
      // Show success message
      alert('Your enterprise inquiry has been sent! We\'ll contact you within 24 hours.')
    }, 1500)
  }

  if (!mounted) {
    return null // Avoid hydration issues with theme
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Free Banner */}
      <FreeBanner />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl">SocialFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 items-center space-x-6 text-sm">
            <Link
              href="#features"
              className="text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
            >
              Features
            </Link>
            <Link
              href="#feature-tabs"
              className="text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
            >
              Explore Features
            </Link>
            <Link
              href="#timeline"
              className="text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
            >
              Testimonials
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="mr-2"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" className="btn-outline-enhanced" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="btn-cta-enhanced">
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border lg:hidden bg-background/95 backdrop-blur px-4 sm:px-6"
          >
            <nav className="py-4 space-y-3">
              <Link
                href="#features"
                className="block text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#feature-tabs"
                className="block text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Features
              </Link>
              <Link
                href="#timeline"
                className="block text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="block text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="block text-foreground/60 transition-colors hover:text-foreground/80 scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" className="btn-outline-enhanced" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="btn-cta-enhanced">
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          {/* Floating background elements for hero section */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-1 h-1 bg-primary/20 rounded-full animate-zero-gravity-1" style={{animationDelay: '0s'}} />
            <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent/25 rounded-full animate-zero-gravity-2" style={{animationDelay: '2s'}} />
            <div className="absolute bottom-40 left-20 w-1 h-1 bg-secondary/20 rounded-full animate-zero-gravity-3" style={{animationDelay: '4s'}} />
            <div className="absolute bottom-20 right-10 w-0.8 h-0.8 bg-primary/15 rounded-full animate-zero-gravity-1" style={{animationDelay: '6s'}} />
            <div className="absolute top-1/2 left-1/4 w-1.2 h-1.2 bg-accent/15 rounded-full animate-zero-gravity-2" style={{animationDelay: '8s'}} />
            <div className="absolute top-1/3 right-1/3 w-0.6 h-0.6 bg-secondary/25 rounded-full animate-zero-gravity-3" style={{animationDelay: '10s'}} />
          </div>
          
          <motion.div
            className="container mx-auto relative z-10 pb-8 pt-6 md:pb-12 md:pt-10 lg:pt-16 lg:pb-20 px-4"
          >
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                className="space-y-2"
              >
                <Badge variant="outline" className="mb-4 animate-fade-in">
                  <Sparkles className="mr-2 h-3 w-3" />
                  100% Free During MVP Phase
                </Badge>
                <h1 className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                  AI-Powered{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Social Media
                  </span>{" "}
                  <span className="typewriter-container">
                    <span className="typewriter-text">
                      <span className="typewriter-word">Management</span>
                      <span className="typewriter-word">Automation</span>
                      <span className="typewriter-word">Optimization</span>
                      <span className="typewriter-word">Innovation</span>
                    </span>
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                transition={{ delay: 0.2 }}
                className="max-w-[42rem] leading-normal text-muted-foreground text-base sm:text-lg md:text-xl sm:leading-7 md:leading-8"
              >
                Manage all your social media accounts in one place with AI-powered content generation, 
                smart scheduling, and comprehensive analytics. Perfect for marketing agencies and businesses.
              </motion.p>

              {/* Social Media Icons */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 mb-6 sm:mb-8"
              >
                {[
                  { icon: Facebook, name: "Facebook", color: "#1877F2" },
                  { icon: Instagram, name: "Instagram", color: "#E4405F" },
                  { icon: Twitter, name: "Twitter", color: "#1DA1F2" },
                  { icon: Linkedin, name: "LinkedIn", color: "#0A66C2" },
                  { icon: Youtube, name: "YouTube", color: "#FF0000" },
                  { icon: Music, name: "TikTok", color: "#000000" },
                ].map((platform, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.4 + index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 10
                    }}
                    className="flex flex-col items-center space-y-2 relative"
                    style={{
                      animation: `moonFloat ${5.76 + index * 0.72}s ease-in-out infinite`,
                      animationDelay: `${index * 1.44}s`
                    }}
                  >
                    <div 
                      className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-white shadow-lg hover-scale transition-all duration-300 moon-float-glow"
                      style={{ 
                        backgroundColor: platform.color,
                        boxShadow: `0 4px 16px ${platform.color}40, 0 0 0 1px ${platform.color}20`
                      }}
                    >
                      <platform.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-xs font-medium text-center text-muted-foreground">{platform.name}</span>
                    
                    {/* Floating particles around each icon */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-40"
                        style={{
                          top: '15%',
                          left: '25%',
                          animation: `particleFloat ${4.32 + index * 0.36}s ease-in-out infinite`,
                          animationDelay: `${index * 1.44 + 0.72}s`
                        }}
                      />
                      <div 
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30"
                        style={{
                          top: '35%',
                          right: '20%',
                          animation: `particleFloat ${5.04 + index * 0.36}s ease-in-out infinite`,
                          animationDelay: `${index * 1.44 + 1.44}s`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
              >
                <Button size="lg" className="btn-cta-enhanced text-base" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 btn-icon-animate" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="btn-outline-enhanced text-base" asChild>
                  <Link href="#demo">
                    <Play className="mr-2 h-4 w-4 btn-icon-animate" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  100% Free MVP
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited Everything
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
          >
            <motion.h2 variants={fadeUpVariants} className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Everything You Need to Dominate Social Media
            </motion.h2>
            <motion.p variants={fadeUpVariants} className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our AI-powered platform provides all the tools marketing agencies need to manage multiple clients and scale their business.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto grid justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-12 sm:mt-16 max-w-6xl"
          >
            {[
              {
                icon: Brain,
                title: "AI Content Generation",
                description: "Generate engaging posts with AI that understands your brand voice and audience.",
                color: "text-purple-500"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Schedule posts at optimal times for maximum engagement across all platforms.",
                color: "text-blue-500"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Track performance with detailed insights and beautiful, exportable reports.",
                color: "text-green-500"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Work together with team members, assign roles, and manage client projects.",
                color: "text-orange-500"
              },
              {
                icon: MessageSquare,
                title: "Social Inbox",
                description: "Manage all your social media messages and comments in one unified inbox.",
                color: "text-pink-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level security with data encryption and compliance features.",
                color: "text-indigo-500"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeUpVariants}>
                <Card className="relative overflow-hidden hover-lift h-full">
                  <CardHeader>
                    <feature.icon className={cn("h-12 w-12 mb-4", feature.color)} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Interactive Feature Tabs */}
        <section id="feature-tabs" className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
          >
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Explore Our Powerful Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Discover how each feature transforms your social media management workflow
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-16"
          >
            <div className="rounded-3xl p-8 lg:p-12">
              {/* Feature Tabs */}
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Tab Navigation */}
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Choose a Feature to Explore</h3>
                  {[
                    {
                      id: 'ai-content',
                      icon: Brain,
                      title: 'AI Content Generation',
                      hook: 'Spend 10+ hours weekly creating content? Our AI generates engaging posts in seconds!',
                      description: 'Generate engaging posts with AI that understands your brand voice and audience.',
                      benefits: [
                        'Generate 50+ posts in minutes',
                        'Brand voice consistency',
                        'Multi-platform optimization',
                        'Trending topic integration'
                      ],
                      cta: 'Try AI Content Generator',
                      stats: 'Save 15+ hours/week'
                    },
                    {
                      id: 'smart-scheduling',
                      icon: Calendar,
                      title: 'Smart Scheduling',
                      hook: 'Missing peak engagement times? Our AI finds your audience\'s active hours!',
                      description: 'Schedule posts at optimal times for maximum engagement across all platforms.',
                      benefits: [
                        'Optimal timing detection',
                        'Cross-platform coordination',
                        'Timezone management',
                        'Engagement prediction'
                      ],
                      cta: 'Schedule Your First Post',
                      stats: 'Increase engagement by 340%'
                    },
                    {
                      id: 'analytics',
                      icon: BarChart3,
                      title: 'Advanced Analytics',
                      hook: 'Blind to your social performance? Get crystal-clear insights that drive growth!',
                      description: 'Track performance with detailed insights and beautiful, exportable reports.',
                      benefits: [
                        'Real-time performance tracking',
                        'Custom report generation',
                        'ROI measurement',
                        'Competitor analysis'
                      ],
                      cta: 'View Sample Reports',
                      stats: 'Track 50+ metrics'
                    },
                    {
                      id: 'team-collaboration',
                      icon: Users,
                      title: 'Team Collaboration',
                      hook: 'Managing clients in chaos? Organize everything in one dashboard!',
                      description: 'Work together with team members, assign roles, and manage client projects.',
                      benefits: [
                        'Client project management',
                        'Role-based permissions',
                        'Approval workflows',
                        'Team communication'
                      ],
                      cta: 'Set Up Your Team',
                      stats: 'Manage unlimited clients'
                    },
                    {
                      id: 'social-inbox',
                      icon: MessageSquare,
                      title: 'Social Inbox',
                      hook: 'Drowning in messages? Centralize all conversations in one place!',
                      description: 'Manage all your social media messages and comments in one unified inbox.',
                      benefits: [
                        'Unified message center',
                        'Auto-response setup',
                        'Sentiment analysis',
                        'Priority filtering'
                      ],
                      cta: 'Connect Your Accounts',
                      stats: 'Handle 10x more messages'
                    },
                    {
                      id: 'security',
                      icon: Shield,
                      title: 'Enterprise Security',
                      hook: 'Worried about data security? Bank-level protection for your business!',
                      description: 'Bank-level security with data encryption and compliance features.',
                      benefits: [
                        'End-to-end encryption',
                        'SOC 2 compliance',
                        'Two-factor authentication',
                        'Data backup & recovery'
                      ],
                      cta: 'Learn About Security',
                      stats: '99.9% uptime guarantee'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feature.hook}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                              {feature.stats}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Feature Details */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">AI Content Generation</h4>
                        <p className="text-primary font-medium">Save 15+ hours/week</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Spend 10+ hours weekly creating content? Our AI generates engaging posts in seconds! 
                      Generate content that perfectly matches your brand voice and resonates with your audience.
                    </p>

                    <div className="space-y-3 mb-6">
                      <h5 className="font-semibold">Key Benefits:</h5>
                      {[
                        'Generate 50+ posts in minutes',
                        'Brand voice consistency across platforms',
                        'Multi-platform optimization',
                        'Trending topic integration',
                        'Hashtag research and suggestions',
                        'Content calendar automation'
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="btn-primary-enhanced" asChild>
                        <Link href="/register">
                          <Zap className="mr-2 h-4 w-4 btn-icon-animate" />
                          Try AI Content Generator
                        </Link>
                      </Button>
                      <Button variant="outline" className="btn-outline-enhanced" asChild>
                        <Link href="#demo">
                          <Play className="mr-2 h-4 w-4 btn-icon-animate" />
                          See It In Action
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                            {i}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">4.9/5 from 1,200+ users</p>
                      </div>
                    </div>
                    <p className="text-sm italic text-muted-foreground">
                      "The AI content generator saved us 20 hours per week. Our engagement increased by 340%!"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">- Sarah M., Marketing Director</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* User Journey Timeline */}
        <section id="timeline" className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
          >
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              How SocialFlow Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              See how our features work together to transform your social media management
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-16"
          >
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary hidden lg:block"></div>
              
              {/* Timeline Steps */}
              <div className="space-y-8 sm:space-y-12">
                {[
                  {
                    step: 1,
                    icon: Brain,
                    title: "AI Generates Your Content",
                    description: "Our AI analyzes your brand voice and creates engaging posts tailored to each platform.",
                    features: ["Brand voice analysis", "Platform-specific optimization", "Trending topic integration"],
                    cta: "Try Content Generator",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    step: 2,
                    icon: Calendar,
                    title: "Smart Scheduling Takes Over",
                    description: "AI determines the optimal posting times for maximum engagement across all platforms.",
                    features: ["Peak time detection", "Cross-platform coordination", "Timezone management"],
                    cta: "Schedule Your Posts",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    step: 3,
                    icon: MessageSquare,
                    title: "Unified Inbox Management",
                    description: "Respond to all messages and comments from one centralized dashboard.",
                    features: ["Message prioritization", "Auto-responses", "Sentiment analysis"],
                    cta: "Connect Your Accounts",
                    color: "from-green-500 to-emerald-500"
                  },
                  {
                    step: 4,
                    icon: BarChart3,
                    title: "Performance Analytics",
                    description: "Track your success with detailed insights and beautiful reports.",
                    features: ["Real-time metrics", "Custom reports", "ROI tracking"],
                    cta: "View Sample Reports",
                    color: "from-orange-500 to-red-500"
                  },
                  {
                    step: 5,
                    icon: Users,
                    title: "Team Collaboration",
                    description: "Manage client projects and collaborate with your team seamlessly.",
                    features: ["Client management", "Role permissions", "Approval workflows"],
                    cta: "Set Up Your Team",
                    color: "from-indigo-500 to-purple-500"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8"
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10 flex-shrink-0 lg:order-1">
                      <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}>
                        <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gradient-to-br from-card via-background to-card rounded-2xl p-4 sm:p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 lg:order-2">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                          <p className="text-muted-foreground mb-4">{item.description}</p>
                          
                          <div className="space-y-2 mb-6">
                            {item.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button className="btn-primary-enhanced" asChild>
                            <Link href="/register">
                              <ArrowRight className="mr-2 h-4 w-4 btn-icon-animate" />
                              {item.cta}
                            </Link>
                          </Button>
                        </div>

                        {/* Visual Element */}
                        <div className="lg:w-48 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                          <item.icon className="h-16 w-16 text-primary/50" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Media Platforms */}
        <section className="border-t bg-muted/50 relative overflow-hidden">
          {/* Floating background elements for zero-gravity effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-primary/20 rounded-full animate-zero-gravity-1" style={{animationDelay: '0s'}} />
            <div className="absolute top-20 right-20 w-1 h-1 bg-accent/30 rounded-full animate-zero-gravity-2" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-secondary/25 rounded-full animate-zero-gravity-3" style={{animationDelay: '2s'}} />
            <div className="absolute bottom-10 right-10 w-1 h-1 bg-primary/15 rounded-full animate-zero-gravity-1" style={{animationDelay: '3s'}} />
            <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-accent/20 rounded-full animate-zero-gravity-2" style={{animationDelay: '1.5s'}} />
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary/20 rounded-full animate-zero-gravity-3" style={{animationDelay: '2.5s'}} />
            <div className="absolute top-1/4 left-1/2 w-0.8 h-0.8 bg-primary/10 rounded-full animate-zero-gravity-1" style={{animationDelay: '4s'}} />
            <div className="absolute bottom-1/3 right-1/4 w-1.2 h-1.2 bg-accent/15 rounded-full animate-zero-gravity-2" style={{animationDelay: '5s'}} />
          </div>
          
          <div className="container mx-auto py-8 md:py-12 lg:py-24 px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariants}
              className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
            >
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Connect All Your Favorite AI Agents
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Generate and manage content using the most powerful AI agents from one unified dashboard.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 relative">
                {[
                  { icon: Bot, name: "ChatGPT", color: "#10A37F", delay: 0, animation: "moonFloat" },
                  { icon: Brain, name: "Claude", color: "#FF6B35", delay: 0.5, animation: "zeroGravity1" },
                  { icon: Cpu, name: "DeepSeek", color: "#1E40AF", delay: 1, animation: "zeroGravity2" },
                  { icon: AISparkles, name: "Gemini", color: "#4285F4", delay: 1.5, animation: "zeroGravity3" },
                  { icon: Database, name: "Perplexity", color: "#8B5CF6", delay: 2, animation: "moonFloat" },
                  { icon: Zap, name: "Anthropic", color: "#F59E0B", delay: 2.5, animation: "zeroGravity1" },
                ].map((platform, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100,
                      damping: 10
                    }}
                    className="flex flex-col items-center space-y-2 relative"
                    style={{
                      animation: `${platform.animation} ${8 + index * 1}s ease-in-out infinite`,
                      animationDelay: `${platform.delay * 2}s`
                    }}
                  >
                    <div 
                      className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-2xl hover-scale transition-all duration-300 moon-float-glow"
                      style={{ 
                        backgroundColor: platform.color,
                        boxShadow: `0 8px 32px ${platform.color}40, 0 0 0 1px ${platform.color}20`
                      }}
                    >
                      <platform.icon className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-medium text-center">{platform.name}</span>
                    
                    {/* Floating particles around each icon */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                        style={{
                          top: '10%',
                          left: '20%',
                          animation: `particleFloat ${6 + index * 0.5}s ease-in-out infinite`,
                          animationDelay: `${platform.delay * 2 + 1}s`
                        }}
                      />
                      <div 
                        className="absolute w-1 h-1 bg-white rounded-full opacity-40"
                        style={{
                          top: '30%',
                          right: '15%',
                          animation: `particleFloat ${7 + index * 0.5}s ease-in-out infinite`,
                          animationDelay: `${platform.delay * 2 + 2}s`
                        }}
                      />
                      <div 
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-50"
                        style={{
                          bottom: '20%',
                          left: '30%',
                          animation: `particleFloat ${5.5 + index * 0.5}s ease-in-out infinite`,
                          animationDelay: `${platform.delay * 2 + 1.5}s`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
          >
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Completely Free During MVP Phase
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Get full access to all features at no cost. No credit card required, no hidden fees, no time limits.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-16"
          >
            <div className="rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left side - Pricing info */}
              <motion.div variants={fadeUpVariants} className="space-y-6 sm:space-y-8">
                {/* Badges */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white text-sm px-4 py-2 shadow-lg">
                    <Sparkles className="mr-1 h-3 w-3" />
                    MVP Phase
                  </Badge>
                  <Badge className="bg-gradient-to-r from-secondary to-accent text-white text-sm px-4 py-2 shadow-lg">
                    <Award className="mr-1 h-3 w-3" />
                    Limited Time
                      </Badge>
                    </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                                      <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Free for Limited Time
                  </h3>
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      LIMITED
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-bold text-primary">$0</span>
                    <span className="text-xl sm:text-2xl text-muted-foreground">/month</span>
                  </div>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Perfect for getting started - No credit card required
                  </p>
                  <div className="text-sm text-red-500 font-medium">
                    ⚠️ This free offer is only available during our MVP phase
                  </div>
                </div>

                {/* Value proposition */}
                <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">$348</div>
                      <div className="text-sm text-muted-foreground line-through">per year</div>
                    </div>
                    <div className="text-4xl text-muted-foreground">→</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">$0</div>
                      <div className="text-sm text-muted-foreground">you pay</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-lg font-bold text-primary">You Save $348/year</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      *Compared to similar platforms
                    </div>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="text-lg">Join 10,000+ marketing agencies</span>
                </div>

                {/* CTA buttons */}
                <div className="space-y-4">
                  <Button size="lg" className="btn-cta-enhanced w-full sm:w-auto text-lg py-6 px-8" asChild>
                    <Link href="/register">
                      <Zap className="mr-2 h-5 w-5 btn-icon-animate" />
                      Start Free Today
                      <ArrowRight className="ml-2 h-5 w-5 btn-icon-animate" />
                    </Link>
                    </Button>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>No Setup Fee</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side - Features */}
              <motion.div variants={fadeUpVariants} className="space-y-4 sm:space-y-6">
                <h4 className="text-xl sm:text-2xl font-bold text-center lg:text-left">
                  Everything You Need to Succeed
                </h4>
                
                <div className="grid gap-3 sm:gap-4">
                  {[
                    "Unlimited social media accounts",
                    "AI content generation with all major AI models",
                    "Smart scheduling across all platforms", 
                    "Advanced analytics & reporting",
                    "Team collaboration & client management",
                    "All integrations included",
                    "Priority support during MVP",
                    "White-label reports",
                    "Custom branding options"
                  ].map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIndex * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-base font-medium">{feature}</span>
              </motion.div>
            ))}
                </div>

                <div className="pt-4">
                  <Button variant="outline" size="lg" className="btn-outline-enhanced w-full sm:w-auto" asChild>
                    <Link href="#features">
                      <Play className="mr-2 h-4 w-4 btn-icon-animate" />
                      See All Features
                    </Link>
                  </Button>
                </div>
              </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Coming soon notice */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-full text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Pro and Enterprise plans coming soon with advanced features</span>
            </div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="border-t bg-muted/50">
          <div className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariants}
              className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
            >
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Loved by Marketing Agencies Worldwide
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                See what our users are saying about SocialFlow and how it's transforming their social media management.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-16"
            >
              {[
                {
                  name: "Sarah Johnson",
                  role: "Digital Marketing Manager",
                  company: "GrowthCo",
                  content: "SocialFlow has completely transformed how we manage our clients' social media. The AI content generation is incredible!",
                  rating: 5
                },
                {
                  name: "Mike Chen",
                  role: "Agency Owner",
                  company: "Social Boost",
                  content: "We've increased our client capacity by 300% since using SocialFlow. The automation features are game-changing.",
                  rating: 5
                },
                {
                  name: "Emily Rodriguez",
                  role: "Social Media Specialist",
                  company: "Creative Media",
                  content: "The best part? It's completely free! We're saving thousands while getting enterprise-level features.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div key={index} variants={fadeUpVariants}>
                  <Card className="hover-lift h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{testimonial.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enterprise Contact Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                variants={fadeUpVariants}
                className="text-center max-w-3xl mx-auto mb-12"
              >
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl mb-4">
                  Need Enterprise Solutions or Custom Features?
                </h2>
                <p className="text-lg text-muted-foreground mb-2">
                  Get in touch with our team for enterprise-grade solutions, custom integrations, 
                  or 24/7 dedicated support.
                </p>
                <Badge variant="outline" className="mb-6">
                  <Phone className="mr-2 h-3 w-3" />
                  24/7 WhatsApp Support Available
                </Badge>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left side - Benefits */}
                <motion.div variants={fadeUpVariants} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Why Choose Enterprise?</h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        icon: Shield,
                        title: "Enterprise Security",
                        description: "Advanced security features, SSO integration, and compliance standards"
                      },
                      {
                        icon: Users,
                        title: "Dedicated Account Manager", 
                        description: "Personal support representative for your organization's needs"
                      },
                      {
                        icon: Zap,
                        title: "Custom Integrations",
                        description: "Connect with your existing tools and workflows seamlessly"
                      },
                      {
                        icon: Phone,
                        title: "Priority Support",
                        description: "24/7 WhatsApp support with guaranteed response times"
                      }
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <benefit.icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Right side - Contact Form */}
                <motion.div variants={fadeUpVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Get in Touch</CardTitle>
                      <CardDescription>
                        Fill out the form below and we'll contact you via WhatsApp within 24 hours.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="enterprise-name" className="text-sm font-medium">Name *</Label>
                            <Input
                              id="enterprise-name"
                              name="name"
                              value={enterpriseForm.name}
                              onChange={handleEnterpriseInputChange}
                              required
                              placeholder="Your full name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="enterprise-email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="enterprise-email"
                              name="email"
                              type="email"
                              value={enterpriseForm.email}
                              onChange={handleEnterpriseInputChange}
                              required
                              placeholder="your@company.com"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="enterprise-company" className="text-sm font-medium">Company *</Label>
                          <Input
                            id="enterprise-company"
                            name="company"
                            value={enterpriseForm.company}
                            onChange={handleEnterpriseInputChange}
                            required
                            placeholder="Your company name"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="enterprise-contact-type" className="text-sm font-medium">What can we help you with?</Label>
                          <Select onValueChange={handleEnterpriseSelectChange} value={enterpriseForm.contactType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enterprise">Enterprise Solutions</SelectItem>
                              <SelectItem value="custom">Custom Development</SelectItem>
                              <SelectItem value="integration">System Integration</SelectItem>
                              <SelectItem value="support">Dedicated Support</SelectItem>
                              <SelectItem value="demo">Product Demo</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="enterprise-message" className="text-sm font-medium">Tell us about your needs *</Label>
                          <Textarea
                            id="enterprise-message"
                            name="message"
                            value={enterpriseForm.message}
                            onChange={handleEnterpriseInputChange}
                            required
                            placeholder="Describe your requirements, team size, and specific needs..."
                            rows={4}
                            className="mt-1"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full btn-cta-enhanced"
                          disabled={isSubmittingEnterprise}
                        >
                          {isSubmittingEnterprise ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Enterprise Inquiry
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          🔒 Your information is secure. We'll contact you via WhatsApp within 24 hours.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="mx-auto flex max-w-[58rem] flex-col items-center gap-4 text-center"
          >
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Ready to Transform Your Social Media Management?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of marketing agencies who are already using SocialFlow to scale their business. 
              Start for free today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" className="btn-cta-enhanced text-base" asChild>
                <Link href="/register">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4 btn-icon-animate" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="btn-outline-enhanced text-base" asChild>
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl">SocialFlow</span>
              </Link>
              <p className="text-muted-foreground max-w-xs">
                AI-powered social media management for marketing agencies and businesses.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors scroll-smooth">Features</Link></li>
                <li><Link href="#feature-tabs" className="hover:text-foreground transition-colors scroll-smooth">Explore Features</Link></li>
                <li><Link href="#timeline" className="hover:text-foreground transition-colors scroll-smooth">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors scroll-smooth">Pricing</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link href="/status" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <p>© 2025 SocialFlow. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <span>Created by</span>
                <a 
                  href="http://rakmyat.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Rakmyat.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="/linkedin" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-primary via-accent to-secondary text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:hover:shadow-primary/50"
          aria-label="Back to top"
        >
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-[-90deg]" />
        </motion.button>
      )}
    </div>
  )
}