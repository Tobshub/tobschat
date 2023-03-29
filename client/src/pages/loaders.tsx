import { getToken } from "@utils/token";
import { LoaderFunctionArgs, redirect } from "react-router-dom"


export async function landingPageLoader() {
  const token = getToken();
  if (token) {
    return { loggedIn: true };
  }
  return { loggedIn: false };
}

export async function publicProfilePageLoader({ params }: LoaderFunctionArgs) {
  const { publicId } = params;
  return publicId;
}

export async function roomPageLoader({ params }: LoaderFunctionArgs) {
  const { blob } = params;
  return blob;
}


export async function indexPageLoader() {
  const token = getToken();
  if (!token) {
    return redirect("/about");
  }
  return null;
}
