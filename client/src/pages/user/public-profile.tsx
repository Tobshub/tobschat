import { trpc } from "@utils/trpc";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

export default function PublicProfilePage() {
  const publicId = useLoaderData() as string;
  const publicProfile = trpc.user.getUserPublic.useQuery({ publicId });

  if (publicProfile.error) {
    return (
      <div>
        <h1>An error occured...</h1>
        <p>{publicProfile.error.message}</p>
      </div>
    );
  }
  if (!publicProfile.data) {
    return <>Loading...</>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2">
        <img
          src={`https://source.boringavatars.com/beam/120/${publicProfile.data.value.publicId}`}
          width={50}
          height={50}
        />
        <h1>{publicProfile.data.value.username}</h1>
      </div>
      <small>PublicId: {publicProfile.data.value.publicId}</small>
      <p>{publicProfile.data.value.bio}</p>
    </div>
  );
}

