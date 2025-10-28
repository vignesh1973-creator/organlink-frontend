import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { FileText, Vote, LayoutGrid } from "lucide-react";

interface Props {
  onNavigate?: () => void;
}

export default function OrganizationSidebar({ onNavigate }: Props) {
  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-md text-sm hover:bg-gray-100";
  const activeClass = ({ isActive }: any) =>
    `${linkBase} ${isActive ? "bg-gray-100 font-medium" : "text-gray-700"}`;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b">
        <div className="text-lg font-semibold">Organization</div>
        <div className="text-xs text-gray-500">Policy & Governance</div>
      </div>
      <nav className="p-2 space-y-1">
        <NavLink
          to="/organization/dashboard"
          className={activeClass}
          onClick={onNavigate}
        >
          <LayoutGrid className="h-4 w-4" /> Dashboard
        </NavLink>
        <NavLink
          to="/organization/policies"
          className={activeClass}
          onClick={onNavigate}
        >
          <FileText className="h-4 w-4" /> Policies
        </NavLink>
        <NavLink
          to="/organization/policies/propose"
          className={activeClass}
          onClick={onNavigate}
        >
          <FileText className="h-4 w-4" /> Propose Policy
        </NavLink>
        <NavLink
          to="/organization/policies/vote"
          className={activeClass}
          onClick={onNavigate}
        >
          <Vote className="h-4 w-4" /> Vote
        </NavLink>
      </nav>
    </div>
  );
}
