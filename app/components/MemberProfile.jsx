import { UserButton } from "@clerk/nextjs";
import { currentUser, auth } from "@clerk/nextjs/server";
import { fetchOrGenerateTokens } from "@/utils/actions";

const MemberProfile = async () => {
  const user = await currentUser();
  const { userId } = auth();
  await fetchOrGenerateTokens(userId);

  if (!user) {
    return <div>You are not logged in</div>;
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
