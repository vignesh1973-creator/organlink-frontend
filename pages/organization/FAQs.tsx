import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Shield, Vote, FileText, TrendingUp } from "lucide-react";
import OrganizationLayout from "@/components/organization/OrganizationLayout";

const faqData = [
  {
    category: "General",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is the role of organizations in OrganLink?",
        answer: "Organizations in OrganLink represent healthcare regulatory bodies, NGOs, and government agencies that can propose and vote on organ allocation policies. These policies influence how organs are prioritized and allocated across the network, ensuring fair and transparent distribution based on medical criteria."
      },
      {
        question: "How does policy management work?",
        answer: "Organizations can propose new organ allocation policies that define criteria like urgency levels, waiting time, geographical distance, and medical compatibility. Once proposed, other organizations can vote on these policies. Policies require majority approval to become active and influence the AI matching algorithm."
      },
      {
        question: "Who can join as an organization member?",
        answer: "Healthcare regulatory bodies, government health departments, national organ donation networks, and authorized NGOs working in the transplant space can apply to join OrganLink as organization members with policy governance rights."
      }
    ]
  },
  {
    category: "Policy Proposals",
    icon: FileText,
    faqs: [
      {
        question: "How do I propose a new policy?",
        answer: "Navigate to the 'Propose' section from the organization portal. Fill in the policy details including title, description, organ types affected, and policy criteria with their respective weights. Submit the proposal for voting by other organizations. You can withdraw your proposal within 24 hours of submission if needed."
      },
      {
        question: "What makes a good policy proposal?",
        answer: "A good policy should be specific, evidence-based, and clearly define the allocation criteria. It should balance medical urgency, fairness, and practical logistics. Include clear reasoning for the proposed weights and ensure the criteria align with ethical medical standards."
      },
      {
        question: "Can I withdraw a policy after proposing it?",
        answer: "Yes, you can withdraw a policy within 24 hours of proposing it, but only if voting hasn't started yet. After the 24-hour window or once voting begins, the policy cannot be withdrawn to maintain integrity of the governance process."
      },
      {
        question: "How long does the voting period last?",
        answer: "The standard voting period for policies is typically 7-14 days depending on the urgency and complexity of the proposal. Organizations are notified when new policies are available for voting and when voting periods are about to close."
      }
    ]
  },
  {
    category: "Voting & Governance",
    icon: Vote,
    faqs: [
      {
        question: "How does policy voting work?",
        answer: "Each registered organization gets one vote per policy proposal. You can vote 'Yes' to approve, 'No' to reject, or abstain. Policies require a simple majority (more than 50% of votes) to be approved. All votes are recorded on the blockchain for transparency and cannot be changed once submitted."
      },
      {
        question: "What happens when a policy is approved?",
        answer: "Once approved, the policy becomes 'Active' and immediately influences the AI matching algorithm. The policy criteria and weights are applied to organ allocations across all participating hospitals. Active policies are visible to all stakeholders and their impact can be monitored through analytics."
      },
      {
        question: "Can active policies be modified or revoked?",
        answer: "Active policies can be updated or revoked through a new proposal and voting process. Organizations can propose amendments or complete revocation, which then follows the same voting procedure. This ensures all changes to active policies are democratically decided."
      },
      {
        question: "What if there are conflicting active policies?",
        answer: "The system handles multiple active policies by combining their criteria intelligently. If conflicts exist (e.g., different weights for the same criterion), the most recently approved policy takes precedence. Organizations are notified of potential conflicts before voting."
      }
    ]
  },
  {
    category: "Policy Impact & Analytics",
    icon: TrendingUp,
    faqs: [
      {
        question: "How can I see the impact of active policies?",
        answer: "The Insights and Analytics section provides detailed metrics on active policies, including how many allocations were influenced, success rates, geographical distribution, and urgency level handling. You can compare outcomes before and after policy implementation."
      },
      {
        question: "What metrics are tracked for policies?",
        answer: "Key metrics include: number of organ allocations influenced, average matching score changes, urgency level distribution, geographical coverage, success rates, and time-to-match statistics. All data is aggregated and anonymized to protect patient privacy."
      },
      {
        question: "How does blockchain ensure policy transparency?",
        answer: "Every policy proposal, vote, approval, and application is recorded on the Ethereum blockchain as an immutable transaction. This creates a complete audit trail that anyone can verify, ensuring transparency and preventing tampering with the governance process."
      }
    ]
  },
  {
    category: "Security & Compliance",
    icon: Shield,
    faqs: [
      {
        question: "How is organization data secured?",
        answer: "Organization accounts use multi-factor authentication, encrypted communications, and blockchain-verified actions. All sensitive operations are logged and require authorization. Policy data is stored both on-chain (for verification) and off-chain (for efficiency)."
      },
      {
        question: "What are the compliance requirements?",
        answer: "Organizations must comply with local healthcare regulations (such as HIPAA in the US, GDPR in Europe), maintain active registration with relevant health authorities, and follow ethical guidelines for organ allocation. Regular compliance audits may be conducted."
      },
      {
        question: "How does OrganLink prevent policy manipulation?",
        answer: "Multiple safeguards are in place: blockchain-verified voting prevents tampering, one vote per organization ensures fairness, time-locked withdrawal windows prevent gaming, and all policy actions are publicly auditable. Additionally, suspicious voting patterns trigger automated reviews."
      }
    ]
  }
];

export default function OrganizationFAQs() {
  return (
    <OrganizationLayout 
      title="Frequently Asked Questions" 
      subtitle="Learn about policy management, voting, and governance in OrganLink"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>Organization Portal Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Welcome to the OrganLink Organization Portal. As an organization member, you play a crucial role in shaping organ allocation policies that ensure fair, transparent, and efficient distribution of organs across the network. Find answers to common questions below.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        {faqData.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <category.icon className="h-5 w-5 text-blue-600" />
                </div>
                <span>{category.category}</span>
                <Badge variant="secondary" className="ml-auto">
                  {category.faqs.length} questions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {/* Contact Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mt-1">
                  Our governance support team is available to help with policy-related questions and technical issues.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-gray-600">
                <span>📧 governance@organlink.org</span>
                <span className="hidden sm:inline">•</span>
                <span>📞 +1 (555) 123-4567</span>
                <span className="hidden sm:inline">•</span>
                <span>💬 Policy consultation available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}
