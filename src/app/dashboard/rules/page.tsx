'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const rules = [
  {
    question: "Credit System & Penalties",
    answer: "Credits are the currency of MindMate. While we encourage earning credits through productive activities, any attempt to exploit the system (e.g., using bots, scripts, or other unfair means) will result in a severe credit penalty or a temporary/permanent ban, determined by the admins."
  },
  {
    question: "Focus Mode & Timers",
    answer: "The Focus Mode and Pomodoro timers are designed to help you concentrate. Navigating away from the timer page, closing the tab, or being inactive for an extended period during an active session will result in the session being stopped and a credit penalty being applied. This policy enforces genuine, focused study."
  },
  {
    question: "Referral System",
    answer: "You can only use one referral code when you sign up. All referral rewards are subject to manual approval by a Super Admin to prevent fake accounts and system abuse. Any attempt to abuse the referral system will lead to penalties for all involved accounts."
  },
  {
    question: "Community & Social Hub",
    answer: "The Social Hub is a place for positive interaction. Any form of harassment, spam, or inappropriate content is strictly prohibited. Admins reserve the right to delete messages and penalize or block users who violate these community guidelines."
  },
  {
    question: "Bug Reporting",
    answer: "We reward users for finding and reporting genuine bugs. However, submitting false, misleading, or spam reports through the Help & Support system will result in a credit penalty. Please be clear and honest in your reports."
  },
  {
    question: "General Conduct",
    answer: "MindMate is a platform for learning and growth. All users are expected to behave respectfully. Admins have the final say in all disputes and may issue warnings or penalties as they see fit to maintain the integrity and positive environment of the platform."
  }
];

export default function RulesContent() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {rules.map((rule, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg font-semibold text-left">{rule.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-base">
            {rule.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
