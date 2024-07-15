import SidebarHeader from "./SidebarHeader";
import Navlinks from "./Navlinks";
import MemberProfile from "./MemberProfile";

const Sidebar = () => {
  return (
    <div className="px-4 w-80 min-h-full bg-base-300 py-12 grid grid-rows-[auto,ifr,auto]">
      {/* first row */}
      <SidebarHeader />
      {/* second row */}
      <Navlinks />
      {/* third row */}
      <MemberProfile />
    </div>
  );
};
export default Sidebar;
