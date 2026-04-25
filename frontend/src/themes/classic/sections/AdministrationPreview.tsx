import { Link } from "react-router-dom";
import type { Member } from "../../../services/publicService";
import FlipCard from "../components/FlipCard";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface Props {
  members: Member[];
}

const LEADER_TYPES = ["sarpanch", "upsarpanch", "gramsevak", "leader"];

export default function AdministrationPreview({ members }: Props) {
  const leaders = members.filter((m) => LEADER_TYPES.includes(m.type)).slice(0, 4);
  const displayMembers = leaders.length > 0 ? leaders : members.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <AnimatedSection animation="fadeUp" className="text-center mb-12">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">
            ग्रामपंचायत प्रशासन
          </span>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            आमचे लोकप्रतिनिधी
          </h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            गावाच्या विकासासाठी कार्यरत असलेले आमचे पदाधिकारी
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {displayMembers.map((member) => (
            <StaggerItem key={member.id} animation="scaleIn">
              <FlipCard member={member} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-10">
          <Link
            to="/administration"
            className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-500 hover:text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            संपूर्ण टीम पहा
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
