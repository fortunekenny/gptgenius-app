import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const MemberProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 flex items-center gap-2">
      <UserButton afterSignOutUrl="/" />
      {user.emailAddresses && user.emailAddresses.length > 0 && (
        <p>{user.emailAddresses[0].emailAddress}</p>
      )}
    </div>
  );
};

export default MemberProfile;
