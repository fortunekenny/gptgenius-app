import { fetchUserTokensById } from "@/utils/actions";
import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
export const dynamic = "force-dynamic";
const ProfilePage = async () => {
  const { userId } = auth();
  const currentTokens = await fetchUserTokensById(userId);
  return (
    <div>
      <h2 className="mb-8 ml-8 text-xl font-extrabold">
        Token Amount : {currentTokens}
      </h2>
      <UserProfile routing="hash" />
    </div>
  );
};
export default ProfilePage;
