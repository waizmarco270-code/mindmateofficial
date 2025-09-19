'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "What is MindMate?",
    answer: "MindMate is an all-in-one study platform designed to help students learn smarter. It combines study tools like a Pomodoro timer and focus mode with gamified features like quizzes and rewards, plus an AI tutor to help with your questions."
  },
  {
    question: "How do I earn credits?",
    answer: "You can earn credits in many ways: completing your daily to-do list (+1), getting a perfect score on a quiz (+5), completing focus sessions, winning in the Reward Zone, and maintaining your daily study streak."
  },
  {
    question: "What are streaks and how do they work?",
    answer: "A streak is maintained by logging in and completing at least one productive task (like a focus session or completing your to-do list) each day. Maintaining your streak gives you bonus credit rewards every 5 and 30 days. Don't break the chain!"
  },
  {
    question: "What is the purpose of the 'Challenger' zone?",
    answer: "The Challenger zone is designed to help you build discipline. You can join a challenge (like the '7-Day Warrior') by paying an entry fee. If you complete all the daily goals for the duration of the challenge, you get your entry fee back plus a big credit reward."
  },
  {
    question: "How do I get the 'Elite Member' or 'GM' badge?",
    answer: "The Elite Member badge is awarded by admins to exceptionally dedicated and active users. The Game Master (GM) badge is awarded weekly to the #1 player on the Game Zone leaderboard. Both badges come with exclusive daily rewards."
  },
  {
    question: "I found a bug. What should I do?",
    answer: "That's great! Please go to the 'Help & Support' page and send us a message detailing the bug. We offer rewards, like credits or other prizes, for reporting critical bugs that help us improve the platform."
  }
];

// This is now a component, not a default export page
export default function FaqContent() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-base">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
