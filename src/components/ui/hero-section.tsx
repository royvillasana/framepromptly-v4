import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Workflow, Brain } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Dark blur overlay BELOW the canvas */}
      <div className="absolute inset-0 w-full h-full z-0 backdrop-blur-md" style={{ background: '#0a174eCC' }} aria-hidden="true" />
      {/* Animated background */}
      <AnimatedBackground className="z-10" />
      

      <div className="relative container mx-auto px-6 py-32 lg:py-40" style={{ zIndex: 20 }}>
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered UX Workflow Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent leading-tight"
          >
            Build UX Workflows
            <br />
            <span className="text-white">with AI Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Streamline your UX process with intelligent frameworks, automated prompt generation, 
            and AI-powered tools. From Design Thinking to Agile UX - build better experiences faster.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover text-lg px-8 py-6" asChild>
              <a href="/workflow">
                Start Building
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Workflow className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Visual Workflow Builder</h3>
              <p className="text-gray-300 text-sm">
                Drag-and-drop interface to build complex UX workflows with multiple frameworks
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">AI Prompt Generation</h3>
              <p className="text-gray-300 text-sm">
                Intelligent prompt creation with context awareness and framework-specific templates
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">UX Framework Library</h3>
              <p className="text-gray-300 text-sm">
                Comprehensive collection of proven methodologies from Design Thinking to Agile UX
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}