import { Link } from "react-router-dom";
import type { Member } from "../../../services/publicService";
import FlipCard from "../components/FlipCard";
import SectionHeading from "../components/SectionHeading";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface Props {
  members: Member[];
}

const LEADER_TYPES = ["sarpanch", "upsarpanch", "gramsevak", "leader", "grampanchayat_adhikari"];

export default function AdministrationPreview({ members }: Props) {
  const leaders = members.filter((m) => LEADER_TYPES.includes(m.type)).slice(0, 4);
  const displayMembers = leaders.length > 0 ? leaders : members.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="👥 पदाधिकारी"
          title="आमचे लोकप्रतिनिधी"
          subtitle="गावाच्या विकासासाठी कार्यरत असलेले आमचे पदाधिकारी"
          align="center"
          badgeColor="text-blue-600 bg-blue-50 border-blue-200"
          rightAction={
            <Link
              to="/administration"
              className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 text-sm sm:text-base"
            >
              सर्व पहा
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {displayMembers.map((member) => (
            <StaggerItem key={member.id} animation="scaleIn">
              <FlipCard member={member} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
