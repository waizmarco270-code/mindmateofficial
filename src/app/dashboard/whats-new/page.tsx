
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Sparkles, Megaphone } from 'lucide-react';
import versionHistory from '@/app/lib/version-history.json';
import { format, parseISO } from 'date-fns';

export default function WhatsNewPage() {
  const latestVersion = versionHistory[0];
  const pastVersions = versionHistory.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Megaphone className="h-10 w-10 text-primary" />
          What's New in MindMate
        </h1>
        <p className="text-lg text-muted-foreground mt-2">The latest updates, features, and improvements to your favorite study app.</p>
      </div>

      {/* Latest Version Showcase */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <Badge variant="default" className="text-base">v{latestVersion.version} - Latest</Badge>
                    <CardTitle className="text-3xl mt-2">{latestVersion.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{format(parseISO(latestVersion.date), 'PPP')}</p>
            </div>
          </CardHeader>
          <CardContent>
            <motion.ul
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {latestVersion.changes.map((change, index) => (
                <motion.li key={index} className="flex items-start gap-3" variants={itemVariants}>
                  <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{change}</span>
                </motion.li>
              ))}
            </motion.ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Versions */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Past Versions</h2>
        <motion.div
          className="relative pl-8 space-y-10 border-l-2 border-dashed"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pastVersions.map((version) => (
            <motion.div key={version.version} className="relative" variants={itemVariants}>
              <div className="absolute -left-[34px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <p className="text-sm text-muted-foreground">{format(parseISO(version.date), 'PPP')}</p>
              <h3 className="text-xl font-bold mt-1">v{version.version} - {version.title}</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {version.changes.map((change, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
