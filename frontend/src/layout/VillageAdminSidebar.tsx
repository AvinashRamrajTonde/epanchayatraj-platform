import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Bell,
  Image,
  Globe,
  Star,
  Receipt,
  Wrench,
  CalendarDays,
  School,
  FileText,
  MessageSquare,
  FileCheck,
  Settings,
  ChevronDown,
  MoreHorizontal,
  MonitorPlay,
  Info,
  Target,
  BarChart3,
  Phone,
  Briefcase,
  AlertCircle,
  Search,
  CreditCard,
  Trees,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useTenant } from "../context/TenantContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; icon: React.ReactNode }[];
};

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, name: "डॅशबोर्ड", path: "/admin" },
  { icon: <Users size={18} />, name: "सदस्य", path: "/admin/members" },
  { icon: <Bell size={18} />, name: "सूचना", path: "/admin/notices" },
  { icon: <Image size={18} />, name: "गॅलरी", path: "/admin/gallery" },
  {
    icon: <Globe size={18} />,
    name: "वेबसाइट माहिती",
    subItems: [
      { name: "हिरो स्लाइड्स", path: "/admin/hero-slides", icon: <MonitorPlay size={14} /> },
      { name: "हिरो माहिती", path: "/admin/content/hero", icon: <Info size={14} /> },
      { name: "गावाबद्दल माहिती", path: "/admin/content/about", icon: <Trees size={14} /> },
      { name: "दृष्टी व ध्येय", path: "/admin/content/vision_mission", icon: <Target size={14} /> },
      { name: "गाव आकडेवारी", path: "/admin/content/village_stats", icon: <BarChart3 size={14} /> },
      { name: "संपर्क माहिती", path: "/admin/content/contact", icon: <Phone size={14} /> },
      { name: "सेवा माहिती", path: "/admin/content/services", icon: <Briefcase size={14} /> },
      { name: "महत्त्वाची माहिती", path: "/admin/content/important", icon: <AlertCircle size={14} /> },
    ],
  },
  {
    icon: <CalendarDays size={18} />,
    name: "कार्यक्रम व योजना",
    subItems: [
      { name: "कार्यक्रम", path: "/admin/programs", icon: <CalendarDays size={14} /> },
      { name: "योजना", path: "/admin/schemes", icon: <Star size={14} /> },
    ],
  },
  { icon: <Star size={18} />, name: "पुरस्कार", path: "/admin/awards" },
  { icon: <Receipt size={18} />, name: "जमा खर्च", path: "/admin/financial-reports" },
  { icon: <Wrench size={18} />, name: "विकास कामे", path: "/admin/development-works" },
  { icon: <CalendarDays size={18} />, name: "ग्रामसभा", path: "/admin/gramsabhas" },
  { icon: <School size={18} />, name: "शाळा", path: "/admin/schools" },
  { icon: <FileText size={18} />, name: "अर्ज", path: "/admin/applications" },
  { icon: <MessageSquare size={18} />, name: "संपर्क संदेश", path: "/admin/contact-submissions" },
  { icon: <AlertCircle size={18} />, name: "तक्रारी", path: "/admin/complaints" },
  { icon: <Receipt size={18} />, name: "कर संकलन", path: "/admin/tax-collection" },
  {
    icon: <FileCheck size={18} />,
    name: "प्रमाणपत्र",
    subItems: [
      { name: "अर्ज व्यवस्थापन", path: "/admin/certificates", icon: <FileCheck size={14} /> },
      { name: "पेमेंट सेटिंग्ज", path: "/admin/payment-config", icon: <CreditCard size={14} /> },
    ],
  },
];

const othersItems: NavItem[] = [
  { icon: <Settings size={18} />, name: "सेटिंग्ज", path: "/admin/settings" },
];

const VillageAdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { village } = useTenant();
  const location = useLocation();
  const isCollapsed = !isExpanded && !isHovered && !isMobileOpen;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const villageName = village?.name || "Village Admin";
  const villageInitials = villageName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-0.5">
      {items.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        const hasActiveChild = nav.subItems?.some((s) => isActive(s.path));
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`
                  group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                  text-sm font-medium transition-all duration-150 cursor-pointer
                  ${
                    isSubmenuOpen || hasActiveChild
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : "justify-start"}
                `}
              >
                <span className={`flex-shrink-0 ${
                  isSubmenuOpen || hasActiveChild
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300"
                }`}>
                  {nav.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left leading-tight">{nav.name}</span>
                    <ChevronDown size={15} className={`flex-shrink-0 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-brand-500" : "text-gray-400"
                    }`} />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  title={isCollapsed ? nav.name : undefined}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive(nav.path)
                        ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    }
                    ${isCollapsed ? "justify-center" : "justify-start"}
                  `}
                >
                  <span className={`flex-shrink-0 ${
                    isActive(nav.path)
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300"
                  }`}>
                    {nav.icon}
                  </span>
                  {!isCollapsed && <span className="flex-1 leading-tight">{nav.name}</span>}
                </Link>
              )
            )}
            {nav.subItems && !isCollapsed && (
              <div
                ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-4 dark:border-gray-700/70">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                          isActive(subItem.path)
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-500 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                        }`}
                      >
                        <span className="flex-shrink-0 text-current">{subItem.icon}</span>
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        h-screen transition-all duration-300 ease-in-out
        ${isExpanded || isMobileOpen ? "w-[270px]" : isHovered ? "w-[270px]" : "w-[72px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Village Logo */}
      <div className={`flex h-16 flex-shrink-0 items-center border-b border-gray-200 dark:border-gray-800 px-4 ${
        isCollapsed ? "justify-center" : "justify-start gap-3"
      }`}>
        <Link to="/admin" className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white text-xs font-bold shadow-sm shadow-brand-500/40 select-none">
            {villageInitials || "GA"}
          </span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {villageName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
                Admin Panel
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar">
        <nav className="px-3">
          <div className="mb-5">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                मुख्य मेनू
              </p>
            )}
            {isCollapsed && (
              <div className="mb-3 flex justify-center">
                <MoreHorizontal size={16} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
            {renderMenuItems(navItems, "main")}
          </div>
          <div>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                इतर
              </p>
            )}
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default VillageAdminSidebar;
